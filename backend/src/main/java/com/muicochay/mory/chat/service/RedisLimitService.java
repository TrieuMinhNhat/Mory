package com.muicochay.mory.chat.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RedisLimitService {
    private final StringRedisTemplate redisTemplate;
    private final ZoneId zone = ZoneId.systemDefault();


    /**
     * Increment a counter for a given type and id, with daily expiration at midnight.
     * Throws RuntimeException if limit is reached.
     *
     * @param type  type of action, e.g., "messages", "questions"
     * @param id    UUID of relationship or user
     * @param limit maximum allowed per day
     */
    public void checkAndIncrement(String type, UUID id, int limit) {
        LocalDate today = LocalDate.now(zone);
        String key = type + ":" + id + ":" + today;

        // Calculate duration until next midnight
        ZonedDateTime nextMidnight = today.plusDays(1).atStartOfDay(zone);
        Duration ttl = Duration.between(ZonedDateTime.now(zone), nextMidnight);

        // Initialize key if absent with TTL
        Boolean isNew = redisTemplate.opsForValue().setIfAbsent(key, "0", ttl);

        // Get current count
        Integer count = Optional.ofNullable(redisTemplate.opsForValue().get(key))
                .map(Integer::valueOf)
                .orElse(0);

        if (count >= limit) {
            throw new RuntimeException("Daily limit reached for " + type);
        }

        redisTemplate.opsForValue().increment(key);
    }
}
