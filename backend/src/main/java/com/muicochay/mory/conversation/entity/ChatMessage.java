package com.muicochay.mory.conversation.entity;

import com.muicochay.mory.shared.entity.BaseAuditEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(
        name = "chat_messages",
        indexes = {
                @Index(
                        name = "idx_chat_conversation_created",
                        columnList = "conversation_id, created_at desc, id desc"
                )
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatMessage extends BaseAuditEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "conversation_id", nullable = false)
    private UUID conversationId;

    @Column(name = "sender_id", nullable = false)
    private UUID senderId;

    @Column(columnDefinition = "text", nullable = false)
    private String text;

    @Column(name = "reply_to_message_id")
    private UUID replyToMessageId;

    @Column(name = "reply_to_moment_id")
    private UUID replyToMomentId;

    @Column(name = "recalled_at")
    private Instant recalledAt;
}

