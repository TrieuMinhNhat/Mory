package com.muicochay.mory.story.dto;

import com.muicochay.mory.shared.enums.Visibility;
import com.muicochay.mory.story.enums.StoryScope;
import com.muicochay.mory.story.enums.StoryType;
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
public class StoryRequest {
    private StoryType type;
    private String title;
    private StoryScope scope;
    private Visibility visibility;
    private LocalDate startDate;
    private LocalDate endDate;
    private Integer duration;
    private List<UUID> memberIds;
}
