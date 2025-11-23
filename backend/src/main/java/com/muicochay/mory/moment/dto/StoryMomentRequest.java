package com.muicochay.mory.moment.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class StoryMomentRequest {
    private String mediaUrl;
    private String audioUrl;
    private String caption;
    private boolean milestone;
    private List<UUID> taggedUserIds;
}
