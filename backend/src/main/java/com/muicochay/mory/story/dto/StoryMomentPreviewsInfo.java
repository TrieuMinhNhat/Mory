package com.muicochay.mory.story.dto;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class StoryMomentPreviewsInfo {
    private long total;
    private List<StoryMomentPreviewDto> previews;

}
