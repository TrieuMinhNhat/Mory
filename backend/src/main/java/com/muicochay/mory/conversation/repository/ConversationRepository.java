package com.muicochay.mory.conversation.repository;

import com.muicochay.mory.conversation.entity.Conversation;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ConversationRepository extends JpaRepository<Conversation, UUID> {
    @Query(value = """
            SELECT c.id
            FROM conversations c
            JOIN conversation_members cm ON cm.conversation_id = c.id
            WHERE c.deleted_at IS NULL
              AND cm.user_id = :userId
              AND c.status = :status
              AND (
                  COALESCE(
                      CASE
                          WHEN cm.cleared_at IS NOT NULL
                               AND cm.cleared_at > c.last_message_sent_at
                          THEN NULL
                          ELSE c.last_message_sent_at
                      END, 'epoch'::timestamptz
                  ) < COALESCE(:cursorLastSentAt, 'infinity'::timestamptz)
                  OR (
                      COALESCE(
                          CASE
                              WHEN cm.cleared_at IS NOT NULL
                                   AND cm.cleared_at > c.last_message_sent_at
                              THEN NULL
                              ELSE c.last_message_sent_at
                          END, 'epoch'::timestamptz
                      ) = COALESCE(:cursorLastSentAt, 'infinity'::timestamptz)
                      AND c.id < :cursorId
                  )
              )
            ORDER BY
              COALESCE(
                  CASE
                      WHEN cm.cleared_at IS NOT NULL
                           AND cm.cleared_at > c.last_message_sent_at
                      THEN NULL
                      ELSE c.last_message_sent_at
                  END, 'epoch'::timestamptz
              ) DESC,
              c.id DESC
            LIMIT :limit
        """, nativeQuery = true)
    List<UUID> findConversationIdsByUserKeyset(
            @Param("userId") UUID userId,
            @Param("cursorLastSentAt") Instant cursorLastSentAt,
            @Param("cursorId") UUID cursorId,
            @Param("status") String status,
            @Param("limit") int limit);

    @EntityGraph(attributePaths = {"members"})
    @Query("SELECT c FROM Conversation c WHERE c.id IN :ids")
    List<Conversation> findAllByIdInWithMembers(@Param("ids") List<UUID> ids);


    @EntityGraph(attributePaths = {"members"})
    @Query("SELECT c FROM Conversation c WHERE c.id = :id")
    Optional<Conversation> findByIdWithMembers(@Param("id") UUID id);

    @Modifying
    @Query("UPDATE Conversation c SET c.title = :title WHERE c.id = :id")
    int updateTitle(@Param("id") UUID id, @Param("title") String title);

    @Modifying
    @Query("UPDATE Conversation c SET c.deletedAt = :deletedAt WHERE c.id = :id")
    int softDelete(@Param("id") UUID id, @Param("deletedAt") Instant deletedAt);

    @Modifying
    @Query("""
        UPDATE Conversation c
        SET c.lastMessageId = :lastMessageId,
            c.lastMessageSentAt = :lastMessageSentAt
        WHERE c.id = :id
        """)
    int updateLastMessageInfo(
            @Param("id") UUID id,
            @Param("lastMessageId") UUID lastMessageId,
            @Param("lastMessageSentAt") Instant lastMessageSentAt
    );
}
