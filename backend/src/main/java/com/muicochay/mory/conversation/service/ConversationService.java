package com.muicochay.mory.conversation.service;

import com.muicochay.mory.connection.utils.ConnectionUtils;
import com.muicochay.mory.conversation.dto.*;
import com.muicochay.mory.conversation.entity.ChatMessage;
import com.muicochay.mory.conversation.entity.Conversation;
import com.muicochay.mory.conversation.entity.ConversationMember;
import com.muicochay.mory.conversation.enums.ConversationMemberRole;
import com.muicochay.mory.conversation.enums.ConversationStatus;
import com.muicochay.mory.conversation.enums.ConversationType;
import com.muicochay.mory.conversation.helper.ChatMessageHelper;
import com.muicochay.mory.conversation.interfaces.ConversationUnreadProjection;
import com.muicochay.mory.conversation.repository.ChatMessageRepository;
import com.muicochay.mory.conversation.repository.ConversationMemberRepository;
import com.muicochay.mory.conversation.repository.ConversationRepository;
import com.muicochay.mory.moment.entity.Moment;
import com.muicochay.mory.moment.repository.MomentRepository;
import com.muicochay.mory.shared.exception.global.InvalidArgumentEx;
import com.muicochay.mory.shared.exception.global.ResourcesAccessDeniedEx;
import com.muicochay.mory.shared.exception.global.ResourcesNotFoundEx;
import com.muicochay.mory.story.entity.Story;
import com.muicochay.mory.user.entity.User;
import com.muicochay.mory.user.mapper.UserMapper;
import com.muicochay.mory.user.repositoriy.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ConversationService {
    private final ConversationRepository conversationRepository;
    private final ConversationMemberRepository conversationMemberRepository;
    private final UserRepository userRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final UserMapper userMapper;
    private final MomentRepository momentRepository;

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
                .title(story.getTitle())
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

    public void updateTitleForStoryConversation(UUID conversationId, String newTitle) {
        int updated = conversationRepository.updateTitle(conversationId, newTitle);
        if (updated == 0) {
            throw new RuntimeException("Conversation not found");
        }
    }

    @Transactional
    public void addMembersToStoryConversation(UUID conversationId, List<UUID> userIds) {
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new ResourcesNotFoundEx("Conversation not found"));

        if (conversation.getStatus() != ConversationStatus.ACTIVE) {
            throw new IllegalStateException("This conversation is no longer active.");
        }

        if (conversation.getType() != ConversationType.GROUP) {
            throw new InvalidArgumentEx("Only story (group) conversations can add members");
        }


        List<ConversationMemberCreateRequest> newMembers = userIds.stream()
                .map(id -> ConversationMemberCreateRequest.builder()
                        .conversationId(conversationId)
                        .userId(id)
                        .role(ConversationMemberRole.MEMBER)
                        .build()
                ).toList();

        conversationMemberRepository.saveAllIgnoreDuplicates(newMembers);
    }

    @Transactional
    public void kickMembersFromStoryConversation(UUID conversationId, List<UUID> userIds) {
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new RuntimeException("Conversation not found"));

        if (conversation.getStatus() != ConversationStatus.ACTIVE) {
            throw new IllegalStateException("This conversation is no longer active.");
        }

        if (conversation.getType() != ConversationType.GROUP) {
            throw new IllegalArgumentException("Only story (group) conversations can remove members");
        }
        int deletedCount = conversationMemberRepository.deleteByConversationIdAndUserIdIn(conversationId, userIds);
    }

    @Transactional
    public void leaveGroupConversation(UUID conversationId, UUID userId) {
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new RuntimeException("Conversation not found"));

        if (conversation.getStatus() != ConversationStatus.ACTIVE) {
            throw new IllegalStateException("This conversation is no longer active.");
        }
        if (conversation.getType() != ConversationType.GROUP) {
            throw new IllegalArgumentException("Cannot leave a private conversation");
        }
        conversationMemberRepository.deleteByConversationIdAndUserId(conversationId, userId);
    }

    @Transactional
    public void removeConversation(UUID conversationId) {
        conversationRepository.softDelete(conversationId, Instant.now());
    }

    @Transactional
    public void clearMessagesForUser(UUID conversationId, UUID userId) {
        ConversationMember member = conversationMemberRepository
                .findByConversationIdAndUserId(conversationId, userId)
                .orElseThrow(() -> new ResourcesNotFoundEx("Conversation member not found"));

        member.setClearedAt(Instant.now());
        conversationMemberRepository.save(member);
    }

    @Transactional(readOnly = true)
    public ConversationResponse getConversation(UUID conversationId, UUID requesterId) {
        Conversation conversation = conversationRepository.findByIdWithMembers(conversationId)
                .orElseThrow(() -> new RuntimeException("Conversation not found"));

        boolean isMember = conversation.getMembers().stream()
                .anyMatch(m -> m.getUserId().equals(requesterId));

        if (!isMember) {
            throw new ResourcesAccessDeniedEx(
                    "You do not have permission to access this conversation."
            );
        }

        if (conversation.getStatus() != ConversationStatus.ACTIVE) {
            throw new IllegalStateException("This conversation is no longer active.");
        }

        List<UUID> userIds = conversation.getMembers().stream()
                .map(ConversationMember::getUserId)
                .distinct()
                .toList();

        List<User> users = userRepository.findAllWithProfileByIds(userIds);
        Map<UUID, User> userMap = users.stream()
                .collect(Collectors.toMap(User::getId, u -> u));
        ConversationUnreadProjection unreadState = conversationMemberRepository.findUnreadCountByConversation(
                requesterId,
                conversationId
        );

        List<ConversationMemberDto> memberDtos = conversation.getMembers().stream()
                .map(m ->  ConversationMemberDto.builder()
                            .role(m.getRole())
                            .lastReadAt(m.getLastReadAt())
                            .lastReadMessageId(m.getLastReadMessageId())
                            .unreadCount(unreadState.getUnreadCount())
                            .user(userMapper.toProfilePreview(userMap.get(m.getUserId())))
                            .build())
                .toList();

        // 5. Build response
        return ConversationResponse.builder()
                .id(conversation.getId())
                .type(conversation.getType())
                .status(conversation.getStatus())
                .title(conversation.getTitle())
                .members(memberDtos)
                .build();
    }


    @Transactional(readOnly = true)
    public ConversationPageResponse getConversationsByUser(
            UUID userId,
            Instant cursorLastSentAt,
            UUID cursorId,
            int size
    ) {
        List<UUID> conversationIds = conversationRepository.findConversationIdsByUserKeyset(
                userId,
                cursorLastSentAt,
                cursorId,
                ConversationStatus.ACTIVE.name(),
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

        List<UUID> lastMessageIds = conversations.stream()
                .map(Conversation::getLastMessageId).toList();

        List<ChatMessage> lastMessages = lastMessageIds.isEmpty()
                ? Collections.emptyList()
                : chatMessageRepository.findAllById(lastMessageIds);

        List<UUID> repliedMomentIds = lastMessages.stream()
                .map(ChatMessage::getReplyToMomentId)
                .filter(Objects::nonNull)
                .toList();

        List<Moment> repliedMoments = repliedMomentIds.isEmpty()
                ? Collections.emptyList()
                : momentRepository.findAllById(repliedMomentIds);

        Map<UUID, Moment> repliedMomentMap = repliedMoments.stream()
                .collect(Collectors.toMap(Moment::getId, moment -> moment));

        List<UUID> replyToMessageIds = lastMessages.stream()
                .map(ChatMessage::getReplyToMessageId)
                .filter(Objects::nonNull)
                .distinct()
                .toList();

        List<ChatMessage> repliedMessages = replyToMessageIds.isEmpty()
                ? Collections.emptyList()
                : chatMessageRepository.findAllById(replyToMessageIds);

        Map<UUID, ChatMessage> lastMessageMap = lastMessages.stream()
                .collect(Collectors.toMap(ChatMessage::getConversationId, message -> message));

        Map<UUID, ChatMessage> repliedMessageMap = repliedMessages.stream()
                .collect(Collectors.toMap(ChatMessage::getId, msg -> msg));


        List<UUID> allUserIds = conversations.stream()
                .flatMap(c -> c.getMembers().stream())
                .map(ConversationMember::getUserId)
                .distinct()
                .toList();

        List<User> users = userRepository.findAllWithProfileByIds(allUserIds);

        Map<UUID, User> userMap = users.stream()
                .collect(Collectors.toMap(User::getId, u -> u));

        List<ConversationUnreadProjection> unreadStates = conversationMemberRepository.findUnreadCountsByConversationIdsNative(
                userId,
                conversations.stream().map(Conversation::getId).toList().toArray(UUID[]::new)
        );

        Map<UUID, Long> unreadMap = unreadStates.stream()
                .collect(Collectors.toMap(ConversationUnreadProjection::getConversationId, ConversationUnreadProjection::getUnreadCount));

        List<ConversationResponse> conversationResponses = conversations.stream()
                .map(c -> {
                    try {
                        ChatMessage lastMsg = lastMessageMap.get(c.getId());

                        ChatMessage repliedMessage = lastMsg == null
                                ? null
                                : repliedMessageMap.get(lastMsg.getReplyToMessageId());

                        Moment repliedMoment = lastMsg == null
                                ? null
                                : repliedMomentMap.get(lastMsg.getReplyToMomentId());

                        ChatMessageResponse lastMessageResponse = lastMsg == null
                                ? null
                                : ChatMessageResponse.builder()
                                .id(lastMsg.getId())
                                .conversationId(lastMsg.getConversationId())
                                .senderId(lastMsg.getSenderId())
                                .text(lastMsg.getText())
                                .repliedMessage(ChatMessageHelper.getRepliedMessageDto(repliedMessage))
                                .repliedMoment(ChatMessageHelper.getRepliedMomentDto(repliedMoment))
                                .createdAt(lastMsg.getCreatedAt())
                                .build();

                        return ConversationResponse.builder()
                                .id(c.getId())
                                .type(c.getType())
                                .status(c.getStatus())
                                .title(c.getTitle())
                                .lastMessage(lastMessageResponse)
                                .lastMessageSentAt(c.getLastMessageSentAt())
                                .members(
                                        c.getMembers().stream()
                                                .map(m -> {
                                                    return ConversationMemberDto.builder()
                                                            .role(m.getRole())
                                                            .lastReadAt(m.getLastReadAt())
                                                            .lastReadMessageId(m.getLastReadMessageId())
                                                            .unreadCount(unreadMap.get(c.getId()))
                                                            .user(userMapper.toProfilePreview(userMap.get(m.getUserId())))
                                                            .build();
                                                }).toList()
                                )
                                .build();
                    } catch (Exception e) {
                        return null;
                    }
                        }
                ).toList();
        return ConversationPageResponse.builder()
                .conversations(conversationResponses)
                .hasNext(hasNext)
                .nextCursorLastSentAt(nextCursorLastSentAt)
                .nextCursorId(nextCursorId)
                .build();
    }
}
