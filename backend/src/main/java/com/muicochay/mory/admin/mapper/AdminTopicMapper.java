package com.muicochay.mory.admin.mapper;

import com.muicochay.mory.admin.dto.question.AdminTopicResponse;
import com.muicochay.mory.question.entity.QuestionTopic;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper(componentModel = "spring")
public interface AdminTopicMapper {
    AdminTopicResponse toDto(QuestionTopic questionTopic);

    List<AdminTopicResponse> toDtoList(List<QuestionTopic> questionTopics);
}
