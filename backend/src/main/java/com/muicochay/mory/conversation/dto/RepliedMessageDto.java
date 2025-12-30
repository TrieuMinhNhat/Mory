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
public class RepliedMessageDto {
    private UUID id;
    private UUID conversationId;
    private UUID senderId;
    private String text;
    private Instant createdAt;
    private Instant lastModifiedAt;
}
