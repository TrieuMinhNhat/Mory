package com.muicochay.mory.story.dto;

import com.fantus.mory.shared.enums.Visibility;
import com.fantus.mory.story.enums.StoryScope;
import com.fantus.mory.story.enums.StoryType;
import com.fantus.mory.user.dto.UserPreviewResponse;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class StoryResponse {
    private UUID id;
    private UserPreviewResponse creator;
    private StoryType type;
    private String title;
    private StoryScope scope;
    private Visibility visibility;
    private boolean hasBefore;
    private boolean hasAfter;
    private LocalDate startDate;
    private LocalDate endDate;
    private Integer duration;
    private List<UserPreviewResponse> members;
    private StoryMomentPreviewsInfo momentsInfo;
}
