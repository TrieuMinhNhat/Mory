package com.muicochay.mory.story.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class LeaveStoryResponse {
    private int affectedMomentCount;
    private StoryResponse storyResponse;
}
