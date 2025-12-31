package com.muicochay.mory.conversation.dto;

import com.muicochay.mory.conversation.enums.ConversationMemberRole;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ConversationMemberCreateRequest {
    private UUID userId;
    private UUID conversationId;
    private ConversationMemberRole role;
}
