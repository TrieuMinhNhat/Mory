package com.muicochay.mory.question.mapper;

import com.muicochay.mory.question.dto.QuestionTopicResponse;
import com.muicochay.mory.question.entity.QuestionTopic;
import com.muicochay.mory.shared.enums.Locale;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class QuestionTopicMapper {

    public QuestionTopicResponse toDto(QuestionTopic entity, Locale locale) {
        return QuestionTopicResponse.builder()
                .id(entity.getId())
                .name(entity.getNameByLocale(locale))
                .description(entity.getDescriptionByLocale(locale))
                .build();
    }

    public List<QuestionTopicResponse> toDtoList(List<QuestionTopic> entities, Locale locale) {
        return entities.stream()
                .map(topic -> toDto(topic, locale))
                .toList();
    }
}
