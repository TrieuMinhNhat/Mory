package com.muicochay.mory.connection.repository;

import com.muicochay.mory.connection.entity.Connection;
import com.muicochay.mory.connection.enums.ConnectionStatus;
import com.muicochay.mory.connection.enums.ConnectionType;
import com.muicochay.mory.connection.interfaces.ConnectedUserProjection;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.*;

public interface ConnectionRepository extends JpaRepository<Connection, UUID> {
    @Query("SELECT COUNT(c) FROM Connection c " +
            "WHERE (c.user1.id = :userId OR c.user2.id = :userId) " +
            "AND c.connectionType = :type " +
            "AND c.status IN :statuses")
    long countByUserIdAndTypeAndStatuses(@Param("userId") UUID userId,
                                       @Param("type") ConnectionType type,
                                       @Param("statuses") Collection<ConnectionStatus> statuses);

    @Query("""
            SELECT COUNT(c) FROM Connection c
                WHERE (c.user1.id = :userId OR c.user2.id = :userId)
                AND c.status = :status
        """)
    long countByUserIdAndStatus(@Param("userId") UUID userId,
                                @Param("status") ConnectionStatus status);

    @Query(
            value = """
                SELECT
                    CASE
                        WHEN
                            EXISTS (
                                SELECT 1
                                FROM connections c
                                WHERE c.id = :id
                                    AND c.status = :status
                            )
                            OR
                            EXISTS (
                                SELECT 1
                                FROM users u
                                WHERE u.id <> :userId1 AND u.id <> :userId2
                                  AND EXISTS (
                                      SELECT 1
                                      FROM connections c1
                                      WHERE (c1.user1_id = :userId1 OR c1.user2_id = :userId1)
                                        AND (c1.user1_id = u.id OR c1.user2_id = u.id)
                                        AND c1.status = :status
                                  )
                                  AND EXISTS (
                                      SELECT 1
                                      FROM connections c2
                                      WHERE (c2.user1_id = :userId2 OR c2.user2_id = :userId2)
                                        AND (c2.user1_id = u.id OR c2.user2_id = u.id)
                                        AND c2.status = :status
                                  )
                            )
                        THEN TRUE
                        ELSE FALSE
                    END
                """,
            nativeQuery = true
        )
    boolean existsDirectOrMutualConnection(
            @Param("id") UUID connectionId,
            @Param("userId1") UUID userId1,
            @Param("userId2") UUID userId2,
            @Param("status") String status
    );

    @Query(value = """
    SELECT EXISTS(
        SELECT 1
        FROM connections c
        WHERE c.id IN (:connectionIds)
          AND c.status IN (:statuses)
    )
    """, nativeQuery = true)
    boolean existsAnyConnectionByIds(@Param("connectionIds") List<UUID> connectionIds,
                                        @Param("statuses") Collection<String> statuses);

    @Query(value = """
            SELECT id
            FROM connections c
            WHERE (c.user1_id = :userId OR c.user2_id = :userId)
              AND c.connection_type = COALESCE(:type, c.connection_type)
              AND c.status = COALESCE(:status, c.status)
              AND (
                  (:asc = TRUE  AND (
                      c.created_at > COALESCE(:cursorCreatedAt, '-infinity'::timestamptz)
                      OR (c.created_at = COALESCE(:cursorCreatedAt, '-infinity'::timestamptz) AND c.id > :cursorId)
                  ))
                  OR (:asc = FALSE AND (
                      c.created_at < COALESCE(:cursorCreatedAt, 'infinity'::timestamptz)
                      OR (c.created_at = COALESCE(:cursorCreatedAt, 'infinity'::timestamptz) AND c.id < :cursorId)
                  ))
              )
            ORDER BY
              CASE WHEN :asc = TRUE  THEN c.created_at END ASC,
              CASE WHEN :asc = TRUE THEN c.id END ASC,
              CASE WHEN :asc = FALSE THEN c.created_at END DESC,
              CASE WHEN :asc = FALSE THEN c.id END DESC
            LIMIT :limit
        """, nativeQuery = true)
    List<UUID> findIdsKeyset(
            @Param("userId") UUID userId,
            @Param("cursorCreatedAt") Instant cursorCreatedAt,
            @Param("cursorId") UUID cursorId,
            @Param("type") String type,
            @Param("status") String status,
            @Param("asc") boolean asc,
            @Param("limit") int limit);

    @EntityGraph(attributePaths = {"user1", "user1.profile", "user2", "user2.profile"})
    @Query("SELECT c FROM Connection c WHERE c.id IN :ids ORDER BY c.createdAt ASC")
    List<Connection> findAllWithUsersAndProfiles(@Param("ids") List<UUID> ids);

    @EntityGraph(attributePaths = {"user1", "user2"})
    @Query("SELECT c FROM Connection c WHERE c.id IN :ids ORDER BY c.createdAt ASC")
    List<Connection> findAllWithUsers(@Param("ids") List<UUID> ids);

    @EntityGraph(attributePaths = {"user1", "user1.profile", "user2", "user2.profile"})
    @Query("SELECT c FROM Connection c WHERE c.id = :id")
    Optional<Connection> findByIdWithUsersAndProfiles(@Param("id") UUID id);

    @Query("SELECT c.connectionType FROM Connection c WHERE c.id = :id")
    Optional<ConnectionType> findTypeById(@Param("id") UUID id);

    @Query("""
            SELECT CASE WHEN c.user1.id = :creatorId THEN c.user2.id ELSE c.user1.id END
            FROM Connection c
            WHERE (
                    (c.user1.id = :creatorId AND c.user2.id IN :candidateIds)
                 OR (c.user2.id = :creatorId AND c.user1.id IN :candidateIds)
            )
            AND c.status IN :statuses
        """)
    Set<UUID> findConnectedUserIds(
            @Param("creatorId") UUID creatorId,
            @Param("candidateIds") Collection<UUID> candidateIds,
            @Param("statuses") Collection<ConnectionStatus> statuses
    );
    @Query("""
            SELECT
                CASE WHEN c.user1.id = :creatorId THEN c.user2.id ELSE c.user1.id END AS userId,
                c.connectionType AS connectionType
            FROM Connection c
            WHERE (c.user1.id = :creatorId OR c.user2.id = :creatorId)
              AND c.status = :status
        """)
    List<ConnectedUserProjection> findConnectedUsersWithTypeByCreatorAndStatus(
            @Param("creatorId") UUID creatorId,
            @Param("status") ConnectionStatus status
    );

}
