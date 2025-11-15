package com.muicochay.mory.question.dto;

import com.fantus.mory.question.enums.QuestionType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class OlyneQuestionResponse {
    private String content;
    private QuestionTopicResponse topic;
    private Integer difficulty;
    private QuestionType type;
    private boolean active;
}
