package com.muicochay.mory.conversation.document;

import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.UUID;

@Document(collection = "messages")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@CompoundIndex(name = "conversation_createdAt_idx", def = "{'conversationId': 1, 'createdAt': -1}")
public class ChatMessage {
    @Id
    private String id;
    private UUID conversationId;
    private UUID senderId;

    @NonNull
    private String text;

    private String replyToMessageId;

    private UUID replyToMomentId;

    @CreatedDate
    private Instant createdAt;

    @LastModifiedDate
    private Instant updatedAt;
}
