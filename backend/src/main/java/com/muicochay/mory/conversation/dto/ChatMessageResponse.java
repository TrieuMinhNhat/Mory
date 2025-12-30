package com.muicochay.mory.conversation.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ChatMessageResponse {
    private UUID id;
    private UUID conversationId;
    private UUID senderId;
    private String text;
    private RepliedMomentDto repliedMoment;
    private RepliedMessageDto repliedMessage;
    private Instant createdAt;
    private Instant lastModifiedAt;
}
