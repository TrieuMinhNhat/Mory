package com.muicochay.mory.admin.mapper;

import com.muicochay.mory.admin.dto.question.AdminQuestionResponse;
import com.muicochay.mory.question.entity.OlyneQuestion;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper(componentModel = "spring", uses = {AdminTopicMapper.class})
public interface AdminQuestionMapper {

    AdminQuestionResponse toDto(OlyneQuestion olyneQuestion);

    List<AdminQuestionResponse> toDtoList(List<OlyneQuestion> olyneQuestions);
}
