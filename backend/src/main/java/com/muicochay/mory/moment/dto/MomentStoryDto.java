package com.muicochay.mory.moment.dto;


import com.fantus.mory.story.enums.StoryScope;
import com.fantus.mory.story.enums.StoryType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class MomentStoryDto {
    private UUID id;
    private StoryType type;
    private String title;
    private StoryScope scope;
    private Integer duration;
}
