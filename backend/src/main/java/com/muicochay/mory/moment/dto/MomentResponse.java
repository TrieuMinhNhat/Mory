package com.muicochay.mory.moment.dto;


import com.muicochay.mory.shared.enums.ReactionType;
import com.muicochay.mory.shared.enums.Visibility;
import com.muicochay.mory.user.dto.UserPreviewResponse;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class MomentResponse {
    private String id;
    private MomentStoryDto story;
    private UserPreviewResponse user;
    private String mediaUrl;
    private String audioUrl;
    private String caption;
    private Visibility visibility;
    // BEFORE_AFTER
    private Integer position;
    // JOURNEY && CHALLENGE
    private Integer dayIndex;
    private Instant createdAt;
    private Instant lastModifiedAt;
    private boolean milestone;

    private List<UUID> tags;

    private Integer totalReactions;
    private List<ReactionPreviewDto> reactionPreviews;

    private ReactionType myReaction;
}
