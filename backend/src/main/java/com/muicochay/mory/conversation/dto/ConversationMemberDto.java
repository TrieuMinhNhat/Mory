package com.muicochay.mory.conversation.dto;

import com.muicochay.mory.conversation.enums.ConversationMemberRole;
import com.muicochay.mory.user.dto.UserPreviewResponse;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ConversationMemberDto {
    private UserPreviewResponse user;
    private ConversationMemberRole role;
    private String lastReadMessageId;
    private Instant lastReadAt;
    private int unreadCount = 0;
}
