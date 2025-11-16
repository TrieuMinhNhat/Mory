package com.muicochay.mory.admin.controller;

import com.muicochay.mory.admin.dto.question.*;
import com.muicochay.mory.admin.service.AdminQuestionService;
import com.muicochay.mory.question.enums.QuestionType;
import com.muicochay.mory.shared.dto.ApiResponse;
import com.muicochay.mory.shared.enums.Locale;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/olyne-questions")
@RequiredArgsConstructor
public class AdminOlyneQuestionController {

    private final AdminQuestionService adminQuestionService;

    @PostMapping
    public ResponseEntity<ApiResponse<AdminQuestionResponse>> createQuestion(
            @RequestBody OlyneQuestionRequest questionRequest
    ) {
        AdminQuestionResponse adminQuestionResponse = adminQuestionService.addQuestion(
                questionRequest.getContentEN(),
                questionRequest.getContentVI(),
                questionRequest.getTopicId(),
                questionRequest.getDifficulty(),
                questionRequest.getType()
        );
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success(adminQuestionResponse, "Question created"));
    }

    @PostMapping("/topics")
    public ResponseEntity<ApiResponse<AdminTopicResponse>> createTopic(
            @RequestBody QuestionTopicRequest topicRequest
    ) {
        AdminTopicResponse adminTopicResponse = adminQuestionService.addTopic(
                topicRequest.getNameEN(),
                topicRequest.getNameVI(),
                topicRequest.getDescriptionEN(),
                topicRequest.getDescriptionVI()
        );
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success(adminTopicResponse, "QuestionTopic created"));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<AdminQuestionPageResponse>> getQuestions(
            @RequestParam(required = false) Integer topicId,
            @RequestParam(required = false) QuestionType type,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());

        AdminQuestionPageResponse questionPageResponse = adminQuestionService.getQuestionsAdmin(topicId, type, pageable);

        return ResponseEntity.ok(ApiResponse.success(questionPageResponse, ""));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Object>> deleteQuestion(
            @PathVariable(name = "id") Integer questionId
    ) {
        adminQuestionService.deleteQuestion(questionId);
        return ResponseEntity.ok(ApiResponse.success("", ""));
    }

    @GetMapping("/topics")
    public ResponseEntity<ApiResponse<List<AdminTopicResponse>>> getAllTopics(
            @RequestParam(defaultValue = "EN") Locale locale
    ) {
        return ResponseEntity.ok(ApiResponse.success(adminQuestionService.getAllTopicsAdmin(), ""));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<AdminQuestionResponse>> updateQuestion(
            @RequestBody UpdateQuestionRequest request,
            @PathVariable(name = "id") Integer questionId
    ) {
        AdminQuestionResponse response = adminQuestionService.updateQuestion(questionId, request);
        return ResponseEntity.ok(ApiResponse.success(response, ""));
    }

    @PutMapping("/topics/{id}")
    public ResponseEntity<ApiResponse<AdminTopicResponse>> updateTopic(
            @RequestBody UpdateTopicRequest request,
            @PathVariable(name = "id") Integer topicId
    ) {
        AdminTopicResponse response = adminQuestionService.updateTopic(topicId, request);
        return ResponseEntity.ok(ApiResponse.success(response, ""));
    }
}
