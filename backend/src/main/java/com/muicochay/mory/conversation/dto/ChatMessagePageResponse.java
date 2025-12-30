package com.muicochay.mory.conversation.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ChatMessagePageResponse {
    private List<ChatMessageResponse> messages;

    private boolean hasNewer;
    private Instant newerCursorCreatedAt;
    private UUID newerCursorId;

    private boolean hasOlder;
    private Instant olderCursorCreatedAt;
    private UUID olderCursorId;

    private UUID anchorMessageId;
}
