package com.muicochay.mory.conversation.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class RepliedMomentDto {
    private UUID id;
    private UUID userId;
    private String mediaUrl;
    private String caption;
    private Instant createdAt;
}
