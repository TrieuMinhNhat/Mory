package com.muicochay.mory.admin.dto.question;

import com.muicochay.mory.question.enums.QuestionType;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class OlyneQuestionRequest {

    private String contentEN;
    private String contentVI;
    private Integer topicId;
    private Integer difficulty;
    private QuestionType type;
}
