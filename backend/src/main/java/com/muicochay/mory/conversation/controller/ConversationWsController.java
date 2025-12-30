package com.muicochay.mory.conversation.controller;

import com.muicochay.mory.conversation.dto.*;
import com.muicochay.mory.conversation.service.ChatMessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Controller;

import java.security.Principal;
import java.util.UUID;

@Controller
@RequiredArgsConstructor
public class ConversationWsController {
    private final ChatMessageService chatMessageService;

    @MessageMapping("/chat/messages")
    public void sendMessage(
            @Payload ChatMessageRequest request,
            Principal principal
    ) {
        UUID senderId = UUID.fromString(principal.getName());
        chatMessageService.createChatMessage(senderId, request);
    }

    @MessageMapping("/chat/lastReadStatus")
    public void updateLastReadStatus(
            @Payload UpdateLastReadStatusRequest request,
            Principal principal
    ) {
        UUID requesterId = UUID.fromString(principal.getName());
        chatMessageService.updateLastReadStatus(request, requesterId);
    }
}
