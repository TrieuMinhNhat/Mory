package com.muicochay.mory.question.service;

import com.muicochay.mory.question.dto.*;
import com.muicochay.mory.question.entity.OlyneQuestion;
import com.muicochay.mory.question.enums.QuestionType;
import com.muicochay.mory.question.mapper.OlyneQuestionMapper;
import com.muicochay.mory.question.mapper.QuestionTopicMapper;
import com.muicochay.mory.question.repository.OlyneQuestionRepository;
import com.muicochay.mory.question.repository.QuestionTopicRepository;
import com.muicochay.mory.shared.enums.Locale;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class OlyneQuestionService {
    private final OlyneQuestionRepository questionRepository;
    private final QuestionTopicRepository topicRepository;

    private final OlyneQuestionMapper olyneQuestionMapper;
    private final QuestionTopicMapper questionTopicMapper;

    public OlyneQuestionPageResponse getQuestions(Integer topicId, QuestionType type, Pageable pageable, Locale locale) {
        Page<OlyneQuestion> result;

        if (topicId != null && type != null) {
            result = questionRepository.findByTopic_IdAndType(topicId, type, pageable);
        } else if (topicId != null) {
            result = questionRepository.findByTopic_Id(topicId, pageable);
        } else if (type != null) {
            result = questionRepository.findByType(type, pageable);
        } else {
            result = questionRepository.findAll(pageable);
        }

        List<OlyneQuestionResponse> responses = result
                .getContent()
                .stream()
                .map(q -> olyneQuestionMapper.toDto(q, locale))
                .toList();

        return OlyneQuestionPageResponse.builder()
                .questions(responses)
                .totalPages(result.getTotalPages())
                .currentPage(result.getNumber())
                .hasNext(result.hasNext())
                .build();
    }

    public List<QuestionTopicResponse> getAllTopics(Locale locale) {
        return questionTopicMapper.toDtoList(topicRepository.findAll(), locale);
    }


}
