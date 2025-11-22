package com.muicochay.mory.shared.ratelimit;

import java.lang.annotation.*;

/**
 * Annotation to apply rate limiting to controller or service methods.
 * <p>Use in combination with {@link RateLimitAspect} and {@link RateLimitService}.</p>
 *
 * <p><b>Example usage:</b></p>
 * <pre>
 * {@code
 * @RateLimit(
 *     prefix = "login",
 *     limit = 5,
 *     windowSeconds = 60,
 *     strategy = RateLimitKeyStrategy.PER_IP
 * )
 * public void login() { ... }
 * }
 * </pre>
 */
@Target({ElementType.METHOD})
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface RateLimit {
    String prefix();
    int limit();
    int windowSeconds();
    RateLimitKeyStrategy strategy();
    String customKey() default "";
}
