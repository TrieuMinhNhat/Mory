package com.muicochay.mory.admin.service;

import com.muicochay.mory.admin.dto.question.*;
import com.muicochay.mory.question.entity.OlyneQuestion;
import com.muicochay.mory.question.entity.QuestionTopic;
import com.muicochay.mory.question.enums.QuestionType;
import com.muicochay.mory.admin.mapper.AdminQuestionMapper;
import com.muicochay.mory.admin.mapper.AdminTopicMapper;
import com.muicochay.mory.question.repository.OlyneQuestionRepository;
import com.muicochay.mory.question.repository.QuestionTopicRepository;
import com.muicochay.mory.shared.exception.global.ResourcesNotFoundEx;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminQuestionService {

    private final OlyneQuestionRepository questionRepository;
    private final QuestionTopicRepository topicRepository;

    private final AdminQuestionMapper adminQuestionMapper;
    private final AdminTopicMapper adminTopicMapper;

    public AdminTopicResponse addTopic(String nameEN, String nameVI, String descriptionEN, String descriptionVI) {
        QuestionTopic topic = QuestionTopic.builder()
                .nameEN(nameEN)
                .nameVI(nameVI)
                .descriptionEN(descriptionEN)
                .descriptionVI(descriptionVI)
                .build();
        return adminTopicMapper.toDto(topicRepository.save(topic));
    }

    public AdminQuestionResponse addQuestion(String contentEN, String contentVI, Integer topicId, Integer difficulty, QuestionType type) {
        QuestionTopic topic = topicRepository.findById(topicId)
                .orElseThrow(() -> new ResourcesNotFoundEx("Topic not found with id: " + topicId));
        OlyneQuestion question = OlyneQuestion.builder()
                .contentEN(contentEN)
                .contentVI(contentVI)
                .topic(topic)
                .difficulty(difficulty)
                .type(type)
                .active(true)
                .build();
        return adminQuestionMapper.toDto(questionRepository.save(question));
    }

    public AdminQuestionPageResponse getQuestionsAdmin(Integer topicId, QuestionType type, Pageable pageable) {
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

        List<AdminQuestionResponse> responses = result
                .getContent()
                .stream()
                .map(adminQuestionMapper::toDto)
                .toList();

        return AdminQuestionPageResponse.builder()
                .questions(responses)
                .totalPages(result.getTotalPages())
                .currentPage(result.getNumber())
                .hasNext(result.hasNext())
                .build();
    }

    public void deleteQuestion(Integer questionId) {
        questionRepository.deleteById(questionId);
    }

    public List<AdminTopicResponse> getAllTopicsAdmin() {
        return adminTopicMapper.toDtoList(topicRepository.findAll());
    }

    public AdminQuestionResponse updateQuestion(Integer questionId, UpdateQuestionRequest request) {
        OlyneQuestion question = questionRepository.findById(questionId)
                .orElseThrow(() -> new ResourcesNotFoundEx("Question not found with id: " + questionId));;
        if (!request.getContentEN().equals(question.getContentEN())) {
            question.setContentEN(request.getContentEN());
        }
        if (!request.getContentVI().equals(question.getContentVI())) {
            question.setContentVI(request.getContentVI());
        }
        if (!request.getDifficulty().equals(question.getDifficulty())) {
            question.setDifficulty(request.getDifficulty());
        }
        if (!request.getType().equals(question.getType())) {
            question.setType(request.getType());
        }
        if (request.isActive() != question.isActive()) {
            question.setActive(request.isActive());
        }
        return adminQuestionMapper.toDto(questionRepository.save(question));
    }

    public AdminTopicResponse updateTopic(Integer topicId, UpdateTopicRequest request) {
        QuestionTopic topic = topicRepository.findById(topicId)
                .orElseThrow(() -> new ResourcesNotFoundEx("Topic not found with id: " + topicId));
        if (!request.getNameEN().equals(topic.getNameEN())) {
            topic.setNameEN(request.getNameEN());
        }
        if (!request.getNameVI().equals(topic.getNameVI())) {
            topic.setNameVI(request.getNameVI());
        }
        if (!request.getDescriptionEN().equals(topic.getDescriptionEN())) {
            topic.setDescriptionEN(request.getDescriptionEN());
        }
        if (!request.getDescriptionVI().equals(topic.getDescriptionVI())) {
            topic.setDescriptionVI(request.getDescriptionVI());
        }
        return adminTopicMapper.toDto(topicRepository.save(topic));
    }
}
