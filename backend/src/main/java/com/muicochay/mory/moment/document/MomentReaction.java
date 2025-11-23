package com.muicochay.mory.moment.document;

import com.fantus.mory.shared.enums.ReactionType;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.bson.types.ObjectId;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Map;
import java.util.UUID;

@Document(collection = "moment_reactions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MomentReaction {
    @Id
    private ObjectId id;

    @Indexed(unique = true)
    private ObjectId momentId;

    private Map<UUID, ReactionType> userReactions;

    public int getTotalReactions() {
        if (userReactions == null || userReactions.isEmpty()) {
            return 0;
        }
        return userReactions.size();
    }
}