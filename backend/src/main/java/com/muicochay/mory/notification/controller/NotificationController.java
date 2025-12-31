package com.muicochay.mory.notification.controller;

import com.muicochay.mory.auth.model.AuthUserPrincipal;
import com.muicochay.mory.notification.dto.NotificationPageResponse;
import com.muicochay.mory.notification.service.NotificationService;
import com.muicochay.mory.shared.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/notifications")
public class NotificationController {
    private final NotificationService notificationService;

    @GetMapping
    public ResponseEntity<ApiResponse<NotificationPageResponse>> getUserNotifications(
            @AuthenticationPrincipal AuthUserPrincipal principal,
            @RequestParam(required = false) Instant cursorCreatedAt,
            @RequestParam(required = false) UUID cursorId,
            @RequestParam(defaultValue = "20") int size
    ) {
        NotificationPageResponse response = notificationService.getUserNotifications(
                principal.getId(),
                cursorCreatedAt,
                cursorId,
                size
        );
        return ResponseEntity.ok(ApiResponse.success(response, "Fetched notifications successfully"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Object>> deleteNotification(
            @AuthenticationPrincipal AuthUserPrincipal principal,
            @PathVariable(name = "id") UUID notificationId
    ) {
        notificationService.deleteNotification(
                principal.getId(),
                notificationId

        );
        return ResponseEntity.ok(ApiResponse.success(null, "Notification deleted successfully"));
    }
}
