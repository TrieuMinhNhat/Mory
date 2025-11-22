package com.muicochay.mory.shared.ratelimit;

import com.fantus.mory.shared.exception.ratelimit.RateLimitEx;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

/**
 * Aspect that intercepts method calls annotated with {@link RateLimit}
 * and applies rate limiting logic based on the configured strategy.
 */
@Aspect
@Component
@RequiredArgsConstructor
@Slf4j
public class RateLimitAspect {
    private final RateLimitService rateLimitService;

    /**
     * Intercepts methods annotated with {@code @RateLimit} and enforces the rate limit.
     *
     * @param joinPoint the method being intercepted
     * @param rateLimit the annotation parameters
     * @return result of the method execution
     * @throws Throwable if the method throws, or if the rate limit is exceeded
     */
    @Around("@annotation(rateLimit)")
    public Object applyRateLimit(ProceedingJoinPoint joinPoint, RateLimit rateLimit) throws Throwable {
        HttpServletRequest request = ((ServletRequestAttributes) RequestContextHolder.currentRequestAttributes()).getRequest();

        String identifier;
        switch (rateLimit.strategy()) {
            case PER_USER_ID -> identifier = getUserIdentifier();
            case PER_IP -> identifier = getClientIp(request);
            case PER_IP_AND_USER_ID -> identifier = getClientIp(request) + "::" + getUserIdentifier();
            case CUSTOM -> {
                if (rateLimit.customKey().isBlank()) {
                    throw new IllegalArgumentException("customKey must be set when using CUSTOM strategy");
                }
                identifier = getCustomKeyFromArgs(rateLimit.customKey(), joinPoint);
            }
            case PER_IP_AND_CUSTOM -> {
                if (rateLimit.customKey().isBlank()) {
                    throw new IllegalArgumentException("customKey must be specified for PER_IP_AND_CUSTOM strategy");
                }
                String custom = getCustomKeyFromArgs(rateLimit.customKey(), joinPoint);
                String ip = getClientIp(request);
                identifier = ip + "::" + custom;
            }
            default -> throw new IllegalArgumentException("Unknown strategy: " + rateLimit.strategy());
        }

        boolean allowed = rateLimitService.isAllowed(
                rateLimit.prefix(),
                identifier,
                rateLimit.limit(),
                rateLimit.windowSeconds()
        );

        if (!allowed) {
            throw new RateLimitEx("Too many requests, please try again later.");
        }

        return joinPoint.proceed();
    }

    private String getUserIdentifier() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        return (authentication != null && authentication.isAuthenticated()) ? "user:" + authentication.getName() : "user:anonymous";
    }

    private String getClientIp(HttpServletRequest request) {
        String xfHeader = request.getHeader("X-Forwarded-For");
        return "ip:" + (xfHeader != null ? xfHeader.split(",")[0] : request.getRemoteAddr());
    }

    private String getCustomKeyFromArgs(String customKey, ProceedingJoinPoint joinPoint) {
        String[] parts = customKey.split("\\.");
        Object value = null;
        String argName = parts[0];
        String fieldName = parts.length > 1 ? parts[1] : null;

        String[] paramNames = ((org.aspectj.lang.reflect.CodeSignature) joinPoint.getSignature()).getParameterNames();
        Object[] args = joinPoint.getArgs();

        for (int i = 0; i < paramNames.length; i++) {
            if (paramNames[i].equals(argName)) {
                value = args[i];
                break;
            }
        }

        if (value == null) throw new IllegalArgumentException("Custom key param not found: " + argName);

        if (fieldName != null) {
            try {
                var filed = value.getClass().getDeclaredField(fieldName);
                filed.setAccessible(true);
                Object fieldValue = filed.get(value);
                return "custom::" + (fieldValue != null ? fieldValue.toString() : "null");
            } catch (NoSuchFieldException | IllegalAccessException e) {
                throw new RuntimeException("Failed to resolve custom key path: " + customKey, e);
            }
        }
        return "custom::" + value.toString();
    }
}
