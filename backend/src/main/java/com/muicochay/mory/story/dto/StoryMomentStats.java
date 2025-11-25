package com.muicochay.mory.story.dto;

import java.time.Instant;
import java.util.UUID;

public record StoryMomentStats(
        UUID storyId,
        long totalMoments,
        Instant firstCreatedAt,
        Instant lastCreatedAt
) {
}
