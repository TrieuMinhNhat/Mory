package com.muicochay.mory.story.interfaces;

import java.util.UUID;

public interface StoryMomentCountProjection {
    UUID getStoryId();
    long getTotal();
}