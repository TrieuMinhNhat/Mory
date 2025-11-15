package com.muicochay.mory.question.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class QuestionTopicResponse {
    private Integer id;
    private String name;
    private String description;
}
