package com.muicochay.mory.conversation.repository;

import com.muicochay.mory.conversation.entity.ConversationMember;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ConversationMemberRepository extends JpaRepository<ConversationMember, UUID> {
    List<ConversationMember> findByUserId(UUID userId);

    List<ConversationMember> findByConversationId(UUID conversationId);

    ConversationMember findByConversationIdAndUserId(UUID conversationId, UUID userId);
}