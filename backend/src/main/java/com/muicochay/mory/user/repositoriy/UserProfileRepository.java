package com.muicochay.mory.user.repositoriy;

import com.muicochay.mory.connection.enums.ConnectionStatus;
import com.muicochay.mory.user.entity.UserProfile;
import com.muicochay.mory.user.interfaces.UserProfileAndConnectionProjection;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface UserProfileRepository extends JpaRepository<UserProfile, UUID> {

    Optional<UserProfile> findByUserId(UUID userId);

    @Query("""
            SELECT
                p.avatarUrl AS avatarUrl,
                p.displayName AS displayName,
                (
                    SELECT COUNT(c)
                    FROM Connection c
                    WHERE (c.user1.id = :userId OR c.user2.id = :userId)
                      AND c.status = :connectionStatus
                ) AS connectionCount,
                c2 AS connection
            FROM UserProfile p
            LEFT JOIN Connection c2
                ON c2.id = :connectionId
                   AND (c2.user1.id = :userId OR c2.user2.id = :userId)
            WHERE p.user.id = :userId
        """)
    UserProfileAndConnectionProjection getUserProfileAndConnection(
            @Param("userId") UUID userId,
            @Param("connectionStatus") ConnectionStatus status,
            @Param("connectionId") UUID connectionId
    );

    @EntityGraph(attributePaths = {"user"})
    @Query("SELECT p FROM UserProfile p WHERE p.user.id IN :userIds")
    List<UserProfile> findAllByUserIds(@Param("userIds") List<UUID> userIds);
}
