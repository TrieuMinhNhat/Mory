package com.muicochay.mory.moment.dto;

import com.muicochay.mory.shared.enums.ReactionType;
import com.muicochay.mory.user.dto.UserPreviewResponse;
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
