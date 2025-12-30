package com.muicochay.mory.story.dto;

import com.muicochay.mory.story.enums.StoryMomentHandling;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class DeleteStoryResponse {
    private StoryMomentHandling momentHandling;
    private int affectedMomentCount;
}
