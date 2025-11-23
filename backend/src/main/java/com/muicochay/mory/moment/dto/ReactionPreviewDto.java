package com.muicochay.mory.moment.dto;

import com.fantus.mory.shared.enums.ReactionType;
import com.fantus.mory.user.dto.UserPreviewResponse;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ReactionPreviewDto {
    private UserPreviewResponse user;
    private ReactionType reactionType;
}
