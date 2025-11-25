package com.muicochay.mory.story.dto;

import com.muicochay.mory.story.enums.LeaveStoryAction;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class LeaveStoryRequest {
    private LeaveStoryAction action;
}
