package com.muicochay.mory.question.mapper;

import com.muicochay.mory.question.dto.OlyneQuestionResponse;
import com.muicochay.mory.question.dto.QuestionTopicResponse;
import com.muicochay.mory.question.entity.OlyneQuestion;
import com.muicochay.mory.shared.enums.Locale;
import org.springframework.stereotype.Component;


@Component
public class OlyneQuestionMapper {

    public OlyneQuestionResponse toDto(OlyneQuestion entity, Locale locale) {
        return OlyneQuestionResponse.builder()
                .content(entity.getContentByLocale(locale))
                .topic(new QuestionTopicResponse(
                        entity.getTopic().getId(),
                        entity.getTopic().getNameByLocale(locale),
                        entity.getTopic().getDescriptionByLocale(locale)
                ))
                .difficulty(entity.getDifficulty())
                .type(entity.getType())
                .active(entity.isActive())
                .build();
    }
}
