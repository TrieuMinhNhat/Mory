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
public class LastReadStatusDto {
    private UUID conversationId;
    private UUID userId;
    private UUID lastReadMessageId;
    private Instant lastReadAt;
}
