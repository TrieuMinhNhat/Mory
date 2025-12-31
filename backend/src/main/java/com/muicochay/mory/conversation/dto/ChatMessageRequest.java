package com.muicochay.mory.conversation.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ChatMessageRequest {
    private UUID conversationId;
    private String text;
    private UUID recipientId;
    private UUID replyToMessageId;
    private UUID replyToMomentId;
}
