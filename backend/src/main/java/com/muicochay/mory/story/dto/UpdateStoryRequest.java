package com.muicochay.mory.story.dto;

import com.fantus.mory.shared.enums.Visibility;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class UpdateStoryRequest {
    private String title;
    private Visibility visibility;
    private LocalDate startDate;
    private LocalDate endDate;
}
