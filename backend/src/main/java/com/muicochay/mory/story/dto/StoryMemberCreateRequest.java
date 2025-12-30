package com.muicochay.mory.story.dto;

import lombok.*;

import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class StoryMemberCreateRequest {
    private UUID storyId;
    private UUID userId;
}
