package com.muicochay.mory.conversation.repository;

import com.muicochay.mory.conversation.entity.ConversationMember;
import com.muicochay.mory.conversation.interfaces.ConversationUnreadProjection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ConversationMemberRepository extends JpaRepository<ConversationMember, UUID>, ConversationMemberBatchRepository {
    @Modifying
    @Query("""
            DELETE FROM ConversationMember cm
            WHERE cm.conversation.id = :conversationId
              AND cm.userId IN :userIds
        """)
    int deleteByConversationIdAndUserIdIn(
            @Param("conversationId") UUID conversationId,
            @Param("userIds") List<UUID> userIds
    );

    @Modifying
    @Query("""
            DELETE FROM ConversationMember cm
            WHERE cm.conversation.id = :conversationId
              AND cm.userId = :userId
        """)
    int deleteByConversationIdAndUserId(
            @Param("conversationId") UUID conversationId,
            @Param("userId") UUID userId
    );

    @Modifying
        @Query("""
        UPDATE ConversationMember cm
        SET
            cm.lastReadAt = :readAt,
            cm.lastReadMessageId = :lastReadMessageId
        WHERE cm.userId = :userId
          AND cm.conversation.id = :conversationId
    """)
    int updateLastRead(
            @Param("userId") UUID userId,
            @Param("conversationId") UUID conversationId,
            @Param("lastReadMessageId") UUID lastReadMessageId,
            @Param("readAt") Instant readAt
    );

    List<ConversationMember> findAllByConversationIdInAndUserIdIn(List<UUID> conversationIds, List<UUID> userIds);

    Optional<ConversationMember> findByConversationIdAndUserId(UUID conversationId, UUID userId);

    @Query(value = """
            SELECT
                cm.conversation_id AS conversationId,
                COUNT(m.id) FILTER (
                    WHERE m.created_at > COALESCE(cm.last_read_at, 'epoch')
                ) AS unreadCount
            FROM conversation_members cm
            LEFT JOIN chat_messages m
              ON m.conversation_id = cm.conversation_id
            WHERE cm.user_id = :userId
              AND cm.conversation_id = ANY(:conversationIds)
            GROUP BY
                cm.conversation_id,
                cm.last_read_at
        """, nativeQuery = true)
    List<ConversationUnreadProjection> findUnreadCountsByConversationIdsNative(
            @Param("userId") UUID userId,
            @Param("conversationIds") UUID[] conversationIds
    );

    @Query(value = """
            SELECT
                cm.conversation_id AS conversationId,
                COUNT(m.id) FILTER (
                    WHERE m.created_at > COALESCE(cm.last_read_at, 'epoch')
                ) AS unreadCount
            FROM conversation_members cm
            LEFT JOIN chat_messages m
              ON m.conversation_id = cm.conversation_id
            WHERE cm.user_id = :userId
              AND cm.conversation_id = :conversationId
            GROUP BY
                cm.conversation_id,
                cm.last_read_at
        """, nativeQuery = true)
    ConversationUnreadProjection findUnreadCountByConversation(
            @Param("userId") UUID userId,
            @Param("conversationId") UUID conversationId
    );
}