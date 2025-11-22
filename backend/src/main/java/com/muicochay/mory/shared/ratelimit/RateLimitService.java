package com.muicochay.mory.shared.ratelimit;

import lombok.RequiredArgsConstructor;
import org.apache.commons.codec.digest.DigestUtils;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;

/**
 * Service that handles Redis-backed rate-limiting logic.
 */
@Service
@RequiredArgsConstructor
public class RateLimitService {
    private final StringRedisTemplate redisTemplate;

    /**
     * Checks whether the requester is allowed to proceed under the rate limit.
     *
     * @param prefix         key prefix for Redis storage
     * @param identifier     unique user/IP/custom identifier
     * @param limit          max allowed requests
     * @param windowSeconds  time window in seconds
     * @return true if allowed, false if rate limit is exceeded
     */
    public boolean isAllowed(String prefix, String identifier, int limit, int windowSeconds) {
        String hashedIdentifier = DigestUtils.sha256Hex(identifier);
        String key = prefix + "::" + hashedIdentifier;

        Long current = redisTemplate.opsForValue().increment(key);
        if (current != null && current == 1) {
            redisTemplate.expire(key, Duration.ofSeconds(windowSeconds));
        }

        return current != null && current <= limit;
    }
}
