package com.muicochay.mory.question.repository;

import com.muicochay.mory.question.entity.QuestionTopic;
import org.springframework.data.jpa.repository.JpaRepository;


public interface QuestionTopicRepository extends JpaRepository<QuestionTopic, Integer> {
}
