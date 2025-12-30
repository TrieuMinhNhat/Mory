package com.muicochay.mory.notification.repository;

import com.muicochay.mory.notification.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface NotificationRepository extends JpaRepository<Notification, UUID> {
    Optional<Notification> findByIdAndDeletedAtIsNull(UUID id);

    @Query(value = """
            SELECT id
            FROM notifications n
            WHERE n.user_id = :userId
              AND n.deleted_at IS NULL
              AND (
                  n.created_at < COALESCE(:cursorCreatedAt, '9999-12-31T23:59:59Z'::timestamptz)
                  OR (n.created_at = COALESCE(:cursorCreatedAt, '9999-12-31T23:59:59Z'::timestamptz) AND n.id < :cursorId)
              )
            ORDER BY
              n.created_at DESC,
              n.id DESC
            LIMIT :limit
        """, nativeQuery = true)
    List<UUID> findIdsKeyset(
            @Param("userId") UUID userId,
            @Param("cursorCreatedAt") Instant cursorCreatedAt,
            @Param("cursorId") UUID cursorId,
            @Param("limit") int limit
    );
}
