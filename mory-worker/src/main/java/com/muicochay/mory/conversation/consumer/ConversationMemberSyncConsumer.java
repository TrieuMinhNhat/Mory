package com.muicochay.mory.conversation.consumer;

import com.muicochay.mory.conversation.dto.ConversationMemberUpdate;
import com.muicochay.mory.conversation.repository.ConversationMemberRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.*;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ConversationMemberSyncConsumer {

    private static final String PENDING_SET_KEY = "conversation_member_pending_set";

    private final RedisTemplate<String, String> redisTemplate;
    private final ConversationMemberRepository conversationMemberRepository;

    @Value("${sync.batch.flush.interval.ms}")
    private long flushIntervalMs;

    @Value("${sync.batch.chunk.size}")
    private int chunkSize;

    @Scheduled(fixedDelayString = "${sync.batch.flush.interval.ms:5000}")
    public void flushBufferToDb() {
        log.info("Starting flushBufferToDb()");
        try (Cursor<String> cursor = redisTemplate.opsForSet().scan(PENDING_SET_KEY, ScanOptions.NONE)) {

            List<String> chunk = new ArrayList<>(chunkSize);

            while (cursor.hasNext()) {
                String compositeKey = cursor.next();
                chunk.add(compositeKey);

                if (chunk.size() >= chunkSize) {
                    log.info("Processing chunk of size {}", chunk.size());
                    processChunk(chunk);
                    chunk.clear();
                }
            }

            if (!chunk.isEmpty()) {
                log.info("Processing final chunk of size {}", chunk.size());
                processChunk(chunk);
            }
            log.info("flushBufferToDb() finished");

        } catch (Exception e) {
            log.error("Error scanning Redis set", e);
        }
    }

    private void processChunk(List<String> chunk) {
        List<ConversationMemberUpdate> updates = chunk.stream()
                .map(compositeKey -> {
                    String[] parts = compositeKey.split(":");
                    if (parts.length != 2) return null;
                    UUID conversationId = UUID.fromString(parts[0]);
                    UUID userId = UUID.fromString(parts[1]);
                    String redisKey = buildRedisKey(conversationId, userId);

                    Map<Object, Object> rawMap = redisTemplate.opsForHash().entries(redisKey);
                    Map<String, String> map = rawMap.entrySet().stream()
                            .filter(e -> e.getKey() != null && e.getValue() != null)
                            .collect(Collectors.toMap(
                                    e -> e.getKey().toString(),
                                    e -> e.getValue().toString()
                            ));

                    return toUpdate(conversationId, userId, compositeKey, map);
                })
                .filter(Objects::nonNull)
                .collect(Collectors.toList());

        if (updates.isEmpty()) {
            log.debug("No valid updates in chunk, skipping DB write");
            return;
        }

        try {
            applyBatchUpdates(updates);
            log.info("Successfully updated {} records in DB", updates.size());

            redisTemplate.opsForSet().remove(PENDING_SET_KEY, (Object[]) chunk.toArray(new String[0]));
            log.debug("Removed {} compositeKeys from pending Redis Set", chunk.size());
        } catch (Exception ex) {
            log.error("DB batch write failed — will retry in next flush", ex);
        }
    }

    private ConversationMemberUpdate toUpdate(UUID conversationId, UUID userId, String compositeKey, Map<String, String> map) {
        if (map == null || map.isEmpty()) return null;

        String lastReadMessageIdStr = map.get("lastReadMessageId");
        Instant lastReadAt = null;
        if (map.get("lastReadAt") != null) {
            try {
                lastReadAt = Instant.parse(map.get("lastReadAt"));
            } catch (Exception e) {
                log.warn("Invalid lastReadAt in Redis for {}: {}", compositeKey, map.get("lastReadAt"));
            }
        }

        int unreadCount = 0;
        if (map.get("unreadCount") != null) {
            try {
                unreadCount = Integer.parseInt(map.get("unreadCount"));
            } catch (NumberFormatException e) {
                log.warn("Invalid unreadCount in Redis for {}: {}", compositeKey, map.get("unreadCount"));
            }
        }

        ObjectId lastReadMessageId = null;
        if (lastReadMessageIdStr != null) {
            try {
                lastReadMessageId = new ObjectId(lastReadMessageIdStr);
            } catch (IllegalArgumentException e) {
                log.warn("Invalid lastReadMessageId in Redis for {}: {}", compositeKey, lastReadMessageIdStr);
            }
        }

        return new ConversationMemberUpdate(conversationId, userId, compositeKey, lastReadMessageId, lastReadAt, unreadCount);
    }

    private void applyBatchUpdates(List<ConversationMemberUpdate> updates) {
        conversationMemberRepository.batchUpdate(updates);
    }

    private String buildRedisKey(UUID conversationId, UUID userId) {
        return "conversation:" + conversationId + ":member:" + userId;
    }
}
