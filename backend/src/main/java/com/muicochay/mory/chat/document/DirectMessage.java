package com.muicochay.mory.chat.document;

import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.bson.types.ObjectId;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.UUID;

@Document(collection = "direct_messages")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DirectMessage {
    @Id
    private ObjectId id;
    private UUID relationshipId;
    private UUID senderId;
    private String text;
    private Instant createAt = Instant.now();
}
