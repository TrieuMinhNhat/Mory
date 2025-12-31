package com.muicochay.mory.user.service.impl;

import com.muicochay.mory.user.dto.UserContextCache;
import com.muicochay.mory.user.dto.UserPreviewResponse;
import com.muicochay.mory.user.dto.UserProfileCache;
import com.muicochay.mory.user.entity.UserProfile;
import com.muicochay.mory.user.repositoriy.UserProfileRepository;
import com.muicochay.mory.user.service.UserProfileCacheService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserProfileCacheServiceImpl implements UserProfileCacheService {
    private final UserProfileRepository userProfileRepository;
    private final RedisTemplate<String, Object> redisTemplate;

    private static final String KEY_PREFIX = "user:profile:";
    private static final long TTL_MINUTES = 30;

    private String key(UUID userId) {
        return KEY_PREFIX + userId.toString();
    }

    @Override
    public Map<UUID, UserProfileCache> getProfileMap(Collection<UUID> ids) {
        return getProfiles(new ArrayList<>(ids)).stream()
                .collect(Collectors.toMap(UserProfileCache::getId, p -> p));
    }

    @Override
    public Map<UUID, UserPreviewResponse> getPreviewMap(Collection<UUID> ids) {
        return getProfiles(new ArrayList<>(ids)).stream()
                .collect(Collectors.toMap(
                        UserProfileCache::getId,
                        p -> UserPreviewResponse.builder()
                                .id(p.getId())
                                .displayName(p.getDisplayName())
                                .avatarUrl(p.getAvatarUrl())
                                .build()
                ));
    }


    @Override
    public Map<UUID, UserContextCache> getContextMap(Collection<UUID> ids) {
        return getProfiles(new ArrayList<>(ids)).stream()
                .collect(Collectors.toMap(
                        UserProfileCache::getId,
                        p -> UserContextCache.builder()
                                .id(p.getId())
                                .timezone(p.getTimezone())
                                .locale(p.getLocale())
                                .build()
                ));
    }

    @Override
    public List<UserPreviewResponse> getPreviews(List<UUID> ids) {
        return getProfiles(ids).stream()
                .map(p -> UserPreviewResponse.builder()
                        .id(p.getId())
                        .displayName(p.getDisplayName())
                        .avatarUrl(p.getAvatarUrl())
                        .build())
                .toList();
    }

    private List<UserProfileCache> getProfiles(List<UUID> userIds) {
        if (userIds == null || userIds.isEmpty()) {
            return List.of();
        }

        List<String> keys = userIds.stream()
                .map(this::key)
                .toList();

        List<Object> cachedValues = redisTemplate.opsForValue().multiGet(keys);

        Map<UUID, UserProfileCache> result = new HashMap<>();
        List<UUID> missedIds = new ArrayList<>();

        for (int i = 0; i < userIds.size(); i++) {
            Object cached = cachedValues == null ? null : cachedValues.get(i);
            if (cached instanceof UserProfileCache profile) {
                result.put(profile.getId(), profile);
            } else {
                missedIds.add(userIds.get(i));
            }
        }

        if (!missedIds.isEmpty()) {
            List<UserProfile> profiles =
                    userProfileRepository.findAllByUserIds(missedIds);

            for (UserProfile p : profiles) {
                UserProfileCache cache = UserProfileCache.builder()
                        .id(p.getUser().getId())
                        .displayName(p.getDisplayName())
                        .avatarUrl(p.getAvatarUrl())
                        .timezone(p.getTimezone())
                        .locale(p.getLocale())
                        .build();

                redisTemplate.opsForValue()
                        .set(key(cache.getId()), cache, TTL_MINUTES, TimeUnit.MINUTES);

                result.put(cache.getId(), cache);
            }
        }

        return new ArrayList<>(result.values());
    }

    @Override
    public void invalidate(UUID userId) {
        if (userId == null) return;
        redisTemplate.delete(key(userId));
    }

    @Override
    public void invalidateAll(Collection<UUID> userIds) {
        if (userIds == null || userIds.isEmpty()) return;

        List<String> keys = userIds.stream()
                .map(this::key)
                .toList();

        redisTemplate.delete(keys);
    }
}
