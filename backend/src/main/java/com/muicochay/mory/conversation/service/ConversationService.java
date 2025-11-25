package com.muicochay.mory.conversation.service;

import com.muicochay.mory.connection.utils.ConnectionUtils;
import com.muicochay.mory.conversation.entity.Conversation;
import com.muicochay.mory.conversation.entity.ConversationMember;
import com.muicochay.mory.conversation.enums.ConversationMemberRole;
import com.muicochay.mory.conversation.enums.ConversationType;
import com.muicochay.mory.conversation.mapper.ChatMessageMapper;
import com.muicochay.mory.conversation.repository.ChatMessageRepository;
import com.muicochay.mory.conversation.repository.ConversationMemberRepository;
import com.muicochay.mory.conversation.repository.ConversationRepository;
import com.muicochay.mory.story.entity.Story;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ConversationService {
    private final ConversationRepository conversationRepository;
    private final ConversationMemberRepository conversationMemberRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final ChatMessageMapper chatMessageMapper;

    @Transactional
    public Conversation createPrivateConversation(UUID userA, UUID userB) {
        UUID id = ConnectionUtils.generateConnectionId(userA, userB);

        Optional<Conversation> existing = conversationRepository.findById(id);
        if (existing.isPresent()) {
            return existing.get();
        }

        Conversation conversation = Conversation.builder()
                .id(id)
                .type(ConversationType.PRIVATE)
                .build();

        conversationRepository.save(conversation);

        ConversationMember m1 = ConversationMember.builder()
                .conversation(conversation)
                .userId(userA)
                .build();

        ConversationMember m2 = ConversationMember.builder()
                .conversation(conversation)
                .userId(userB)
                .build();

        conversationMemberRepository.save(m1);
        conversationMemberRepository.save(m2);
        return conversation;
    }

    @Transactional
    public Conversation createStoryConversation(Story story) {

        UUID conversationId = story.getId();

        Optional<Conversation> existing = conversationRepository.findById(conversationId);
        if (existing.isPresent()) {
            return existing.get();
        }

        Conversation conversation = Conversation.builder()
                .id(conversationId)
                .type(ConversationType.GROUP)
                .build();

        conversationRepository.save(conversation);

        conversationMemberRepository.save(
                ConversationMember.builder()
                        .conversation(conversation)
                        .userId(story.getCreator().getId())
                        .role(ConversationMemberRole.ADMIN)
                        .build()
        );

        List<ConversationMember> members = story.getMembers().stream()
                .map(sm -> sm.getUser().getId())
                .filter(id -> !id.equals(story.getCreator().getId()))
                .map(id -> ConversationMember.builder()
                        .conversation(conversation)
                        .userId(id)
                        .role(ConversationMemberRole.MEMBER)
                        .build()
                )
                .toList();

        conversationMemberRepository.saveAll(members);

        return conversation;
    }

}
