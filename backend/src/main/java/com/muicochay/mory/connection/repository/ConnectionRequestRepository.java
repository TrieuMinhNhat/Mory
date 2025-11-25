package com.muicochay.mory.connection.repository;

import com.muicochay.mory.connection.entity.ConnectionRequest;
import com.muicochay.mory.connection.enums.RequestStatus;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ConnectionRequestRepository extends JpaRepository<ConnectionRequest, UUID> {
    @Query("""
    SELECT EXISTS (
        SELECT 1
        FROM ConnectionRequest r
        WHERE
            ((r.requester.id = :userAId AND r.recipient.id = :userBId)
             OR (r.requester.id = :userBId AND r.recipient.id = :userAId))
          AND r.status IN :statuses
          AND r.oldConnectionType IS NULL
    )
    """)
    boolean existsBetweenUsersAndStatusesAndOldConnectionTypeIsNull(
            @Param("userAId") UUID userAId,
            @Param("userBId") UUID userBId,
            @Param("statuses") Collection<RequestStatus> statuses
    );

    @Query("""
    SELECT EXISTS (
        SELECT 1
        FROM ConnectionRequest r
        WHERE
            ((r.requester.id = :userAId AND r.recipient.id = :userBId)
             OR (r.requester.id = :userBId AND r.recipient.id = :userAId))
          AND r.status IN :statuses
          AND r.oldConnectionType IS NOT NULL
    )
    """)
    boolean existsBetweenUsersAndStatusesAndOldConnectionTypeIsNotNull(
            @Param("userAId") UUID userAId,
            @Param("userBId") UUID userBId,
            @Param("statuses") Collection<RequestStatus> statuses
    );

    @EntityGraph(attributePaths = {"requester", "recipient", "requester.profile", "recipient.profile"})
    @Query("select r from ConnectionRequest r where r.id = :id")
    Optional<ConnectionRequest> findByIdWithUsers(@Param("id") UUID id);

    @Query(value = """
            SELECT id
            FROM connection_requests r
            WHERE r.requester_id = :requesterId
              AND r.new_connection_type = COALESCE(:type, r.new_connection_type)
              AND r.status = COALESCE(:status, r.status)
              AND (
                  r.created_at < COALESCE(:cursorCreatedAt, 'infinity'::timestamptz)
               OR (r.created_at = COALESCE(:cursorCreatedAt, 'infinity'::timestamptz) AND r.id < :cursorId)
              )
            ORDER BY r.created_at DESC, r.id DESC
            LIMIT :limit
        """, nativeQuery = true)
    List<UUID> findSentIdsKeyset(
            @Param("requesterId") UUID requesterId,
            @Param("cursorCreatedAt") Instant cursorCreatedAt,
            @Param("cursorId") UUID cursorId,
            @Param("type") String type,
            @Param("status") String status,
            @Param("limit") int limit
    );

    @Query(value = """
            SELECT id
            FROM connection_requests r
            WHERE r.recipient_id = :recipientId
              AND r.new_connection_type = COALESCE(:type, r.new_connection_type)
              AND r.status = COALESCE(:status, r.status)
              AND (
                  r.created_at < COALESCE(:cursorCreatedAt, 'infinity'::timestamptz)
               OR (r.created_at = COALESCE(:cursorCreatedAt, 'infinity'::timestamptz) AND r.id < :cursorId)
              )
            ORDER BY r.created_at DESC, r.id DESC
            LIMIT :limit
        """, nativeQuery = true)
    List<UUID> findReceivedIdsKeyset(
            @Param("recipientId") UUID recipientId,
            @Param("cursorCreatedAt") Instant cursorCreatedAt,
            @Param("cursorId") UUID cursorId,
            @Param("type") String type,
            @Param("status") String status,
            @Param("limit") int limit
    );

    @EntityGraph(attributePaths = {"requester", "recipient", "requester.profile", "recipient.profile"})
    @Query("""
            SELECT r FROM ConnectionRequest r
            WHERE r.id IN :ids
            """)
    List<ConnectionRequest> findAllWithUserAndProfileByIds(@Param("ids") List<UUID> ids);

    @Query("""
    SELECT r
    FROM ConnectionRequest r
    WHERE ((r.requester.id = :userAId AND r.recipient.id = :userBId)
           OR (r.requester.id = :userBId AND r.recipient.id = :userAId))
      AND r.status = :status
    """)
    Optional<ConnectionRequest> findPendingRequestBetweenUsers(
            @Param("userAId") UUID userAId,
            @Param("userBId") UUID userBId,
            @Param("status") RequestStatus status
    );

}
