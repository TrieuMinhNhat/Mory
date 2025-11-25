package com.muicochay.mory.connection.service;

import com.muicochay.mory.shared.config.AppProperties;
import com.muicochay.mory.shared.exception.global.ResourcesNotFoundEx;
import com.muicochay.mory.user.entity.User;
import com.muicochay.mory.user.entity.UserProfile;
import com.muicochay.mory.user.repositoriy.UserProfileRepository;
import com.muicochay.mory.user.repositoriy.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class InviteRedisService {

    private final StringRedisTemplate redisTemplate;
    private final UserRepository userRepository;
    private final UserProfileRepository userProfileRepository;
    private final AppProperties appProperties;

    private static final String INVITE_KEY_PREFIX = "invite:";
    private static final Duration TTL = Duration.ofMinutes(15);

    public String getOrCreateInviteLink(UUID ownerId) {
        String key = buildKey(ownerId);
        String code = redisTemplate.opsForValue().get(key);
        if (code == null) {
            code = UUID.randomUUID().toString();
            redisTemplate.opsForValue().set(key, code, TTL);
        }

        return String.format(appProperties.getFrontendUrl() + "/invite?code=%s&id=%s", code, ownerId);
    }

    public User verifyInvite(UUID ownerId, String code) {
        String key = buildKey(ownerId);
        String storedCode = redisTemplate.opsForValue().get(key);

        if (storedCode == null || !storedCode.equals(code)) {
            throw new ResourcesNotFoundEx("Invite link invalid or expired");
        }

        return userRepository.findWithProfileById(ownerId)
                .orElseThrow(() -> new ResourcesNotFoundEx("Owner not found with id " + ownerId));
    }

    public UserProfile getUserProfileByInviteToken(UUID ownerId, String code) {
        String key = buildKey(ownerId);
        String storedCode = redisTemplate.opsForValue().get(key);

        if (storedCode == null || !storedCode.equals(code)) {
            throw new ResourcesNotFoundEx("Invite link invalid or expired");
        }

        return userProfileRepository.findByUserId(ownerId)
                .orElseThrow(() -> new ResourcesNotFoundEx("Owner not found with id " + ownerId));
    }

    private String buildKey(UUID ownerId) {
        return INVITE_KEY_PREFIX + ownerId;
    }
}