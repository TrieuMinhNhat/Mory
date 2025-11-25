package com.muicochay.mory.auth.service;

import com.muicochay.mory.auth.dto.forgotpassword.PasswordResetTokenData;
import com.muicochay.mory.shared.config.AppProperties;
import com.muicochay.mory.shared.exception.auth.InvalidResetPasswordTokenEx;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.UUID;
import java.util.concurrent.TimeUnit;

/**
 * Service responsible for generating, validating, and deleting password reset
 * tokens, using Redis as a temporary token store. Tokens are time-limited and
 * mapped to user emails.
 * <p>
 * The generated token is used in a reset password link that is sent to the
 * user's email.</p>
 */
@Service
@RequiredArgsConstructor
public class ResetPasswordRedisService {

    private final RedisTemplate<String, Object> redisTemplate;

    private final AppProperties appProperties;

    private static final String RESET_PASSWORD_TOKEN_KEY = "pwd::reset:";
    private static final long TOKEN_EXPIRY_MINUTES = 15;

    /**
     * Generates a reset password token, stores it in Redis with an expiration
     * time, and returns a frontend URL that includes the token as a query
     * parameter.
     * <p>
     * This link is intended to be sent to the user's email, and when clicked,
     * it will navigate the user to the password reset page on the frontend,
     * where the token will be used for validation.
     * </p>
     * Example returned URL:
     * {@code https://your-frontend-domain/reset-password?token=abc123?email=example@gmail.com}
     *
     * @param email the email of the user requesting password reset
     * @return a full frontend URL with the reset token and email as query
     * parameters
     */
    public String generateTokenAndLink(String email) {
        String token = UUID.randomUUID().toString();

        PasswordResetTokenData resetTokenData = PasswordResetTokenData.builder()
                .email(email)
                .build();

        String key = getKey(token);
        redisTemplate.opsForValue().set(key, resetTokenData, TOKEN_EXPIRY_MINUTES, TimeUnit.MINUTES);
        return UriComponentsBuilder
                .fromUriString(appProperties.getFrontendUrl() + appProperties.getResetPasswordPath())
                .queryParam("token", token)
                .queryParam("email", email)
                .build()
                .toUriString();

    }

    /**
     * Validates that the given token exists in Redis and matches the expected
     * email.
     *
     * @param token the token to validate
     * @param email the email to match against the stored token data
     * @throws InvalidResetPasswordTokenEx if the token is missing, expired, or
     * email doesn't match
     */
    public void validateToken(String token, String email) {
        String key = getKey(token);
        Object data = redisTemplate.opsForValue().get(key);
        if (!(data instanceof PasswordResetTokenData resetTokenData)) {
            throw new InvalidResetPasswordTokenEx("Token is invalid or expired");
        }
        if (!resetTokenData.getEmail().equals(email)) {
            throw new InvalidResetPasswordTokenEx("Token is invalid or expired");
        }
    }

    /**
     * Deletes a reset password token from Redis.
     *
     * @param token the token to delete
     */
    public void deleteToken(String token) {
        String key = getKey(token);
        redisTemplate.delete(key);
    }

    private String getKey(String token) {
        return RESET_PASSWORD_TOKEN_KEY + token;
    }
}
