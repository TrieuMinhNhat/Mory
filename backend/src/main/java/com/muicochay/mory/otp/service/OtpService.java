package com.muicochay.mory.otp.service;

import com.muicochay.mory.otp.config.OtpProperties;
import com.muicochay.mory.otp.enums.OtpType;
import com.muicochay.mory.shared.exception.otp.OtpExpiredEx;
import com.muicochay.mory.shared.exception.otp.OtpInvalidEx;
import lombok.RequiredArgsConstructor;
import org.apache.commons.codec.digest.DigestUtils;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.Random;
import java.util.UUID;

/**
 * Service for generating, storing, and verifying OTP codes.
 * <p>
 * OTPs are hashed and stored in Redis with an expiration time.
 * </p>
 */
@Service
@RequiredArgsConstructor
public class OtpService {
    private final StringRedisTemplate redisTemplate;
    private final OtpProperties otpProperties;

    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
    private static final Random random = new Random();

    /**
     * Generate a hashed Redis key to store the OTP using the type and user ID.
     *
     * @param type   the type of OTP (e.g., REGISTRATION, RESET_PASSWORD)
     * @param userId the ID of the user the OTP is for
     * @return the hashed Redis key used to store the OTP
     */
    private String otpKey(OtpType type, UUID userId) {
        String rawKey = type.name().toLowerCase() + ":" + userId;
        return "otp:" + DigestUtils.sha256Hex(rawKey);
    }


    /**
     * Generate a new OTP code for a user, hash it, and store it in Redis.
     *
     * @param type   the type of OTP
     * @param userId the ID of the user
     * @return the raw OTP code (not hashed)
     */
    public String generateOtp(OtpType type, UUID userId) {
        String key = otpKey(type, userId);
        String otp = String.format("%06d", random.nextInt(1_000_000));

        String encodedOtp = encoder.encode(otp);

        long ttlSeconds = otpProperties.getTtlSeconds().getOrDefault(type, 300);

        redisTemplate.opsForValue().set(
                key,
                encodedOtp,
                Duration.ofSeconds(ttlSeconds)
        );
        return otp;
    }

    /**
     * Validate the input OTP against the stored hashed OTP in Redis.
     * <p>
     * If valid, the OTP will be deleted from Redis. If not, an exception is thrown.
     * </p>
     *
     * @param type     the type of OTP
     * @param userId   the ID of the user
     * @param inputOtp the raw OTP code entered by the user
     * @throws OtpExpiredEx if no OTP is found in Redis (expired or never set)
     * @throws OtpInvalidEx if the OTP does not match the stored hash
     */
    public void verifyOtp(OtpType type, UUID userId, String inputOtp) {
        String key = otpKey(type, userId);
        String stored = redisTemplate.opsForValue().get(key);

        if (stored == null) {
            throw new OtpExpiredEx("OTP is expired");
        }

        if (encoder.matches(inputOtp, stored)) {
            redisTemplate.delete(key);
        } else {
            throw new OtpInvalidEx("Invalid Otp");
        }
    }
}
