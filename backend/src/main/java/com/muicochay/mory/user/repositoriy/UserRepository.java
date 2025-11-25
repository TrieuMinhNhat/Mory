package com.muicochay.mory.user.repositoriy;

import com.muicochay.mory.auth.enums.AuthProvider;
import com.muicochay.mory.connection.enums.ConnectionStatus;
import com.muicochay.mory.user.entity.User;
import com.muicochay.mory.user.interfaces.UserConnectionAndProviderProjection;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.lang.NonNull;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID> {

    @EntityGraph(attributePaths = {"profile"})
    @NonNull
    Optional<User> findWithProfileById(@NonNull UUID id);

    @Query("""
            SELECT u FROM User u
            WHERE u.passwordVerifiedAt IS NULL
              AND u.createdAt < :cutoff
              AND u.deletedAt IS NULL
              AND (
                  u.providers IS EMPTY
                  OR (SIZE(u.providers) = 1 AND :emailPassword MEMBER OF u.providers)
              )
        """)
    List<User> findUnverifiedEmailPasswordOnlyUsers(@Param("cutoff") Instant cutoff,
            @Param("emailPassword") AuthProvider emailPassword);

    @EntityGraph(attributePaths = {"profile"})
    @Query("""
            FROM User u
            WHERE EXISTS (
                SELECT 1
                FROM Connection c1
                WHERE (
                        (c1.user1.id = :userId1 AND c1.user2 = u)
                     OR (c1.user2.id = :userId1 AND c1.user1 = u)
                )
                  AND c1.status = :status
            )
            AND EXISTS (
                SELECT 1
                FROM Connection c2
                WHERE (
                        (c2.user1.id = :userId2 AND c2.user2 = u)
                     OR (c2.user2.id = :userId2 AND c2.user1 = u)
                )
                  AND c2.status = :status
            )
        """)
    List<User> findMutualUsersByStatus(
            @Param("userId1") UUID userId1,
            @Param("userId2") UUID userId2,
            @Param("status") ConnectionStatus status
    );

    @EntityGraph(attributePaths = {"profile"})
    @Query("""
            SELECT u, :sourceUserId,
                   CASE
                       WHEN c2.user1.id = u.id THEN c2.user2.id
                       ELSE c2.user1.id
                   END as targetId
            FROM User u
            JOIN Connection c1
              ON ((c1.user1.id = :sourceUserId AND c1.user2 = u)
               OR (c1.user2.id = :sourceUserId AND c1.user1 = u))
             AND c1.status = :status
            JOIN Connection c2
              ON ((c2.user1 = u AND c2.user2.id IN :targetUserIds)
               OR (c2.user2 = u AND c2.user1.id IN :targetUserIds))
             AND c2.status = :status
        """)
    List<Object[]> findMutualConnectionsBatch(
            @Param("sourceUserId") UUID sourceUserId,
            @Param("targetUserIds") List<UUID> targetUserIds,
            @Param("status") ConnectionStatus status
    );

    @EntityGraph(attributePaths = {"profile"})
    @Query("""
            SELECT u FROM User u
            WHERE u.id <> :userId1 AND u.id <> :userId2
            AND EXISTS (
                SELECT 1 FROM Connection c1
                WHERE ((c1.user1.id = :userId1 AND c1.user2 = u)
                       OR (c1.user2.id = :userId1 AND c1.user1 = u))
                  AND c1.status = :status
            )
            AND EXISTS (
                SELECT 1 FROM Connection c2
                WHERE ((c2.user1.id = :userId2 AND c2.user2 = u)
                       OR (c2.user2.id = :userId2 AND c2.user1 = u))
                  AND c2.status = :status
            )
        """)
    List<User> findMutualConnections(
            @Param("userId1") UUID userId1,
            @Param("userId2") UUID userId2,
            @Param("status") ConnectionStatus status
    );

    @Query(value = """
        SELECT u.id
        FROM users u
        WHERE u.id <> :userId
          AND NOT EXISTS (
              SELECT 1 FROM connections c
              WHERE ((c.user1_id = :userId AND c.user2_id = u.id)
                  OR (c.user2_id = :userId AND c.user1_id = u.id))
                  AND c.status <> 'INACTIVE'
          )
          AND NOT EXISTS (
              SELECT 1 FROM connection_requests cr
              WHERE ((cr.requester_id = :userId AND cr.recipient_id = u.id)
                  OR (cr.recipient_id = :userId AND cr.requester_id = u.id))
                AND cr.status = 'PENDING'
          )
          AND EXISTS (
              SELECT 1
              FROM connections c1
              JOIN connections c2
                ON ((c2.user1_id = u.id AND (c2.user2_id = c1.user1_id OR c2.user2_id = c1.user2_id))
                 OR (c2.user2_id = u.id AND (c2.user1_id = c1.user1_id OR c2.user1_id = c1.user2_id)))
              WHERE (c1.user1_id = :userId OR c1.user2_id = :userId)
                AND c1.status = 'CONNECTED'
                AND c2.status = 'CONNECTED'
          )
          AND (
            u.created_at < COALESCE(:cursorCreatedAt, 'infinity'::timestamptz)
            OR (u.created_at = COALESCE(:cursorCreatedAt, 'infinity'::timestamptz) AND u.id < :cursorId)
          )
        ORDER BY u.created_at DESC, u.id DESC
        LIMIT :limit
        """, nativeQuery = true)
    List<UUID> findSuggestedConnectionIdsKeyset(
            @Param("userId") UUID userId,
            @Param("cursorCreatedAt") Instant cursorCreatedAt,
            @Param("cursorId") UUID cursorId,
            @Param("limit") int limit
    );

    @EntityGraph(attributePaths = {"profile"})
    @Query("SELECT u FROM User u WHERE u.id IN :ids")
    List<User> findAllWithProfileByIds(@Param("ids") List<UUID> ids);

    @Query("""
            SELECT
                (SELECT COUNT(c)
                 FROM Connection c
                 WHERE (c.user1.id = u.id OR c.user2.id = u.id)
                   AND c.status = :connectionStatus
                ) AS connectionCount,
                CASE WHEN :authProvider IN elements(u.providers)
                     THEN true ELSE false END AS hasEmailPasswordProvider
            FROM User u
            WHERE u.id = :userId
        """)
    UserConnectionAndProviderProjection getUserConnectionAndProvider(
            @Param("userId") UUID userId,
            @Param("connectionStatus") ConnectionStatus status,
            @Param("authProvider") AuthProvider authProvider
    );

}
