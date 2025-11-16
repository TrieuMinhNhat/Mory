package com.muicochay.mory.admin.dto.question;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

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
