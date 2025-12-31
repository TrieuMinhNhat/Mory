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
public class MemberUnreadCountDto {
    private UUID conversationId;
    private UUID userId;
    private int unreadCount;
}
