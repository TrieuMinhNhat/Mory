package com.muicochay.mory.conversation.repository;

import com.muicochay.mory.conversation.entity.Conversation;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
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
            WHERE cm.user_id = :userId
              AND c.status = :status
              AND (
                  (:asc = TRUE AND (
                      COALESCE(c.last_message_sent_at, 'infinity'::timestamptz) > COALESCE(:cursorLastSentAt, '-infinity'::timestamptz)
                      OR (
                          COALESCE(c.last_message_sent_at, 'infinity'::timestamptz) = COALESCE(:cursorLastSentAt, '-infinity'::timestamptz)
                          AND c.id > :cursorId
                      )
                  ))
                  OR
                  (:asc = FALSE AND (
                      COALESCE(c.last_message_sent_at, 'epoch'::timestamptz) < COALESCE(:cursorLastSentAt, 'infinity'::timestamptz)
                      OR (
                          COALESCE(c.last_message_sent_at, 'epoch'::timestamptz) = COALESCE(:cursorLastSentAt, 'infinity'::timestamptz)
                          AND c.id < :cursorId
                      )
                  ))
              )
            ORDER BY
              CASE WHEN :asc = TRUE THEN COALESCE(c.last_message_sent_at, 'infinity'::timestamptz) END ASC,
              CASE WHEN :asc = TRUE THEN c.id END ASC,
              CASE WHEN :asc = FALSE THEN COALESCE(c.last_message_sent_at, 'epoch'::timestamptz) END DESC,
              CASE WHEN :asc = FALSE THEN c.id END DESC
            LIMIT :limit
        """, nativeQuery = true)
    List<UUID> findConversationIdsByUserKeyset(
            @Param("userId") UUID userId,
            @Param("cursorLastSentAt") Instant cursorLastSentAt,
            @Param("cursorId") UUID cursorId,
            @Param("status") String status,
            @Param("asc") boolean asc,
            @Param("limit") int limit);

    @EntityGraph(attributePaths = {"members"})
    @Query("SELECT c FROM Conversation c WHERE c.id IN :ids")
    List<Conversation> findAllByIdInWithMembers(@Param("ids") List<UUID> ids);

    @EntityGraph(attributePaths = {"members"})
    @Query("SELECT c FROM Conversation c WHERE c.id = :id")
    Optional<Conversation> findByIdWithMembers(@Param("id") UUID id);
}
