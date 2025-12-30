package com.muicochay.mory.connection.service.impl;

import com.muicochay.mory.connection.entity.Connection;
import com.muicochay.mory.connection.enums.ConnectionStatus;
import com.muicochay.mory.connection.enums.ConnectionType;
import com.muicochay.mory.connection.repository.ConnectionRepository;
import com.muicochay.mory.connection.service.UserConnectionCacheService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserConnectionCacheServiceImpl implements UserConnectionCacheService {
    private final RedisTemplate<String, Object> redisTemplate;
    private final ConnectionRepository connectionRepository;

    private static final Duration TTL = Duration.ofDays(7);
    private static final Duration EMPTY_SET_TTL = Duration.ofMinutes(30);

    private static final String EMPTY_MARKER = "__EMPTY__";

    // --- Key builder ---

    private String allKey(UUID userId) {
        return "connection:user:" + userId + ":all";
    }

    private String typeKey(UUID userId, ConnectionType type) {
        return "connection:user:" + userId + ":type:" + type.name();
    }

    // --- Get ---

    @Override
    public Set<UUID> getAllConnectedUserIds(UUID userId) {
        ensureAllCache(userId);
        return readUuidSet(allKey(userId));
    }

    @Override
    public Set<UUID> getConnectedUserIdsByType(UUID userId, ConnectionType type) {
        ensureTypeCache(userId, type);
        return readUuidSet(typeKey(userId, type));
    }

    @Override
    public Set<UUID> getMutualConnectedUserIds(UUID userA, UUID userB) {
        ensureAllCache(userA);
        ensureAllCache(userB);

        Set<Object> intersect = redisTemplate
                .opsForSet()
                .intersect(allKey(userA), allKey(userB));

        return intersect == null || intersect.isEmpty()
                ? Set.of()
                : cast(intersect);
    }

    @Override
    public Set<UUID> getSecondDegreeUserIds(UUID userId) {
        ensureAllCache(userId);

        Set<UUID> directFriends = readUuidSet(allKey(userId));
        if (directFriends.isEmpty()) {
            return Set.of();
        }

        Set<UUID> secondDegree = new HashSet<>();

        for (UUID friendId : directFriends) {
            ensureAllCache(friendId);
            secondDegree.addAll(readUuidSet(allKey(friendId)));
        }

        secondDegree.remove(userId);
        secondDegree.removeAll(directFriends);

        return secondDegree;
    }

    @Override
    public Map<UUID, Integer> getSuggestedUserIdsWithScore(
            UUID userId,
            int limit
    ) {
        ensureAllCache(userId);

        Set<UUID> directFriends = readUuidSet(allKey(userId));
        if (directFriends.isEmpty()) {
            return Map.of();
        }

        Map<UUID, Integer> counter = new HashMap<>();

        for (UUID friendId : directFriends) {
            ensureAllCache(friendId);

            for (UUID candidate : readUuidSet(allKey(friendId))) {
                if (candidate.equals(userId)) continue;
                if (directFriends.contains(candidate)) continue;

                counter.merge(candidate, 1, Integer::sum);
            }
        }

        return counter.entrySet()
                .stream()
                .sorted(Map.Entry.<UUID, Integer>comparingByValue().reversed())
                .limit(limit)
                .collect(Collectors.toMap(
                        Map.Entry::getKey,
                        Map.Entry::getValue,
                        (a, b) -> a,
                        LinkedHashMap::new
                ));
    }

    // --- Write APIs ---

    @Override
    public void addConnectionForBothUsers(
            UUID userA,
            UUID userB,
            ConnectionType type
    ) {
        addForUser(userA, userB, type);
        addForUser(userB, userA, type);
    }

    @Override
    public void removeConnectionForBothUsers(
            UUID userA,
            UUID userB,
            ConnectionType type
    ) {
        removeForUser(userA, userB, type);
        removeForUser(userB, userA, type);
    }

    @Override
    public void changeTypeForBothUsers(
            UUID userA,
            UUID userB,
            ConnectionType oldType,
            ConnectionType newType
    ) {
        moveTypeForUser(userA, userB, oldType, newType);
        moveTypeForUser(userB, userA, oldType, newType);
    }

    // --- Internal write helpers ---

    private void addForUser(
            UUID userId,
            UUID otherUserId,
            ConnectionType type
    ) {
        redisTemplate.opsForSet().add(allKey(userId), otherUserId);
        redisTemplate.opsForSet().add(typeKey(userId, type), otherUserId);
        redisTemplate.expire(allKey(userId), TTL);
        redisTemplate.expire(typeKey(userId, type), TTL);
    }

    private void removeForUser(
            UUID userId,
            UUID otherUserId,
            ConnectionType type
    ) {
        redisTemplate.opsForSet().remove(allKey(userId), otherUserId);
        redisTemplate.opsForSet().remove(typeKey(userId, type), otherUserId);
    }

    private void moveTypeForUser(
            UUID userId,
            UUID otherUserId,
            ConnectionType oldType,
            ConnectionType newType
    ) {
        redisTemplate.opsForSet().remove(typeKey(userId, oldType), otherUserId);
        redisTemplate.opsForSet().add(typeKey(userId, newType), otherUserId);
        redisTemplate.expire(typeKey(userId, newType), TTL);
    }

    // --- Cache ensure ---

    private void ensureAllCache(UUID userId) {
        String key = allKey(userId);

        if (Boolean.TRUE.equals(redisTemplate.hasKey(key))) {
            return;
        }

        Set<UUID> ids = connectionRepository
                .findAllByUserAndStatus(userId, ConnectionStatus.CONNECTED)
                .stream()
                .map(c -> otherUserId(c, userId))
                .collect(Collectors.toSet());

        if (ids.isEmpty()) {
            cacheEmptySet(key, EMPTY_SET_TTL);
        } else {
            redisTemplate.opsForSet().add(key, ids.toArray());
            redisTemplate.expire(key, TTL);
        }
    }

    private void ensureTypeCache(UUID userId, ConnectionType type) {
        String key = typeKey(userId, type);

        if (Boolean.TRUE.equals(redisTemplate.hasKey(key))) {
            return;
        }

        Set<UUID> ids = connectionRepository
                .findAllByUserAndTypeAndStatus(userId, type, ConnectionStatus.CONNECTED)
                .stream()
                .map(c -> otherUserId(c, userId))
                .collect(Collectors.toSet());

        if (ids.isEmpty()) {
            cacheEmptySet(key, EMPTY_SET_TTL);
        } else {
            redisTemplate.opsForSet().add(key, ids.toArray());
            redisTemplate.expire(key, TTL);
        }
    }

    // --- Low-level helpers ---

    private void cacheEmptySet(String key, Duration ttl) {
        redisTemplate.opsForSet().add(key, EMPTY_MARKER);
        redisTemplate.opsForSet().remove(key, EMPTY_MARKER);
        redisTemplate.expire(key, ttl);
    }

    private void expireIfAbsent(String key, Duration ttl) {
        Long currentTtl = redisTemplate.getExpire(key);
        if (currentTtl == null || currentTtl < 0) {
            redisTemplate.expire(key, ttl);
        }
    }

    private Set<UUID> readUuidSet(String key) {
        Set<Object> raw = redisTemplate.opsForSet().members(key);
        return raw == null || raw.isEmpty() ? Set.of() : cast(raw);
    }

    private UUID otherUserId(Connection c, UUID userId) {
        return c.getUser1().getId().equals(userId)
                ? c.getUser2().getId()
                : c.getUser1().getId();
    }

    private Set<UUID> cast(Set<Object> set) {
        return set.stream()
                .map(o -> UUID.fromString(o.toString()))
                .collect(Collectors.toSet());
    }

}
