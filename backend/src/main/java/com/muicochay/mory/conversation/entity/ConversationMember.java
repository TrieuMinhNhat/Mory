package com.muicochay.mory.conversation.entity;

import com.muicochay.mory.conversation.enums.ConversationMemberRole;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "conversation_members",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = {"conversation_id", "user_id"})
        })
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConversationMember {

    @Id
    @GeneratedValue
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "conversation_id", nullable = false)
    private Conversation conversation;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ConversationMemberRole role = ConversationMemberRole.MEMBER;

    @Column(length = 40)
    private String lastReadMessageId;

    private Instant lastReadAt;

    @Column(nullable = false)
    private int unreadCount = 0;
}

