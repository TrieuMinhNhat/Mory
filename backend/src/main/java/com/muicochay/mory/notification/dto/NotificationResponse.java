package com.muicochay.mory.notification.dto;

import com.muicochay.mory.notification.enums.NotificationType;
import com.muicochay.mory.user.dto.UserPreviewResponse;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class NotificationResponse {
    private UUID id;
    private UUID userId;
    private NotificationType type;
    private UserPreviewResponse fromUser;
    private Map<String, Object> metadata;
    private Instant createdAt;
}
