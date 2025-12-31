package com.muicochay.mory.conversation.repository;

import com.muicochay.mory.conversation.entity.ChatMessage;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, UUID> {

    Optional<ChatMessage> findByIdAndConversationId(UUID id, UUID conversationId);

    //--- Normal paging ---

    @Query(value = """
            select *
            from chat_messages m
            where m.conversation_id = :conversationId
              and (
                    m.created_at < coalesce(:cursorCreatedAt, 'infinity'::timestamptz)
                 or (
                        m.created_at = :cursorCreatedAt
                    and m.id < :cursorId
                 )
              )
            order by m.created_at desc, m.id desc
            limit :limit
        """, nativeQuery = true)
    List<ChatMessage> findOlderThanCursor(
            UUID conversationId,
            Instant cursorCreatedAt,
            UUID cursorId,
            int limit
    );

    @Query(value = """
    select *
    from chat_messages m
    where m.conversation_id = :conversationId
      and (
            m.created_at > coalesce(:cursorCreatedAt, '-infinity'::timestamptz)
         or (
                m.created_at = :cursorCreatedAt
            and m.id > :cursorId
         )
      )
    order by m.created_at asc, m.id asc
    limit :limit
""", nativeQuery = true)
    List<ChatMessage> findNewerThanCursor(
            UUID conversationId,
            Instant cursorCreatedAt,
            UUID cursorId,
            int limit
    );

    // --- JUMP TO MESSAGE ---
    @Query("""
        select m from ChatMessage m
        where m.conversationId = :conversationId
          and (
                m.createdAt > :createdAt
             or (m.createdAt = :createdAt and m.id > :id)
          )
        order by m.createdAt asc, m.id asc
    """)
    List<ChatMessage> findNewerThan(
            UUID conversationId,
            Instant createdAt,
            UUID id,
            Pageable pageable
    );

    @Query("""
        select m from ChatMessage m
        where m.conversationId = :conversationId
          and (
                m.createdAt < :createdAt
             or (m.createdAt = :createdAt and m.id < :id)
          )
        order by m.createdAt desc, m.id desc
    """)
    List<ChatMessage> findOlderThan(
            UUID conversationId,
            Instant createdAt,
            UUID id,
            Pageable pageable
    );
}