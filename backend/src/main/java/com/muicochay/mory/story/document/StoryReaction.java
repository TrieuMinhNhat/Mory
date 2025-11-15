package com.muicochay.mory.story.document;

import com.fantus.mory.shared.enums.ReactionType;
import jakarta.persistence.Id;
import lombok.*;
import org.bson.types.ObjectId;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Map;
import java.util.UUID;

@Document(collection = "story_reactions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
public class StoryReaction {
    @Id
    private ObjectId id;

    private UUID storyId;

    private Map<ReactionType, Integer> reactions;

    private Map<UUID, ReactionType> userReactions;
}