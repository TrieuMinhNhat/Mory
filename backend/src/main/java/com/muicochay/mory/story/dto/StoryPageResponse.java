package com.muicochay.mory.story.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class StoryPageResponse {
    private List<StoryResponse> stories;
    private boolean hasNext;
    private Instant nextCursorCreatedAt;
    private UUID nextCursorId;
}
