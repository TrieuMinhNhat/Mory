package com.muicochay.mory.conversation.repository;

import com.muicochay.mory.conversation.entity.Conversation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface ConversationRepository extends JpaRepository<Conversation, UUID> {
}
