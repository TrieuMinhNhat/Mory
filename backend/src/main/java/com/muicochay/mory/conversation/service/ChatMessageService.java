package com.muicochay.mory.conversation.service;

import com.muicochay.mory.connection.utils.ConnectionUtils;
import com.muicochay.mory.conversation.dto.*;
import com.muicochay.mory.conversation.entity.ChatMessage;
import com.muicochay.mory.conversation.entity.Conversation;
import com.muicochay.mory.conversation.entity.ConversationMember;
import com.muicochay.mory.conversation.enums.ConversationStatus;
import com.muicochay.mory.conversation.enums.MessageLoadDirection;
import com.muicochay.mory.conversation.helper.ChatMessageHelper;
import com.muicochay.mory.conversation.repository.ChatMessageRepository;
import com.muicochay.mory.conversation.repository.ConversationMemberRepository;
import com.muicochay.mory.conversation.repository.ConversationRepository;
import com.muicochay.mory.moment.entity.Moment;
import com.muicochay.mory.moment.repository.MomentRepository;
import com.muicochay.mory.shared.exception.global.InvalidArgumentEx;
import com.muicochay.mory.shared.exception.global.ResourcesAccessDeniedEx;
import com.muicochay.mory.shared.exception.global.ResourcesNotFoundEx;
import com.muicochay.mory.websocket.constants.WebsocketDestinations;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ChatMessageService {
    private final ChatMessageRepository chatMessageRepository;
    private final MomentRepository momentRepository;

    private final ConversationRepository conversationRepository;

    private final ConversationMemberRepository conversationMemberRepository;

    private final SimpMessagingTemplate messagingTemplate;

    @Transactional
    public void createChatMessage(
            UUID senderId,
            ChatMessageRequest request
    ) {
        validateReplyRequest(senderId, request);

        ResolvedConversation resolved =
                resolveConversationAndReply(senderId, request);

        ChatMessage savedMessage =
                saveChatMessage(senderId, request, resolved.conversation());

        ChatMessageResponse response =
                buildChatMessageResponse(
                        savedMessage,
                        resolved.repliedMessage(),
                        resolved.repliedMoment()
                );

        // push message
        resolved.conversation().getMembers().forEach(m ->
                messagingTemplate.convertAndSendToUser(
                        String.valueOf(m.getUserId()),
                        WebsocketDestinations.USER_QUEUE_MESSAGES,
                        response
                )
        );
    }

    private void validateReplyRequest(UUID senderId, ChatMessageRequest request) {
        if (request.getReplyToMomentId() != null
                && request.getReplyToMessageId() != null) {
            throw new InvalidArgumentEx("A message can only reply to either a moment or another message");
        }

        if (request.getReplyToMomentId() != null) {
            if (request.getRecipientId() == null) {
                throw new InvalidArgumentEx("Recipient is required when replying to a moment");
            }
            if (request.getRecipientId().equals(senderId)) {
                throw new InvalidArgumentEx("You cannot reply to your own moment");
            }
        }
    }

    private ResolvedConversation resolveConversationAndReply(
            UUID senderId,
            ChatMessageRequest request
    ) {
        Conversation conversation;
        ChatMessage repliedMessage = null;
        Moment repliedMoment = null;

        if (request.getReplyToMomentId() != null) {
            UUID conversationId = ConnectionUtils.generateConnectionId(
                    senderId,
                    request.getRecipientId());

            conversation = conversationRepository.findByIdWithMembers(conversationId)
                    .orElseThrow(() -> new RuntimeException("Conversation not found"));

            repliedMoment = momentRepository.findById(request.getReplyToMomentId())
                            .orElseThrow(() -> new InvalidArgumentEx("Reply-to moment does not exist"));

        } else {
            conversation = conversationRepository.findByIdWithMembers(request.getConversationId())
                    .orElseThrow(() -> new RuntimeException("Conversation not found"));

            if (request.getReplyToMessageId() != null) {
                repliedMessage = chatMessageRepository.findById(request.getReplyToMessageId())
                        .orElseThrow(() -> new InvalidArgumentEx("Reply-to message does not exist"));
            }
        }

        if (conversation.getStatus() != ConversationStatus.ACTIVE) {
            throw new IllegalStateException("This conversation is no longer active.");
        }

        return new ResolvedConversation(
                conversation,
                repliedMessage,
                repliedMoment
        );
    }

    private ChatMessage saveChatMessage(
            UUID senderId,
            ChatMessageRequest request,
            Conversation conversation
    ) {
        ChatMessage message = ChatMessage.builder()
                .conversationId(conversation.getId())
                .senderId(senderId)
                .text(request.getText())
                .replyToMessageId(request.getReplyToMessageId())
                .replyToMomentId(request.getReplyToMomentId())
                .build();

        ChatMessage saved =
                chatMessageRepository.save(message);

        conversationRepository.updateLastMessageInfo(
                conversation.getId(),
                saved.getId(),
                saved.getCreatedAt()
        );

        return saved;
    }

    private ChatMessageResponse buildChatMessageResponse(
            ChatMessage savedMessage,
            ChatMessage repliedMessage,
            Moment repliedMoment
    ) {
        return ChatMessageResponse.builder()
                .id(savedMessage.getId())
                .conversationId(savedMessage.getConversationId())
                .senderId(savedMessage.getSenderId())
                .text(savedMessage.getText())
                .repliedMessage(
                        ChatMessageHelper.getRepliedMessageDto(repliedMessage)
                )
                .repliedMoment(
                        ChatMessageHelper.getRepliedMomentDto(repliedMoment)
                )
                .createdAt(savedMessage.getCreatedAt())
                .lastModifiedAt(savedMessage.getLastModifiedAt())
                .build();
    }


    @Transactional
    public void updateLastReadStatus(
            UpdateLastReadStatusRequest request,
            UUID requesterId
    ) {
        Conversation conversation = conversationRepository.findByIdWithMembers(request.getConversationId())
                .orElseThrow(() -> new RuntimeException("Conversation not found"));

        if (conversation.getStatus() != ConversationStatus.ACTIVE) {
            throw new IllegalStateException("This conversation is no longer active.");
        }
        boolean isMember = conversation.getMembers().stream()
                .anyMatch(m -> m.getUserId().equals(requesterId));

        if (!isMember) {
            throw new ResourcesAccessDeniedEx(
                    "You do not have permission to access this conversation."
            );
        }

        Instant now = Instant.now();

        conversationMemberRepository.updateLastRead(
                requesterId,
                conversation.getId(),
                request.getMessageId(),
                now
        );

        LastReadStatusDto lastReadStatusDto = LastReadStatusDto.builder()
                .conversationId(conversation.getId())
                .userId(requesterId)
                .lastReadMessageId(request.getMessageId())
                .lastReadAt(now)
                .build();

        List<ConversationMember> members = conversation.getMembers();

        members.forEach(member ->
                messagingTemplate.convertAndSendToUser(
                        String.valueOf(member.getUserId()),
                        WebsocketDestinations.USER_QUEUE_LAST_READ_STATUS,
                        lastReadStatusDto
                ));
    }

    public ChatMessagePageResponse getChatMessagesByConversationId(
            UUID conversationId,
            UUID requesterId,
            Instant cursorCreatedAt,
            UUID cursorId,
            UUID messageId,
            MessageLoadDirection direction,
            int size
    ) {

        validateMember(conversationId, requesterId);

        // CASE 1️⃣: jump to message
        if (messageId != null) {
            return getMessagesAroundAnchor(
                    conversationId,
                    messageId,
                    size
            );
        }

        // CASE 2️⃣: normal paging
        return getMessagesByDirection(
                conversationId,
                cursorCreatedAt,
                cursorId,
                direction,
                size
        );
    }

    private ChatMessagePageResponse getMessagesByDirection(
            UUID conversationId,
            Instant cursorCreatedAt,
            UUID cursorId,
            MessageLoadDirection direction,
            int size
    ) {
        List<ChatMessage> messages;

        if (direction == MessageLoadDirection.OLDER) {
            messages = chatMessageRepository.findOlderThanCursor(
                    conversationId,
                    cursorCreatedAt,
                    cursorId,
                    size + 1
            );
        } else {
            messages = chatMessageRepository.findNewerThanCursor(
                    conversationId,
                    cursorCreatedAt,
                    cursorId,
                    size + 1
            );
            Collections.reverse(messages);
        }

        boolean hasMore = messages.size() > size;
        if (hasMore) {
            messages = messages.subList(0, size);
        }

        List<UUID> repliedMomentIds = messages.stream()
                .map(ChatMessage::getReplyToMomentId)
                .filter(Objects::nonNull)
                .toList();

        List<Moment> repliedMoments = repliedMomentIds.isEmpty()
                ? Collections.emptyList()
                : momentRepository.findAllById(repliedMomentIds);

        Map<UUID, Moment> repliedMomentMap = repliedMoments.stream()
                .collect(Collectors.toMap(Moment::getId, moment -> moment));

        List<UUID> allRepliedMessageIds = messages.stream()
                .map(ChatMessage::getReplyToMessageId)
                .filter(Objects::nonNull)
                .toList();

        Set<UUID> existingMessageIds = messages.stream()
                .map(ChatMessage::getId)
                .collect(Collectors.toSet());

        List<UUID> repliedMessageIdsToFetch = allRepliedMessageIds.stream()
                .filter(id -> !existingMessageIds.contains(id))
                .toList();

        List<ChatMessage> repliedMessagesFromDb = repliedMessageIdsToFetch.isEmpty()
                ? Collections.emptyList()
                : chatMessageRepository.findAllById(repliedMessageIdsToFetch);
        Map<UUID, ChatMessage> repliedMessagesFromDbMap = repliedMessagesFromDb.stream()
                .collect(Collectors.toMap(ChatMessage::getId, msg -> msg));

        Map<UUID, ChatMessage> repliedMessageMap = new HashMap<>();

        for (UUID replyId : allRepliedMessageIds) {
            ChatMessage replied = messages.stream()
                    .filter(m -> replyId.equals(m.getId()))
                    .findFirst()
                    .orElse(repliedMessagesFromDbMap.get(replyId));
            if (replied != null) {
                repliedMessageMap.put(replyId, replied);
            }
        }

        List<ChatMessageResponse> responses = messages.stream().map(
                m -> {
                    ChatMessage repliedMessage = repliedMessageMap.get(m.getReplyToMessageId());
                    Moment repliedMoment = repliedMomentMap.get(m.getReplyToMomentId());
                    return ChatMessageResponse.builder()
                            .id(m.getId())
                            .conversationId(m.getConversationId())
                            .senderId(m.getSenderId())
                            .text(m.getText())
                            .repliedMessage(ChatMessageHelper.getRepliedMessageDto(repliedMessage))
                            .repliedMoment(ChatMessageHelper.getRepliedMomentDto(repliedMoment))
                            .createdAt(m.getCreatedAt())
                            .lastModifiedAt(m.getLastModifiedAt())
                            .build();
                }).toList();

        if (direction == MessageLoadDirection.OLDER) {
            return ChatMessagePageResponse.builder()
                    .messages(responses)
                    .hasOlder(hasMore)
                    .olderCursorCreatedAt(
                            hasMore
                                    ? messages.getLast().getCreatedAt()
                                    : null)
                    .olderCursorId(
                            hasMore
                                    ? messages.getLast().getId()
                                    : null)
                    .build();
        }
        return ChatMessagePageResponse.builder()
                .messages(responses)
                .hasNewer(hasMore)
                .newerCursorCreatedAt(
                        hasMore
                                ? messages.getFirst().getCreatedAt()
                                : null)
                .newerCursorId(
                        hasMore
                                ? messages.getFirst().getId()
                                : null)
                .build();
    }

    private ChatMessagePageResponse getMessagesAroundAnchor(
            UUID conversationId,
            UUID anchorId,
            int size
    ) {
        ChatMessage anchor = chatMessageRepository
                .findByIdAndConversationId(anchorId, conversationId)
                .orElseThrow(() -> new ResourcesNotFoundEx("Message not found"));

        int halfSize = size / 2;

        List<ChatMessage> newer =
                chatMessageRepository.findNewerThan(
                        conversationId,
                        anchor.getCreatedAt(),
                        anchor.getId(),
                        PageRequest.of(0,halfSize + 1)
                );

        List<ChatMessage> older =
                chatMessageRepository.findOlderThan(
                        conversationId,
                        anchor.getCreatedAt(),
                        anchor.getId(),
                        PageRequest.of(0, halfSize + 1)

                );

        boolean hasNewer = newer.size() > halfSize;
        boolean hasOlder = older.size() > halfSize;

        if (hasNewer) newer = newer.subList(0, halfSize);
        if (hasOlder) older = older.subList(0, halfSize);

        Collections.reverse(newer);

        List<ChatMessage> messages = new ArrayList<>(newer);
        messages.add(anchor);
        messages.addAll(older);

        List<UUID> repliedMomentIds = messages.stream()
                .map(ChatMessage::getReplyToMomentId)
                .filter(Objects::nonNull)
                .toList();

        List<Moment> repliedMoments = repliedMomentIds.isEmpty()
                ? Collections.emptyList()
                : momentRepository.findAllById(repliedMomentIds);

        Map<UUID, Moment> repliedMomentMap = repliedMoments.stream()
                .collect(Collectors.toMap(Moment::getId, moment -> moment));

        List<UUID> allRepliedMessageIds = messages.stream()
                .map(ChatMessage::getReplyToMessageId)
                .filter(Objects::nonNull)
                .toList();

        Set<UUID> existingMessageIds = messages.stream()
                .map(ChatMessage::getId)
                .collect(Collectors.toSet());

        List<UUID> repliedMessageIdsToFetch = allRepliedMessageIds.stream()
                .filter(id -> !existingMessageIds.contains(id))
                .toList();

        List<ChatMessage> repliedMessagesFromDb = repliedMessageIdsToFetch.isEmpty()
                ? Collections.emptyList()
                : chatMessageRepository.findAllById(repliedMessageIdsToFetch);
        Map<UUID, ChatMessage> repliedMessagesFromDbMap = repliedMessagesFromDb.stream()
                .collect(Collectors.toMap(ChatMessage::getId, msg -> msg));

        Map<UUID, ChatMessage> repliedMessageMap = new HashMap<>();

        for (UUID replyId : allRepliedMessageIds) {
            ChatMessage replied = messages.stream()
                    .filter(m -> replyId.equals(m.getId()))
                    .findFirst()
                    .orElse(repliedMessagesFromDbMap.get(replyId));
            if (replied != null) {
                repliedMessageMap.put(replyId, replied);
            }
        }

        List<ChatMessageResponse> responses = messages.stream().map(
                m -> {
                    ChatMessage repliedMessage = repliedMessageMap.get(m.getReplyToMessageId());
                    Moment repliedMoment = repliedMomentMap.get(m.getReplyToMomentId());
                    return ChatMessageResponse.builder()
                            .id(m.getId())
                            .conversationId(m.getConversationId())
                            .senderId(m.getSenderId())
                            .text(m.getText())
                            .repliedMessage(ChatMessageHelper.getRepliedMessageDto(repliedMessage))
                            .repliedMoment(ChatMessageHelper.getRepliedMomentDto(repliedMoment))
                            .createdAt(m.getCreatedAt())
                            .lastModifiedAt(m.getLastModifiedAt())
                            .build();
                }).toList();



        return ChatMessagePageResponse.builder()
                .messages(responses)

                .hasNewer(hasNewer)
                .newerCursorCreatedAt(
                        hasNewer ? newer.getFirst().getCreatedAt() : null
                )
                .newerCursorId(
                        hasNewer ? newer.getFirst().getId() : null
                )

                .hasOlder(hasOlder)
                .olderCursorCreatedAt(
                        hasOlder ? older.getLast().getCreatedAt() : null
                )
                .olderCursorId(
                        hasOlder ? older.getLast().getId() : null
                )

                .anchorMessageId(anchor.getId())
                .build();
    }

    private void validateMember(UUID conversationId, UUID requesterId) {
        Conversation conversation = conversationRepository.findByIdWithMembers(conversationId)
                .orElseThrow(() -> new RuntimeException("Conversation not found"));

        boolean isMember = conversation.getMembers().stream()
                .anyMatch(m -> m.getUserId().equals(requesterId));

        if (!isMember) {
            throw new ResourcesAccessDeniedEx(
                    "You do not have permission to access this conversation."
            );
        }
    }

    public record ResolvedConversation(
            Conversation conversation,
            ChatMessage repliedMessage,
            Moment repliedMoment
    ) {}


}


