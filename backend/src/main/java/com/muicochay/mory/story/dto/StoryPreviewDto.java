package com.muicochay.mory.story.dto;


import com.muicochay.mory.story.enums.StoryScope;
import com.muicochay.mory.story.enums.StoryType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class StoryPreviewDto {
    private UUID id;
    private StoryType type;
    private String title;
    private StoryScope scope;
    private Integer duration;
}
