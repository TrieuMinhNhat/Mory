package com.muicochay.mory.conversation.dto;

import com.muicochay.mory.conversation.enums.ConversationMemberRole;
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
public class ConversationMemberCache {
    private UUID id;
    private UUID userId;
    private ConversationMemberRole role;
    private UUID lastReadMessageId;
    private Instant lastReadAt;
    private Instant clearedAt;
    private int unreadCount;
}
