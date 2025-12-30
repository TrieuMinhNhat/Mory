package com.muicochay.mory.conversation.entity;

import com.muicochay.mory.conversation.enums.ConversationStatus;
import com.muicochay.mory.conversation.enums.ConversationType;
import com.muicochay.mory.shared.entity.BaseAuditEntity;
import jakarta.persistence.*;
import lombok.*;
import org.bson.types.ObjectId;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "conversations")
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Builder
public class Conversation extends BaseAuditEntity {
    @Id
    private UUID id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ConversationType type;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ConversationStatus status;

    private ObjectId lastMessageId;

    private Instant lastMessageSentAt;

    @OneToMany(mappedBy = "conversation", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    private List<ConversationMember> members;
}
