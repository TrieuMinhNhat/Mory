package com.muicochay.mory.question.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class OlyneQuestionPageResponse {
    private List<OlyneQuestionResponse> questions;
    private int totalPages;
    private int currentPage;
    private boolean hasNext;
}
