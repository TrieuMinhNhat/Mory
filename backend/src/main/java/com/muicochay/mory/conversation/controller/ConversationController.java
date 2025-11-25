package com.muicochay.mory.conversation.controller;

import com.muicochay.mory.auth.model.AuthUserPrincipal;
import com.muicochay.mory.conversation.dto.ConversationPageResponse;
import com.muicochay.mory.conversation.service.ConversationService;
import com.muicochay.mory.shared.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.UUID;

@RestController
@RequestMapping("/api/conversations")
@RequiredArgsConstructor
public class ConversationController {
    private final ConversationService conversationService;

    @GetMapping()
    public ResponseEntity<ApiResponse<ConversationPageResponse>> getUserConversation(
            @AuthenticationPrincipal AuthUserPrincipal principal,
            @RequestParam(name = "cursorLastSentAt", required = false) Instant cursorLastSentAt,
            @RequestParam(name = "cursorId", required = false) UUID cursorId,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(name = "order", defaultValue = "DESC") String order
    ) {
        ConversationPageResponse response = conversationService.getConversationsByUser(
                principal.getId(),
                cursorLastSentAt,
                cursorId,
                order,
                size
        );
        return ResponseEntity.ok(ApiResponse.success(response, "Fetch user conversations successfully"));
    }
}
