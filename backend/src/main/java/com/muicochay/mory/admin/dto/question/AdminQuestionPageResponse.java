package com.muicochay.mory.admin.dto.question;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class AdminQuestionPageResponse {
    private List<AdminQuestionResponse> questions;
    private int totalPages;
    private int currentPage;
    private boolean hasNext;
}
