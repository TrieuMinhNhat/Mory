package com.muicochay.mory.moment.dto;

import com.fantus.mory.shared.enums.ReactionType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MomentReactionRequest {
    private ReactionType reactionType;
}
