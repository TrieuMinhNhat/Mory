package com.muicochay.mory.story.service.impl;

import com.muicochay.mory.story.dto.StoryPreviewDto;
import com.muicochay.mory.story.entity.Story;
import com.muicochay.mory.story.repository.StoryRepository;
import com.muicochay.mory.story.service.StoryPreviewCacheService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StoryPreviewCacheServiceImpl implements StoryPreviewCacheService {

    private final StoryRepository storyRepository;
    private final RedisTemplate<String, Object> redisTemplate;

    private static final String KEY_PREFIX = "story:preview:";
    private static final long TTL_MINUTES = 30;

    private String key(UUID storyId) {
        return KEY_PREFIX + storyId;
    }

    // CORE CACHE METHOD
    private List<StoryPreviewDto> getCachedPreviews(Collection<UUID> storyIds) {
        if (storyIds == null || storyIds.isEmpty()) {
            return List.of();
        }

        List<UUID> ids = new ArrayList<>(storyIds);
        List<String> keys = ids.stream().map(this::key).toList();

        List<Object> cachedValues = redisTemplate.opsForValue().multiGet(keys);

        Map<UUID, StoryPreviewDto> result = new HashMap<>();
        List<UUID> missedIds = new ArrayList<>();

        for (int i = 0; i < ids.size(); i++) {
            Object cached = cachedValues == null ? null : cachedValues.get(i);
            if (cached instanceof StoryPreviewDto preview) {
                result.put(preview.getId(), preview);
            } else {
                missedIds.add(ids.get(i));
            }
        }

        if (!missedIds.isEmpty()) {
            List<Story> stories = storyRepository.findAllByIdsAndDeletedAtIsNull(missedIds);

            for (Story s : stories) {
                StoryPreviewDto preview = StoryPreviewDto.builder()
                        .id(s.getId())
                        .type(s.getType())
                        .title(s.getTitle())
                        .scope(s.getScope())
                        .duration(s.getDuration())
                        .build();

                redisTemplate.opsForValue()
                        .set(key(preview.getId()), preview, TTL_MINUTES, TimeUnit.MINUTES);

                result.put(preview.getId(), preview);
            }
        }

        return new ArrayList<>(result.values());
    }

    // PUBLIC API

    @Override
    public List<StoryPreviewDto> getPreviews(Collection<UUID> storyIds) {
        return getCachedPreviews(storyIds);
    }

    @Override
    public Map<UUID, StoryPreviewDto> getPreviewMap(Collection<UUID> storyIds) {
        return getCachedPreviews(storyIds).stream()
                .collect(Collectors.toMap(StoryPreviewDto::getId, s -> s));
    }

    @Override
    public void invalidate(UUID storyId) {
        redisTemplate.delete(key(storyId));
    }

    @Override
    public void invalidateAll(Collection<UUID> storyIds) {
        if (storyIds == null || storyIds.isEmpty()) return;
        redisTemplate.delete(
                storyIds.stream().map(this::key).toList()
        );
    }
}
