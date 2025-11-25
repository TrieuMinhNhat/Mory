package com.muicochay.mory.auth.service;

import com.muicochay.mory.auth.dto.refreshtoken.RefreshTokenRedisData;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.util.*;

/**
 * <h4>Service responsible for managing Refresh Tokens in Redis.</h4>
 *
 * <p>
 * It supports:</p>
 * <ul>
 * <li>Storing token session metadata (IP, User-Agent, etc.)</li>
 * <li>Limiting maximum concurrent sessions per user</li>
 * <li>Revoking tokens</li>
 * <li>Detecting reuse of revoked tokens (token theft/replay protection)</li>
 * </ul>
 *
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class RefreshTokenRedisService {

    private final RedisTemplate<String, Object> redisTemplate;

    @Value("${jwt.auth.refresh_expires_in}")
    private int refreshExpiresIn;

    private static final int MAX_SESSION_PER_USER = 3;
    private static final Duration LOCK_TIMEOUT = Duration.ofSeconds(3);
    private static final String TOKEN_KEY_PREFIX = "refresh::token:";
    private static final String USER_KEY_PREFIX = "refresh::user:";
    private static final String LOCK_KEY_PREFIX = "refresh::lock::user:";
    private static final Duration REVOKED_TOKEN_TTL = Duration.ofMinutes(30);

    /**
     * Builds the Redis key for storing session list of a specific user.
     *
     * @param userId The UUID of the user
     * @return Redis key as a string
     */
    private String userSessionKey(UUID userId) {
        return USER_KEY_PREFIX + userId;
    }

    /**
     * Builds the Redis key for storing a specific token's data.
     *
     * @param tokenId The ID of the refresh token
     * @return Redis key as a string
     */
    private String tokenDataKey(String tokenId) {
        return TOKEN_KEY_PREFIX + tokenId;
    }

    /**
     * Builds the Redis key for locking login operation per user.
     *
     * @param userId The UUID of the user
     * @return Redis key as a string
     */
    private String lockKey(UUID userId) {
        return LOCK_KEY_PREFIX + userId;
    }

    /**
     * <p>
     * Saves a refresh token session for the user.</p>
     * <p>
     * Applies a lock to prevent concurrent modifications.</p>
     * <p>
     * If number of active sessions exceeds max allowed, old sessions will be
     * revoked.</p>
     *
     * @param userId The UUID of the user
     * @param tokenId The refresh token ID
     * @param ip IP address of the client
     * @param userAgent User-Agent header from the client
     */
    public void saveSession(UUID userId, String tokenId, String ip, String userAgent) {
        String lockKey = lockKey(userId);
        Boolean acquired = redisTemplate.opsForValue()
                .setIfAbsent(lockKey, "1", LOCK_TIMEOUT);

        if (Boolean.TRUE.equals(acquired)) {
            try {
                doSaveSession(userId, tokenId, ip, userAgent);
            } finally {
                redisTemplate.delete(lockKey);
            }
        } else {
            log.warn("Too many concurrent logins for user {}. Lock is already held.", userId);
            throw new RuntimeException("Too many concurrent login requests. Please try again.");
        }
    }

    /**
     * Internal logic to persist the token session and handle max session
     * limits.
     */
    private void doSaveSession(UUID userId, String tokenId, String ip, String userAgent) {
        String userKey = userSessionKey(userId);
        String tokenKey = tokenDataKey(tokenId);
        Instant now = Instant.now();

        RefreshTokenRedisData data = RefreshTokenRedisData.builder()
                .userId(userId)
                .createAt(now.getEpochSecond())
                .ip(ip)
                .userAgent(userAgent)
                .revoked(false)
                .build();

        redisTemplate.opsForValue().set(tokenKey, data, Duration.ofSeconds(refreshExpiresIn));
        redisTemplate.opsForZSet().add(userKey, tokenId, now.getEpochSecond());
        redisTemplate.expire(userKey, Duration.ofSeconds(refreshExpiresIn));

        Long sessionCount = redisTemplate.opsForZSet().size(userKey);

        if (sessionCount != null && sessionCount > MAX_SESSION_PER_USER) {
            trimOldSessions(userId, sessionCount - MAX_SESSION_PER_USER);
        }
    }

    /**
     * Removes oldest sessions if user exceeds allowed session count.
     *
     * @param userId The UUID of the user
     * @param numberToRemove How many sessions to remove
     */
    private void trimOldSessions(UUID userId, long numberToRemove) {
        String userKey = userSessionKey(userId);

        Set<Object> oldestTokens = redisTemplate.opsForZSet()
                .range(userKey, 0, numberToRemove - 1);

        if (oldestTokens == null) {
            return;
        }

        for (Object tokenObj : oldestTokens) {
            String tokenId = tokenObj.toString();
            revokeToken(userId, tokenId);
            log.info("Trim old token {} for user {}", tokenId, userId);
        }
    }

    /**
     * Revokes a refresh token by marking it as revoked and storing it with a
     * shorter TTL to detect reuse.
     *
     * @param userId The UUID of the user
     * @param tokenId The refresh token ID
     */
    public void revokeToken(UUID userId, String tokenId) {
        String tokenKey = tokenDataKey(tokenId);
        Object data = redisTemplate.opsForValue().get(tokenKey);
        if (data instanceof RefreshTokenRedisData tokenData) {
            redisTemplate.opsForZSet().remove(userSessionKey(userId), tokenId);
            tokenData.setRevoked(true);
            redisTemplate.opsForValue().set(tokenKey, tokenData, REVOKED_TOKEN_TTL);
            log.info("Revoke token {} for user {}", tokenId, userId);
        }
    }

    /**
     * Validate whether a refresh token is still valid (not revoked, not
     * expired, still linked to user).
     *
     * @param userId The UUID of the user
     * @param tokenId The refresh token ID
     * @return true if valid, false otherwise
     */
    public boolean validateRefreshToken(UUID userId, String tokenId) {
        if (isTokenRevoked(tokenId)) {
            // suspicious activity
            log.warn("Refresh Token revoked - possible reuse attack: tokenId={}, userId={}", tokenId, userId);
            handleSuspiciousActivity(userId); //Action
            return false;
        }

        return isValid(userId, tokenId);
    }

    /**
     * Revokes all tokens for a user in case of suspicious activity.
     * <p>
     * This is used to mitigate reuse token attacks.</p>
     *
     * @param userId The UUID of the user
     */
    private void handleSuspiciousActivity(UUID userId) {
        //Action
        String userKey = userSessionKey(userId);
        Set<Object> allTokens = redisTemplate.opsForZSet().range(userKey, 0, -1);
        if (allTokens != null) {
            for (Object tokenObj : allTokens) {
                revokeToken(userId, tokenObj.toString());
            }
        }
        redisTemplate.delete(userKey);
    }

    /**
     * Checks if the token is valid (not revoked, still linked to user).
     *
     * @param userId The UUID of the user
     * @param tokenId The refresh token ID
     * @return true if the token is valid, false otherwise
     */
    public boolean isValid(UUID userId, String tokenId) {
        String tokenKey = tokenDataKey(tokenId);
        String userKey = userSessionKey(userId);

        Object data = redisTemplate.opsForValue().get(tokenKey);
        if (!(data instanceof RefreshTokenRedisData tokenData)) {
            return false;
        }

        if (!tokenData.getUserId().equals(userId)) {
            return false;
        }

        Double score = redisTemplate.opsForZSet().score(userKey, tokenId);
        if (score == null) {
            return false;
        }

        return !tokenData.isRevoked();
    }

    /**
     * Checks whether the token has been revoked.
     *
     * @param tokenId The refresh token ID
     * @return true if the token is revoked, false otherwise
     */
    public boolean isTokenRevoked(String tokenId) {
        String tokenKey = tokenDataKey(tokenId);
        Object data = redisTemplate.opsForValue().get(tokenKey);
        if (data instanceof RefreshTokenRedisData tokenData) {
            return tokenData.isRevoked();
        }
        return false;
    }
}
