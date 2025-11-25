package com.muicochay.mory.auth.config;

import com.muicochay.mory.auth.enums.AuthProvider;
import com.muicochay.mory.auth.model.AuthUserPrincipal;
import com.muicochay.mory.auth.enums.TokenType;
import com.muicochay.mory.auth.helper.AuthHelper;
import jakarta.annotation.Nullable;
import jakarta.servlet.FilterChain;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetails;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.util.List;
import java.util.Objects;
import java.util.UUID;

@Component
@RequiredArgsConstructor
@Slf4j
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtTokenHelper jwtTokenHelper;

    private static final List<String> WHITE_LIST = List.of(
            "/api/auth/sign-out",
            "/api/auth/refresh",
            "/api/auth/forgot-password",
            "/api/auth/reset-password",
            "/api/auth/check-email",
            "/api/auth/email-otp/send-otp",
            "/api/auth/email-otp/sign-in",
            "/api/auth/email-password/sign-in",
            "/api/auth/email-password/sign-up"
    );

    @Override
    protected void doFilterInternal(@Nullable HttpServletRequest request, @Nullable HttpServletResponse response, @Nullable FilterChain filterChain) {
        try {
            String path = Objects.requireNonNull(request).getRequestURI();
            HttpMethod method = HttpMethod.valueOf(request.getMethod());
            if (isWhitelisted(path) && method == HttpMethod.POST) {
                if (filterChain != null) {
                    filterChain.doFilter(request, response);
                }
                return;
            }
            String authToken = jwtTokenHelper.getToken(request);
            if (authToken != null) {
                UUID userId = jwtTokenHelper.getUserIdFromToken(authToken);
                Boolean isVerified = jwtTokenHelper.getIsVerifiedFromToken(authToken);
                String roleCode = jwtTokenHelper.getRoleCodeFromToken(authToken);
                AuthProvider currentProvider = jwtTokenHelper.getProviderFromToken(authToken);

                if (userId != null && currentProvider != null
                        && isVerified != null && roleCode != null) {
                    if (jwtTokenHelper.validateToken(authToken, TokenType.ACCESS)) {
                        UserDetails userDetails = AuthUserPrincipal.builder()
                                .id(userId)
                                .verified(isVerified)
                                .authorities(AuthHelper.getAuthorities(roleCode))
                                .currentProvider(currentProvider)
                                .build();
                        if (userDetails != null) {
                            UsernamePasswordAuthenticationToken authenticationToken
                                    = new UsernamePasswordAuthenticationToken(
                                            userDetails,
                                            null,
                                            userDetails.getAuthorities());
                            authenticationToken.setDetails(new WebAuthenticationDetails(Objects.requireNonNull(request)));
                            SecurityContextHolder.getContext().setAuthentication(authenticationToken);
                        } else {
                            log.info("Token is invalid");
                        }
                    }
                } else {
                    log.info("Token's info is missing");
                }
            } else {
                log.info("Token is missing");
            }
            if (filterChain != null) {
                filterChain.doFilter(request, response);
            }
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    private boolean isWhitelisted(String path) {
        return WHITE_LIST.stream().anyMatch(path::startsWith);
    }
}
