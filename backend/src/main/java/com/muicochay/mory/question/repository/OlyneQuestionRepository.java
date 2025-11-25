package com.muicochay.mory.question.repository;

import com.muicochay.mory.question.entity.OlyneQuestion;
import com.muicochay.mory.question.enums.QuestionType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;


public interface OlyneQuestionRepository extends JpaRepository<OlyneQuestion, Integer> {
    Page<OlyneQuestion> findByTopic_Id(Integer topicId, Pageable pageable);
    Page<OlyneQuestion> findByType(QuestionType type, Pageable pageable);
    Page<OlyneQuestion> findByTopic_IdAndType(Integer topicId, QuestionType type, Pageable pageable);
}
