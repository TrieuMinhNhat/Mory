package com.muicochay.mory.moment.dto;

import com.muicochay.mory.shared.enums.ReactionType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.bson.types.ObjectId;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MomentReactionDto {
    private ObjectId momentId;
    private ReactionType userReaction;
}
