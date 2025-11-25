package com.muicochay.mory.connection.service;

import com.muicochay.mory.connection.dto.*;
import com.muicochay.mory.connection.entity.Connection;
import com.muicochay.mory.connection.entity.ConnectionRequest;
import com.muicochay.mory.connection.enums.ConnectionStatus;
import com.muicochay.mory.connection.enums.ConnectionType;
import com.muicochay.mory.connection.enums.RequestStatus;
import com.muicochay.mory.connection.mapper.ConnectionMapper;
import com.muicochay.mory.connection.mapper.ConnectionRequestMapper;
import com.muicochay.mory.connection.repository.ConnectionRepository;
import com.muicochay.mory.connection.repository.ConnectionRequestRepository;
import com.muicochay.mory.connection.utils.ConnectionUtils;
import com.muicochay.mory.conversation.enums.ConversationStatus;
import com.muicochay.mory.conversation.service.ConversationService;
import com.muicochay.mory.shared.dto.ConnectionRequestAlreadyExistsExResponse;
import com.muicochay.mory.shared.dto.MaxRelationshipLimitResponse;
import com.muicochay.mory.shared.exception.connection.ConnectionRequestAlreadyExistsEx;
import com.muicochay.mory.shared.exception.connection.InvalidConnectionRequestEx;
import com.muicochay.mory.shared.exception.connection.MaxConnectionLimitEx;
import com.muicochay.mory.shared.exception.global.*;
import com.muicochay.mory.user.dto.UserPreviewWithMutualConnectionResponse;
import com.muicochay.mory.user.dto.UserProfileResponse;
import com.muicochay.mory.user.entity.User;
import com.muicochay.mory.user.entity.UserProfile;
import com.muicochay.mory.user.mapper.UserMapper;
import com.muicochay.mory.user.repositoriy.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ConnectionService {
    private final ConnectionRepository connectionRepository;
    private final ConnectionRequestRepository connectionRequestRepository;
    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final ConnectionRequestMapper connectionRequestMapper;
    private final ConnectionMapper connectionMapper;
    private final ConversationService conversationService;

    private final InviteRedisService inviteRedisService;


    public InviteLinkResponse getOrCreateInviteLink(UUID requesterId) {
        return InviteLinkResponse.builder()
                .link(inviteRedisService.getOrCreateInviteLink(requesterId))
                .build();
    }

    public UserProfileResponse getUserProfileByInviteToken(UUID userId, String code) {
        UserProfile userProfile = inviteRedisService.getUserProfileByInviteToken(userId, code);
        return UserProfileResponse.builder()
                .displayName(userProfile.getDisplayName())
                .avatarUrl(userProfile.getAvatarUrl())
                .build();
    }

    @Transactional
    public ConnectionRequestResponse sendConnectRequest(UUID senderId, SendConnectRequestDto request) {
        Integer maxCount = ConnectionType.FRIEND.getMaxCount();

        long count = connectionRepository.countByUserIdAndStatus(
                senderId, ConnectionStatus.CONNECTED
        );

        if (count >= maxCount) {
            throw new MaxConnectionLimitEx(
                    "User " + senderId + " reached max limit connection",
                    MaxRelationshipLimitResponse.builder()
                            .selfExceeded(true)
                            .build()
            );
        }
        User recipient;
        List<User> mutualConnections = userRepository.findMutualUsersByStatus(senderId, request.getRecipientId(), ConnectionStatus.CONNECTED);
        boolean hasMutualConnection = !mutualConnections.isEmpty();

        if (hasMutualConnection) {
            recipient = userRepository.findWithProfileById(request.getRecipientId())
                    .orElseThrow(() -> new ResourcesNotFoundEx("Recipient not found with id " + request.getRecipientId()));
        } else {
            recipient = inviteRedisService.verifyInvite(request.getRecipientId(), request.getCode());
        }

        if (recipient.getId().equals(senderId)) {
            throw new InvalidConnectionRequestEx("Cannot send request to yourself");
        }

        UUID connectionId = ConnectionUtils.generateConnectionId(senderId, recipient.getId());

        connectionRepository.findById(connectionId).ifPresent(c -> {
            switch (c.getStatus()) {
                case BLOCKED -> throw new InvalidConnectionRequestEx("Cannot send request: user is blocked");
                case CONNECTED -> throw new ResourceAlreadyExistsEx("Connection already exists");
            }
        });

        User sender = userRepository.getReferenceById(senderId);

        if (connectionRequestRepository.existsBetweenUsersAndStatusesAndOldConnectionTypeIsNull(
                recipient.getId(),
                sender.getId(),
                List.of(RequestStatus.PENDING)
        )) {
            throw new ConnectionRequestAlreadyExistsEx(
                    "Request already pending",
                    ConnectionRequestAlreadyExistsExResponse.builder()
                            .hasPendingRequest(true)
                            .build()
                    );
        }

        ConnectionRequest connectionRequest = ConnectionRequest.builder()
                .requester(sender)
                .recipient(recipient)
                .newConnectionType(ConnectionType.FRIEND)
                .message(request.getMessage())
                .status(RequestStatus.PENDING)
                .build();
        connectionRequestRepository.save(connectionRequest);
        return buildConnectionRequestResponse(connectionRequest, mutualConnections);
    }

    @Transactional
    public ConnectionResponse acceptConnectRequest(UUID currentUserId, UUID connectionRequestId) {
        ConnectionRequest connectionRequest = connectionRequestRepository.findByIdWithUsers(connectionRequestId)
                .orElseThrow(() -> new ResourcesNotFoundEx("Connection Request not found"));
        if (!currentUserId.equals(connectionRequest.getRecipient().getId())) {
            throw new ResourcesAccessDeniedEx("Only recipient can accept this request");
        }

        ConnectionType connectionType = connectionRequest.getNewConnectionType();
        if (connectionType != ConnectionType.FRIEND || connectionRequest.getOldConnectionType() != null) {
            throw new InvalidResourceStateEx("acceptConnectRequest only supports pending connect requests of type FRIEND");
        }

        Integer maxCount = ConnectionType.FRIEND.getMaxCount();

        long count = connectionRepository.countByUserIdAndStatus(
                currentUserId, ConnectionStatus.CONNECTED
        );

        if (count >= maxCount) {
            throw new MaxConnectionLimitEx(
                    "User " + currentUserId + " reached max limit connection",
                    MaxRelationshipLimitResponse.builder()
                            .selfExceeded(true)
                            .build()
            );
        }

        UUID otherUserId = currentUserId == connectionRequest.getRequester().getId()
                ? connectionRequest.getRecipient().getId()
                : connectionRequest.getRequester().getId();

        long countOther = connectionRepository.countByUserIdAndStatus(
                otherUserId, ConnectionStatus.CONNECTED
        );

        if (countOther >= maxCount) {
            throw new MaxConnectionLimitEx(
                    "User " + otherUserId + " reached max limit connection",
                    MaxRelationshipLimitResponse.builder()
                            .selfExceeded(false)
                            .build()
            );
        }

        UUID connectionId = ConnectionUtils.generateConnectionId(
                connectionRequest.getRequester().getId(),
                connectionRequest.getRecipient().getId()
        );
        Connection connection = connectionRepository.findByIdWithUsersAndProfiles(connectionId)
                .orElseGet(() -> Connection.builder()
                        .id(connectionId)
                        .user1(connectionRequest.getRequester())
                        .user2(connectionRequest.getRecipient())
                        .connectionType(connectionType)
                        .status(ConnectionStatus.CONNECTED)
                        .build());
        connection.setConnectionType(connectionType);

        connectionRequest.setStatus(RequestStatus.ACCEPTED);
        connectionRequestRepository.save(connectionRequest);
        List<User> mutualConnections = userRepository.findMutualUsersByStatus(
                connectionRequest.getRequester().getId(),
                connectionRequest.getRecipient().getId(),
                ConnectionStatus.CONNECTED
        );

        connectionRepository.save(connection);

        conversationService.createOrUpdatePrivateConversation(
                connection.getUser1().getId(),
                connection.getUser2().getId(),
                ConversationStatus.ACTIVE
        );

        return buildConnectionResponse(connection, mutualConnections);
    }

    @Transactional
    public Object changeConnectionType(
            UUID requesterId,
            ChangeConnectionTypeRequestDto request
    ) {
        if (requesterId.equals(request.getRecipientId())) {
            throw new InvalidArgumentEx("Cannot send request to yourself");
        }
        UUID connectionId = ConnectionUtils.generateConnectionId(requesterId, request.getRecipientId());
        Connection connection = connectionRepository.findByIdWithUsersAndProfiles(connectionId)
                .orElseThrow(() -> new ResourcesNotFoundEx("No existing connection found to upgrade"));

        if (connection.getStatus() != ConnectionStatus.CONNECTED) {
            throw new InvalidResourceStateEx("Cannot upgrade non-connected connection");
        }

        ConnectionType currentType = connection.getConnectionType();
        ConnectionType newType = request.getNewType();

        if (currentType == newType) {
            throw new ResourceAlreadyExistsEx("Already in this type");
        }

        boolean isUpgrade = newType.getLevel() > currentType.getLevel();

        if (isUpgrade) {
            checkConnectionLimit(requesterId, requesterId, request.getNewType());
            if (connectionRequestRepository.existsBetweenUsersAndStatusesAndOldConnectionTypeIsNotNull(
                    connection.getUser1().getId(),
                    connection.getUser2().getId(),
                    List.of(RequestStatus.PENDING)
            )) {
                throw new ConnectionRequestAlreadyExistsEx(
                        "Request already pending",
                        ConnectionRequestAlreadyExistsExResponse.builder()
                                .hasPendingRequest(true)
                                .build()
                );
            }

            User requester = requesterId.equals(connection.getUser1().getId()) ? connection.getUser1() : connection.getUser2();
            User recipient = requesterId.equals(connection.getUser1().getId()) ? connection.getUser2() : connection.getUser1();

            ConnectionRequest changeTypRequest = ConnectionRequest.builder()
                    .requester(requester)
                    .recipient(recipient)
                    .message(request.getMessage())
                    .newConnectionType(request.getNewType())
                    .oldConnectionType(connection.getConnectionType())
                    .status(RequestStatus.PENDING)
                    .build();
            connectionRequestRepository.save(changeTypRequest);
            List<User> mutualConnections = userRepository.findMutualUsersByStatus(requester.getId(), recipient.getId(), ConnectionStatus.CONNECTED);

            return buildConnectionRequestResponse(changeTypRequest, mutualConnections);
        }
        checkConnectionLimit(requesterId, requesterId, request.getNewType());
        checkConnectionLimit(requesterId, request.getRecipientId(), request.getNewType());
        connection.setConnectionType(newType);
        connectionRepository.save(connection);
        return buildConnectionResponse(connection, List.of());
    }

    @Transactional
    public ConnectionResponse acceptChangeConnectionTypeRequest(UUID currentUserId, UUID connectionRequestId) {
        ConnectionRequest changeTypeRequest = connectionRequestRepository.findByIdWithUsers(connectionRequestId)
                .orElseThrow(() -> new ResourcesNotFoundEx("Upgrade request not found"));

        if (!currentUserId.equals(changeTypeRequest.getRecipient().getId())) {
            throw new ResourcesAccessDeniedEx("Only recipient can accept this request");
        }

        Connection connection = connectionRepository.findById(
                ConnectionUtils.generateConnectionId(
                        changeTypeRequest.getRequester().getId(),
                        changeTypeRequest.getRecipient().getId()
                )
        ).orElseThrow(() -> new ResourcesNotFoundEx("Connection not found"));

        ConnectionType newType = changeTypeRequest.getNewConnectionType();

        checkConnectionLimit(currentUserId, connection.getUser1().getId(), newType);
        checkConnectionLimit(currentUserId, connection.getUser2().getId(), newType);

        connection.setConnectionType(newType);
        changeTypeRequest.setStatus(RequestStatus.ACCEPTED);
        connectionRequestRepository.save(changeTypeRequest);

        return buildConnectionResponse(connection, List.of());
    }

    @Transactional
    public ConnectionRequestResponse cancelRequest(UUID actorId, UUID connectionRequestId) {
        ConnectionRequest request = connectionRequestRepository.findByIdWithUsers(connectionRequestId)
                .orElseThrow(() -> new ResourcesNotFoundEx("Connection Request not found or not pending"));

        if (request.getStatus() != RequestStatus.PENDING) {
            throw new InvalidResourceStateEx("Only pending requests can be canceled/rejected");
        }

        if (!request.getRequester().getId().equals(actorId)) {
            throw new ResourcesAccessDeniedEx("Only the requester can cancel this request");
        }
        request.setStatus(RequestStatus.CANCELED);
        return connectionRequestMapper.toResponse(connectionRequestRepository.save(request));
    }

    @Transactional
    public ConnectionRequestResponse rejectRequest(UUID actorId, UUID connectionRequestId) {
        ConnectionRequest request = connectionRequestRepository.findByIdWithUsers(connectionRequestId)
                .orElseThrow(() -> new ResourcesNotFoundEx("Connection Request not found or not pending"));

        if (request.getStatus() != RequestStatus.PENDING) {
            throw new InvalidResourceStateEx("Only pending requests can be canceled/rejected");
        }

        if (!actorId.equals(request.getRecipient().getId())) {
            throw new ResourcesAccessDeniedEx("Only recipient can reject this request");
        }
        request.setStatus(RequestStatus.REJECTED);
        return connectionRequestMapper.toResponse(connectionRequestRepository.save(request));
    }

    @Transactional
    public void blockUser(UUID requesterId, UUID targetUserId) {
        UUID connectionId = ConnectionUtils.generateConnectionId(requesterId, targetUserId);

        connectionRequestRepository.findPendingRequestBetweenUsers(requesterId, targetUserId, RequestStatus.PENDING)
                .ifPresent(req -> {
                    req.setStatus(RequestStatus.CANCELED);
                    connectionRequestRepository.save(req);
                });

        Connection connection = connectionRepository.findById(connectionId)
                .orElseGet(() -> {
                    Connection r = new Connection();
                    r.setUser1(userRepository.getReferenceById(requesterId));
                    r.setUser2(userRepository.getReferenceById(targetUserId));
                    return r;
                });
        connection.setConnectionType(ConnectionType.NO_RELATION);
        connection.setStatus(ConnectionStatus.BLOCKED);

        conversationService.createOrUpdatePrivateConversation(
                connection.getUser1().getId(),
                connection.getUser2().getId(),
                ConversationStatus.BLOCKED
        );

        connectionRepository.save(connection);
    }

    @Transactional
    public void unblockUser(UUID requesterId, UUID targetUserId) {
        UUID connectionId = ConnectionUtils.generateConnectionId(requesterId, targetUserId);
        Connection connection = connectionRepository.findById(connectionId)
                .orElseThrow(() -> new ResourcesNotFoundEx("No connection exists"));

        if (connection.getStatus() != ConnectionStatus.BLOCKED) {
            throw new InvalidResourceStateEx("The user is not blocked");
        }
        conversationService.createOrUpdatePrivateConversation(
                connection.getUser1().getId(),
                connection.getUser2().getId(),
                ConversationStatus.INACTIVE
        );

        connection.setStatus(ConnectionStatus.INACTIVE);
    }

    @Transactional
    public void removeConnection(UUID requesterId, UUID targetUserId) {
        UUID connectionId = ConnectionUtils.generateConnectionId(requesterId, targetUserId);
        Connection connection = connectionRepository.findById(connectionId)
                .orElseThrow(() -> new ResourcesNotFoundEx("No connection exists"));

        if (connection.getStatus() == ConnectionStatus.INACTIVE) {
            throw new InvalidResourceStateEx("Connection is already inactive");
        }
        if (connection.getStatus() == ConnectionStatus.BLOCKED) {
            throw new InvalidResourceStateEx("Cannot remove a blocked connection");
        }

        connectionRequestRepository.findPendingRequestBetweenUsers(requesterId, targetUserId, RequestStatus.PENDING)
                .ifPresent(req -> {
                    req.setStatus(RequestStatus.CANCELED);
                    connectionRequestRepository.save(req);
                });

        connection.setStatus(ConnectionStatus.INACTIVE);
        connection.setConnectionType(ConnectionType.NO_RELATION);

        conversationService.createOrUpdatePrivateConversation(
                connection.getUser1().getId(),
                connection.getUser2().getId(),
                ConversationStatus.INACTIVE
        );
    }


    @Transactional(readOnly = true)
    public ConnectionPageResponse getUserConnections(UUID requesterId,
                                                       UUID userId,
                                                       Instant cursorCreatedAt,
                                                       UUID cursorId,
                                                       int size,
                                                       ConnectionType type,
                                                       ConnectionStatus status,
                                                       String order) {
        if (!requesterId.equals(userId)) {
            UUID connectionId = ConnectionUtils.generateConnectionId(requesterId, userId);
            boolean connected = connectionRepository.existsDirectOrMutualConnection(
                    connectionId,
                    requesterId,
                    userId,
                    ConnectionStatus.CONNECTED.name()
            );
            if (!connected) {
                throw new ResourcesAccessDeniedEx("Connection not found or you do not have access");
            }
        }
        boolean asc = "ASC".equalsIgnoreCase(order);
        List<UUID> connectionIds =
                connectionRepository.findIdsKeyset(
                        userId,
                        cursorCreatedAt,
                        cursorId,
                        type != null ? type.name() : null,
                        status != null ? status.name() : null,
                        asc,
                        size + 1
                );

        List<Connection> unOrderedConnections = connectionRepository.findAllWithUsersAndProfiles(connectionIds);
        Map<UUID, Connection> map = unOrderedConnections.stream()
                .collect(Collectors.toMap(Connection::getId, r -> r));

        List<Connection> connections = connectionIds.stream()
                .map(map::get)
                .toList();

        boolean hasNext = connections.size() > size;
        if (hasNext) connections = connections.subList(0, size);
        Instant nextCursorCreatedAt = hasNext ? connections.getLast().getCreatedAt() : null;
        UUID nextCursorId = hasNext ? connections.getLast().getId() : null;

        List<ConnectionResponse> responses;
        if (requesterId.equals(userId)) {
            List<UUID> otherUserIds = connections.stream()
                    .map(r -> r.getUser1().getId().equals(requesterId) ? r.getUser2().getId() : r.getUser1().getId())
                    .filter(id -> !id.equals(requesterId))
                    .toList();
            List<Object[]> rawMutualConnections = userRepository.findMutualConnectionsBatch(
                    requesterId, otherUserIds, ConnectionStatus.CONNECTED
            );
            Map<UUID, List<User>> mutualMap = rawMutualConnections.stream()
                    .collect(Collectors.groupingBy(
                            row -> (UUID) row[2],
                            Collectors.mapping(row -> (User) row[0], Collectors.toList())
                    ));
            responses = connections.stream()
                    .map(c -> {
                        UUID otherId = c.getUser1().getId().equals(userId) ? c.getUser2().getId() : c.getUser1().getId();
                        List<User> mutualConnections = mutualMap.getOrDefault(otherId, List.of());
                        return buildConnectionResponse(c, mutualConnections.stream().filter(u -> !u.getId().equals(otherId)).toList());
                    })
                    .toList();

        } else {
            List<UUID> otherUserIds = connections.stream()
                    .map(r -> r.getUser1().getId().equals(userId) ? r.getUser2().getId() : r.getUser1().getId())
                    .toList();

            List<Object[]> rawMutualConnections = userRepository.findMutualConnectionsBatch(
                    requesterId, otherUserIds, ConnectionStatus.CONNECTED
            );
            Map<UUID, List<User>> mutualMap = rawMutualConnections.stream()
                    .collect(Collectors.groupingBy(
                            row -> (UUID) row[2],
                            Collectors.mapping(row -> (User) row[0], Collectors.toList())
                    ));

            List<UUID> requesterConnectionIds = otherUserIds.stream()
                    .filter(id -> !id.equals(requesterId) && !id.equals(userId))
                    .map(id -> ConnectionUtils.generateConnectionId(id, requesterId))
                    .toList();

            List<Connection> requesterConnections = connectionRepository.findAllWithUsersAndProfiles(requesterConnectionIds);

            Map<UUID, Connection> requesterConnectionMap = requesterConnections.stream()
                    .collect(Collectors.toMap(
                            c -> {
                                UUID u1 = c.getUser1().getId();
                                UUID u2 = c.getUser2().getId();
                                return u1.equals(requesterId) ? u2 : u1;
                            },
                            c -> c
                    ));


            responses = connections.stream()
                    .map(c -> {
                        UUID otherId = c.getUser1().getId().equals(userId) ? c.getUser2().getId() : c.getUser1().getId();
                        Connection connectionWithRequester = requesterConnectionMap.get(otherId);
                        List<User> mutualConnections = mutualMap.getOrDefault(otherId, List.of());
                        if (connectionWithRequester != null) {
                            return ConnectionResponse.builder()
                                    .id(connectionWithRequester.getId())
                                    .status(connectionWithRequester.getStatus())
                                    .connectionType(connectionWithRequester.getConnectionType())
                                    .user1(userMapper.toProfilePreview(connectionWithRequester.getUser1()))
                                    .user2(userMapper.toProfilePreview(connectionWithRequester.getUser2()))
                                    .mutualConnections(userMapper.toProfilePreviewList(mutualConnections.stream().filter(u -> !u.getId().equals(otherId)).toList()))
                                    .build();
                        }
                        User otherUser = c.getUser1().getId().equals(userId) ? c.getUser2() : c.getUser1();
                        return ConnectionResponse.builder()
                                .id(c.getId())
                                .user1(userMapper.toProfilePreview(otherUser))
                                .mutualConnections(userMapper.toProfilePreviewList(mutualConnections))
                                .build();
                    })
                    .toList();
        }

        return ConnectionPageResponse.builder()
                .connections(responses)
                .hasNext(hasNext)
                .nextCursorCreatedAt(nextCursorCreatedAt)
                .nextCursorId(nextCursorId)
                .build();
    }


    @Transactional(readOnly = true)
    public SentRequestsPageResponse getAllSentRequest(UUID requesterId,
                                                      Instant cursorCreatedAt,
                                                      UUID cursorId,
                                                      int size,
                                                      ConnectionType type,
                                                      RequestStatus status) {
        List<UUID> requestIds = connectionRequestRepository.findSentIdsKeyset(
                requesterId,
                cursorCreatedAt,
                cursorId,
                type != null ? type.name() : null,
                status != null ? status.name() : null,
                size + 1
        );

        List<ConnectionRequest> unOrderedRequests = connectionRequestRepository.findAllWithUserAndProfileByIds(requestIds);

        Map<UUID, ConnectionRequest> map = unOrderedRequests.stream()
                .collect(Collectors.toMap(ConnectionRequest::getId, r -> r));
        List<ConnectionRequest> connectionRequests = requestIds.stream()
                .map(map::get)
                .toList();

        boolean hasNext = connectionRequests.size() > size;
        if (hasNext) connectionRequests = connectionRequests.subList(0, size);
        Instant nextCursorCreatedAt = hasNext ? connectionRequests.getLast().getCreatedAt() : null;
        UUID nextCursorId = hasNext ? connectionRequests.getLast().getId() : null;

        List<UUID> recipientIds = connectionRequests.stream()
                .map(req -> req.getRecipient().getId())
                .toList();

        List<Object[]> rawMutualConnections = userRepository.findMutualConnectionsBatch(
                requesterId, recipientIds, ConnectionStatus.CONNECTED
        );

        Map<UUID, List<User>> mutualMap = rawMutualConnections.stream()
                .collect(Collectors.groupingBy(
                        row -> (UUID) row[2],
                        Collectors.mapping(row -> (User) row[0], Collectors.toList())
                ));

        List<ConnectionRequestResponse> responses = connectionRequests.stream()
                .map(req -> {
                    UUID recipientId = req.getRecipient().getId();
                    List<User> mutualConnections = mutualMap.getOrDefault(recipientId, List.of());
                    return buildConnectionRequestResponse(req, mutualConnections.stream().toList());
                })
                .toList();

        return SentRequestsPageResponse.builder()
                .requests(responses)
                .hasNext(hasNext)
                .nextCursorCreatedAt(nextCursorCreatedAt)
                .nextCursorId(nextCursorId)
                .build();
    }

    @Transactional(readOnly = true)
    public ReceivedRequestPageResponse getAllReceivedRequest(
            UUID recipientId,
            Instant cursorCreatedAt,
            UUID cursorId,
            int size,
            ConnectionType type,
            RequestStatus status
    ) {

        List<UUID> requestIds = connectionRequestRepository.findReceivedIdsKeyset(
                recipientId,
                cursorCreatedAt,
                cursorId,
                type != null ? type.name() : null,
                status != null ? status.name() : null,
                size + 1
        );

        List<ConnectionRequest> unOrderedRequests = connectionRequestRepository.findAllWithUserAndProfileByIds(requestIds);

        Map<UUID, ConnectionRequest> map = unOrderedRequests.stream()
                .collect(Collectors.toMap(ConnectionRequest::getId, r -> r));
        List<ConnectionRequest> connectionRequests = requestIds.stream()
                .map(map::get)
                .toList();

        boolean hasNext = connectionRequests.size() > size;
        if (hasNext) connectionRequests = connectionRequests.subList(0, size);
        Instant nextCursorCreatedAt = hasNext ? connectionRequests.getLast().getCreatedAt() : null;
        UUID nextCursorId = hasNext ? connectionRequests.getLast().getId() : null;

        List<UUID> requesterIds = connectionRequests.stream()
                .map(req -> req.getRequester().getId())
                .toList();

        List<Object[]> rawMutualConnections = userRepository.findMutualConnectionsBatch(
                recipientId, requesterIds, ConnectionStatus.CONNECTED
        );

        Map<UUID, List<User>> mutualMap = rawMutualConnections.stream()
                .collect(Collectors.groupingBy(
                        row -> (UUID) row[2],
                        Collectors.mapping(row -> (User) row[0], Collectors.toList())
                ));

        List<ConnectionRequestResponse> responses = connectionRequests.stream()
                .map(req -> {
                    UUID requesterId = req.getRequester().getId();
                    List<User> mutualConnections =
                            mutualMap.getOrDefault(requesterId, List.of());
                    return buildConnectionRequestResponse(
                            req,
                            mutualConnections.stream().limit(50).toList()
                    );
                })
                .toList();


        return ReceivedRequestPageResponse.builder()
                .requests(responses)
                .requests(responses)
                .hasNext(hasNext)
                .nextCursorCreatedAt(nextCursorCreatedAt)
                .nextCursorId(nextCursorId)
                .build();
    }

    @Transactional(readOnly = true)
    public SuggestedConnectionsPageResponse getSuggestedConnections(UUID userId, Instant cursorCreatedAt, UUID cursorId, int size) {
        List<UUID> suggestedIds = userRepository.findSuggestedConnectionIdsKeyset(
                userId, cursorCreatedAt, cursorId, size + 1
        );

        List<User> unOrderedUsers = userRepository.findAllWithProfileByIds(suggestedIds);

        Map<UUID, User> userMap = unOrderedUsers.stream()
                .collect(Collectors.toMap(User::getId, u -> u));

        List<User> suggestions = suggestedIds.stream()
                .map(userMap::get)
                .filter(Objects::nonNull)
                .toList();

        boolean hasNext = suggestions.size() > size;
        if (hasNext) suggestions = suggestions.subList(0, size);
        Instant nextCursorCreatedAt = hasNext ? suggestions.getLast().getCreatedAt() : null;
        UUID nextCursorId = hasNext ? suggestions.getLast().getId() : null;


        List<Object[]> rawMutualConnections = userRepository.findMutualConnectionsBatch(
                userId,
                suggestedIds,
                ConnectionStatus.CONNECTED
        );

        Map<UUID, List<User>> mutualMap = rawMutualConnections.stream()
                .collect(Collectors.groupingBy(
                        row -> (UUID) row[2],
                        Collectors.mapping(row -> (User) row[0], Collectors.toList())
                ));


        List<UserPreviewWithMutualConnectionResponse> suggestionResponses = suggestions.stream()
                .map(suggestedUser -> {
                    List<User> mutualConnections =
                            mutualMap.getOrDefault(suggestedUser.getId(), List.of());
                    return UserPreviewWithMutualConnectionResponse.builder()
                            .user(userMapper.toProfilePreview(suggestedUser))
                            .mutualConnections(userMapper.toProfilePreviewList(
                                    mutualConnections
                            ))
                            .build();
                })
                .toList();

        return SuggestedConnectionsPageResponse.builder()
                .suggestions(suggestionResponses)
                .hasNext(hasNext)
                .nextCursorCreatedAt(nextCursorCreatedAt)
                .nextCursorId(nextCursorId)
                .build();
    }

    @Transactional(readOnly = true)
    public GetConnectionsResponse getConnections(UUID requesterId, GetConnectionsRequest request) {
        if (request.getUserIds() == null || request.getUserIds().isEmpty()) {
            return GetConnectionsResponse.builder()
                    .connections(List.of())
                    .build();
        }

        List<UUID> targetUserIds = request.getUserIds().stream()
                .filter(targetId -> !targetId.equals(requesterId))
                .toList();

        List<UUID> connectionIds = targetUserIds.stream()
                .map(targetId -> ConnectionUtils.generateConnectionId(requesterId, targetId))
                .toList();

        List<Connection> connections = connectionRepository.findAllWithUsers(connectionIds);

        // Lấy batch mutual connections: [User, OtherUser, MutualUser]
        List<Object[]> rawMutualConnections = userRepository.findMutualConnectionsBatch(
                requesterId, targetUserIds, ConnectionStatus.CONNECTED
        );

        // Map theo userId được mutual connections
        Map<UUID, List<User>> mutualMap = rawMutualConnections.stream()
                .collect(Collectors.groupingBy(
                        row -> (UUID) row[2],
                        Collectors.mapping(row -> (User) row[0], Collectors.toList())
                ));

        Map<UUID, Connection> connectionMap = connections.stream()
                .collect(Collectors.toMap(Connection::getId, c -> c));

        List<ConnectionTypeStatusDto> connectionDtos = targetUserIds.stream()
                .map(otherUserId -> {
                    UUID connectionId = ConnectionUtils.generateConnectionId(requesterId, otherUserId);
                    Connection c = connectionMap.get(connectionId);

                    List<User> mutualConnections = mutualMap.getOrDefault(otherUserId, List.of());
                    return ConnectionTypeStatusDto.builder()
                            .userId(otherUserId)
                            .connectionType(c != null ? c.getConnectionType() : null)
                            .status(c != null ? c.getStatus() : null)
                            .mutualConnections(userMapper.toProfilePreviewList(mutualConnections.stream().filter(u -> !u.getId().equals(otherUserId)).toList()))
                            .build();
                })
                .toList();

        return GetConnectionsResponse.builder()
                .connections(connectionDtos)
                .build();
    }


    private void checkConnectionLimit(UUID currentUserId, UUID targetUserId, ConnectionType type) {
        Integer maxCount = type.getMaxCount();

        long count = connectionRepository.countByUserIdAndTypeAndStatuses(
                targetUserId, type, List.of(ConnectionStatus.CONNECTED)
        );

        if (count >= maxCount) {
            throw new MaxConnectionLimitEx(
                    "User " + targetUserId + " reached max limit for type " + type.getName(),
                    MaxRelationshipLimitResponse.builder()
                            .selfExceeded(currentUserId.equals(targetUserId))
                            .build()
            );
        }
    }

    private ConnectionResponse buildConnectionResponse(Connection connection, List<User> mutualConnections) {
        ConnectionResponse response = connectionMapper.toResponse(connection);
        response.setMutualConnections(userMapper.toProfilePreviewList(mutualConnections));
        return response;
    }

    private ConnectionRequestResponse buildConnectionRequestResponse(ConnectionRequest request, List<User> mutualConnections) {
        ConnectionRequestResponse response = connectionRequestMapper.toResponse(request);
        response.setMutualConnections(userMapper.toProfilePreviewList(mutualConnections));
        return response;
    }
}
