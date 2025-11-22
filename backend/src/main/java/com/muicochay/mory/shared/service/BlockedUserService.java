package com.muicochay.mory.shared.service;

import com.fantus.mory.shared.dto.BlockInfoResponse;
import com.fantus.mory.shared.enums.BlockLevel;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class BlockedUserService {
    private final StringRedisTemplate redisTemplate;

    private static final String BLOCK_EMAIL_PREFIX = "block::email::";

    public void block(UUID userId, BlockLevel level) {
        String key = getKey(userId);
        String value = level.name();
        Duration duration = level.getDuration();

        if (level.isPermanent()) {
            redisTemplate.opsForValue().set(key, value);
        } else {
            redisTemplate.opsForValue().set(key, value, duration);
        }
    }

    public void unblock(UUID userId) {
        redisTemplate.delete(getKey(userId));
    }

    public boolean isBlocked(UUID userId) {
        return redisTemplate.hasKey(getKey(userId));
    }

    public BlockLevel getBlockLevel(UUID userId) {
        String value = redisTemplate.opsForValue().get(getKey(userId));
        if (value == null) return null;

        try {
            return BlockLevel.valueOf(value);
        } catch (IllegalArgumentException e) {
            return null;
        }
    }

    private Duration getRemainingBlockTime(UUID userId) {
        long seconds = redisTemplate.getExpire(getKey(userId));
        if (seconds == -2 || seconds == 0) {
            return null;
        }
        if (seconds == -1) {
            return Duration.ZERO;
        }
        return Duration.ofSeconds(seconds);
    }

    public BlockInfoResponse getBlockInfo(UUID userId) {
        if (!isBlocked(userId)) return null;

        BlockLevel level = getBlockLevel(userId);
        Duration remaining = getRemainingBlockTime(userId);

        if (level == null || remaining == null) {
            return BlockInfoResponse.builder()
                    .level("UNKNOW")
                    .unblockAt(null)
                    .permanent(false)
                    .build();
        }

        if (level.isPermanent()) {
            return BlockInfoResponse.builder()
                    .level(level.name())
                    .unblockAt(null)
                    .permanent(true)
                    .build();
        }

        Instant unblockAt = Instant.now().plus(remaining);

        return BlockInfoResponse.builder()
                .level(level.name())
                .unblockAt(unblockAt)
                .permanent(false)
                .build();
    }

    private String getKey(UUID userId) {
        return BLOCK_EMAIL_PREFIX + userId;
    }
}
