package com.muicochay.mory.conversation.dto;

import com.muicochay.mory.conversation.enums.ConversationStatus;
import com.muicochay.mory.conversation.enums.ConversationType;
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
public class ConversationResponse {
    private UUID id;
    private ConversationType type;
    private ConversationStatus status;
    private String lastMessageId;
    private Instant lastMessageSentAt;
    private List<ConversationMemberDto> members;
}
