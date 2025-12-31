package com.muicochay.mory.notification.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class NotificationPageResponse {
    private List<NotificationResponse> notifications;
    private boolean hasNext;
    private Instant nextCursorCreatedAt;
    private UUID nextCursorId;
}
