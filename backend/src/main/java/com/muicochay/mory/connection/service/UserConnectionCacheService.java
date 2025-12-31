package com.muicochay.mory.connection.service;

import com.muicochay.mory.connection.enums.ConnectionType;

import java.util.Map;
import java.util.Set;
import java.util.UUID;

public interface UserConnectionCacheService {

    Set<UUID> getAllConnectedUserIds(UUID userId);

    Set<UUID> getConnectedUserIdsByType(UUID userId, ConnectionType type);

    Set<UUID> getMutualConnectedUserIds(UUID userA, UUID userB);

    void addConnectionForBothUsers(
            UUID userA,
            UUID userB,
            ConnectionType type
    );

    void removeConnectionForBothUsers(
            UUID userA,
            UUID userB,
            ConnectionType type
    );

    void changeTypeForBothUsers(
            UUID userA,
            UUID userB,
            ConnectionType oldType,
            ConnectionType newType
    );

    Set<UUID> getSecondDegreeUserIds(UUID userId);

    Map<UUID, Integer> getSuggestedUserIdsWithScore(
            UUID userId,
            int limit
    );
}

