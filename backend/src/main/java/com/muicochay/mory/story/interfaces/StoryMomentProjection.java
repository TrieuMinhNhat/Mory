package com.muicochay.mory.story.interfaces;

import java.time.Instant;
import java.util.UUID;

public interface StoryMomentProjection {
    UUID getStoryId();
    UUID getMomentId();
    String getMediaUrl();
    String getCaption();
    Integer getPosition();
    Long getTotal();
    Instant getFirstCreatedAt();
    Instant getLastCreatedAt();
}