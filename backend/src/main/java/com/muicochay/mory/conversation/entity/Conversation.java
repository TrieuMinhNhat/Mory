package com.muicochay.mory.conversation.entity;

import com.muicochay.mory.conversation.enums.ConversationType;
import com.muicochay.mory.shared.entity.BaseAuditEntity;
import jakarta.persistence.*;
import lombok.*;

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

    @Column(length = 40)
    private String lastMessageId;

    private UUID lastMessageSenderId;
}
