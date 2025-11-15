package com.muicochay.mory.story.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class StoryMomentPreviewDto {
    private UUID id;
    private String mediaUrl;
    private String caption;
    private Integer position;
}
