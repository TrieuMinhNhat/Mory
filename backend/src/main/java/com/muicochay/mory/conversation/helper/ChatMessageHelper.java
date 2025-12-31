package com.muicochay.mory.conversation.helper;

import com.muicochay.mory.conversation.dto.RepliedMessageDto;
import com.muicochay.mory.conversation.dto.RepliedMomentDto;
import com.muicochay.mory.conversation.entity.ChatMessage;
import com.muicochay.mory.moment.entity.Moment;

public class ChatMessageHelper {
    public static RepliedMessageDto getRepliedMessageDto(ChatMessage message) {
        if (message == null) return null;
        return RepliedMessageDto.builder()
                .id(message.getId())
                .conversationId(message.getConversationId())
                .senderId(message.getSenderId())
                .text(message.getText())
                .createdAt(message.getCreatedAt())
                .lastModifiedAt(message.getLastModifiedAt())
                .build();
    }

    public static RepliedMomentDto getRepliedMomentDto(Moment moment) {
        if (moment == null) return null;
        return RepliedMomentDto.builder()
                .id(moment.getId())
                .userId(moment.getUser().getId())
                .mediaUrl(moment.getMediaUrl())
                .caption(moment.getCaption())
                .createdAt(moment.getCreatedAt())
                .build();
    }
}
