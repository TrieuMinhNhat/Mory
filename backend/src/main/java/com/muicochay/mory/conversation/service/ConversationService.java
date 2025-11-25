package com.muicochay.mory.conversation.service;

import com.muicochay.mory.connection.utils.ConnectionUtils;
import com.muicochay.mory.conversation.dto.ConversationMemberDto;
import com.muicochay.mory.conversation.dto.ConversationPageResponse;
import com.muicochay.mory.conversation.dto.ConversationResponse;
import com.muicochay.mory.conversation.entity.Conversation;
import com.muicochay.mory.conversation.entity.ConversationMember;
import com.muicochay.mory.conversation.enums.ConversationMemberRole;
import com.muicochay.mory.conversation.enums.ConversationStatus;
import com.muicochay.mory.conversation.enums.ConversationType;
import com.muicochay.mory.conversation.mapper.ChatMessageMapper;
import com.muicochay.mory.conversation.repository.ChatMessageRepository;
import com.muicochay.mory.conversation.repository.ConversationMemberRepository;
import com.muicochay.mory.conversation.repository.ConversationRepository;
import com.muicochay.mory.story.entity.Story;
import com.muicochay.mory.user.entity.User;
import com.muicochay.mory.user.mapper.UserMapper;
import com.muicochay.mory.user.repositoriy.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ConversationService {
    private final ConversationRepository conversationRepository;
    private final ConversationMemberRepository conversationMemberRepository;
    private final UserRepository userRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final ChatMessageMapper chatMessageMapper;
    private final UserMapper userMapper;

    @Transactional
    public void createOrUpdatePrivateConversation(UUID userA, UUID userB, ConversationStatus status) {
        UUID id = ConnectionUtils.generateConnectionId(userA, userB);

        Optional<Conversation> existingConversation = conversationRepository.findById(id);
        if (existingConversation.isPresent()) {
            Conversation existing = existingConversation.get();
            if (existing.getStatus() != status) {
                existing.setStatus(status);
                conversationRepository.save(existing);
            }
            return;
        }

        Conversation conversation = Conversation.builder()
                .id(id)
                .type(ConversationType.PRIVATE)
                .status(status)
                .build();

        ConversationMember m1 = ConversationMember.builder()
                .conversation(conversation)
                .userId(userA)
                .role(ConversationMemberRole.MEMBER)
                .build();

        ConversationMember m2 = ConversationMember.builder()
                .conversation(conversation)
                .userId(userB)
                .role(ConversationMemberRole.MEMBER)
                .build();

        conversation.setMembers(Arrays.asList(m1, m2));
        conversationRepository.save(conversation);
    }

    @Transactional
    public void createStoryConversation(Story story) {

        UUID conversationId = story.getId();

        Optional<Conversation> existing = conversationRepository.findById(conversationId);
        if (existing.isPresent()) {
            return;
        }

        Conversation conversation = Conversation.builder()
                .id(conversationId)
                .status(ConversationStatus.ACTIVE)
                .type(ConversationType.GROUP)
                .build();

        ConversationMember adminMember = ConversationMember.builder()
                .conversation(conversation)
                .userId(story.getCreator().getId())
                .role(ConversationMemberRole.ADMIN)
                .build();

        List<ConversationMember> members = story.getMembers().stream()
                .map(sm -> sm.getUser().getId())
                .filter(id -> !id.equals(story.getCreator().getId()))
                .map(id -> ConversationMember.builder()
                        .conversation(conversation)
                        .userId(id)
                        .role(ConversationMemberRole.MEMBER)
                        .build())
                .toList();

        List<ConversationMember> allMembers = new ArrayList<>();
        allMembers.add(adminMember);
        allMembers.addAll(members);

        conversation.setMembers(allMembers);

        conversationRepository.save(conversation);
    }

    @Transactional
    public void updateStatusForStoryConversation(UUID conversationId, ConversationStatus status) {
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new RuntimeException("Conversation not found"));

        if (conversation.getType() != ConversationType.GROUP) {
            throw new IllegalArgumentException("Only story (group) conversations can update status with this method");
        }

        if (conversation.getStatus() != status) {
            conversation.setStatus(status);
            conversationRepository.save(conversation);
        }
    }

    @Transactional
    public void addMembersToStoryConversation(UUID conversationId, List<UUID> userIds) {
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new RuntimeException("Conversation not found"));

        if (conversation.getType() != ConversationType.GROUP) {
            throw new IllegalArgumentException("Only story (group) conversations can add members");
        }

        List<UUID> existingMemberIds = conversationMemberRepository.findByConversationIdAndUserIdIn(conversationId, userIds)
                .stream()
                .map(ConversationMember::getUserId)
                .toList();

        List<ConversationMember> newMembers = userIds.stream()
                .filter(id -> !existingMemberIds.contains(id))
                .map(id -> ConversationMember.builder()
                        .conversation(conversation)
                        .userId(id)
                        .role(ConversationMemberRole.MEMBER)
                        .build()
                ).toList();

        if (!newMembers.isEmpty()) {
            conversationMemberRepository.saveAll(newMembers);
        }
    }

    @Transactional
    public void kickMembersFromStoryConversation(UUID conversationId, List<UUID> userIds) {
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new RuntimeException("Conversation not found"));

        if (conversation.getType() != ConversationType.GROUP) {
            throw new IllegalArgumentException("Only story (group) conversations can remove members");
        }

        List<ConversationMember> membersToRemove = conversationMemberRepository.findByConversationIdAndUserIdIn(conversationId, userIds);

        if (!membersToRemove.isEmpty()) {
            conversationMemberRepository.deleteAll(membersToRemove);
        }
    }


    @Transactional(readOnly = true)
    public ConversationPageResponse getConversationsByUser(
            UUID userId,
            Instant cursorLastSentAt,
            UUID cursorId,
            String order,
            int size
    ) {
        boolean asc = "ASC".equalsIgnoreCase(order);

        List<UUID> conversationIds = conversationRepository.findConversationIdsByUserKeyset(
                userId,
                cursorLastSentAt,
                cursorId,
                ConversationStatus.ACTIVE.name(),
                asc,
                size + 1
        );

        if (conversationIds.isEmpty()) {
            return ConversationPageResponse.builder()
                    .conversations(List.of())
                    .hasNext(false)
                    .nextCursorLastSentAt(null)
                    .nextCursorId(null)
                    .build();
        }

        List<Conversation> unorderedConversations = conversationRepository.findAllByIdInWithMembers(conversationIds);

        Map<UUID, Conversation> conversationMap = unorderedConversations.stream()
                .collect(Collectors.toMap(Conversation::getId, c -> c));

        List<Conversation> conversations = conversationIds.stream()
                .map(conversationMap::get)
                .filter(Objects::nonNull)
                .toList();

        boolean hasNext = conversations.size() > size;
        if (hasNext) {
            conversations = conversations.subList(0, size);
        }

        Instant nextCursorLastSentAt = hasNext ? conversations.getLast().getLastMessageSentAt() : null;
        UUID nextCursorId = hasNext ? conversations.getLast().getId() : null;

        List<UUID> allUserIds = conversations.stream()
                .flatMap(c -> c.getMembers().stream())
                .map(ConversationMember::getUserId)
                .distinct()
                .toList();

        List<User> users = userRepository.findAllWithProfileByIds(allUserIds);

        Map<UUID, User> userMap = users.stream()
                .collect(Collectors.toMap(User::getId, u -> u));

        List<ConversationResponse> conversationResponses = conversations.stream()
                .map(c -> ConversationResponse.builder()
                        .id(c.getId())
                        .type(c.getType())
                        .status(c.getStatus())
                        .lastMessageId(c.getLastMessageId())
                        .lastMessageSentAt(c.getLastMessageSentAt())
                        .members(
                                c.getMembers().stream()
                                        .map(
                                                m -> ConversationMemberDto.builder()
                                                .role(m.getRole())
                                                .lastReadAt(m.getLastReadAt())
                                                .lastReadMessageId(m.getLastReadMessageId())
                                                .unreadCount(m.getUnreadCount())
                                                .user(userMapper.toProfilePreview(userMap.get(m.getUserId())))
                                                .build()
                                        ).toList()
                        )

                        .build()
                ).toList();

        return ConversationPageResponse.builder()
                .conversations(conversationResponses)
                .hasNext(hasNext)
                .nextCursorLastSentAt(nextCursorLastSentAt)
                .nextCursorId(nextCursorId)
                .build();
    }


}
