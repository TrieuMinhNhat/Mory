package com.muicochay.mory.moment.dto;

import com.muicochay.mory.shared.enums.ReactionType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MomentReactionDto {
    private UUID momentId;
    private ReactionType userReaction;
}
