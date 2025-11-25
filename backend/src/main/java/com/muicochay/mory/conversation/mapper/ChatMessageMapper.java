package com.muicochay.mory.conversation.mapper;

import com.muicochay.mory.conversation.document.ChatMessage;
import com.muicochay.mory.conversation.dto.ChatMessageResponse;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper(componentModel = "spring")
public interface ChatMessageMapper {
    ChatMessageResponse toResponse(ChatMessage chatMessage);
    List<ChatMessageResponse> toResponseList(List<ChatMessage> chatMessageList);
}
