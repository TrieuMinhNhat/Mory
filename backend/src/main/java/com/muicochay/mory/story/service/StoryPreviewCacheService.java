package com.muicochay.mory.story.service;

import com.muicochay.mory.story.dto.StoryPreviewDto;

import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.UUID;

public interface StoryPreviewCacheService {

    List<StoryPreviewDto> getPreviews(Collection<UUID> storyIds);

    Map<UUID, StoryPreviewDto> getPreviewMap(Collection<UUID> storyIds);

    void invalidate(UUID storyId);

    void invalidateAll(Collection<UUID> storyIds);
}