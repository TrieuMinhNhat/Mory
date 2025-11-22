package com.muicochay.mory.admin.mapper;

import java.util.List;

import org.mapstruct.Mapper;

import com.muicochay.mory.admin.dto.question.AdminTopicResponse;
import com.muicochay.mory.question.entity.QuestionTopic;

@Mapper(componentModel = "spring")
public interface AdminTopicMapper {

    AdminTopicResponse toDto(QuestionTopic questionTopic);

    List<AdminTopicResponse> toDtoList(List<QuestionTopic> questionTopics);
}
