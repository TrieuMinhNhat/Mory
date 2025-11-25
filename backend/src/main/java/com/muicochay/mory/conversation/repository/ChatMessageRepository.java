package com.muicochay.mory.conversation.repository;

import com.muicochay.mory.conversation.document.ChatMessage;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.UUID;

public interface ChatMessageRepository extends MongoRepository<ChatMessage, String> {
    List<ChatMessage> findByConversationIdOrderByCreatedAtDesc(UUID conversationId);
}
