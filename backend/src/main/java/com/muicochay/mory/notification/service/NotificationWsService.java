package com.muicochay.mory.notification.service;

import com.muicochay.mory.notification.dto.NotificationResponse;
import com.muicochay.mory.notification.enums.NotificationType;
import com.muicochay.mory.user.dto.UserPreviewResponse;
import com.muicochay.mory.websocket.constants.WebsocketDestinations;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationWsService {
    private final NotificationService notificationService;
    private final SimpMessagingTemplate messagingTemplate;

    public void createAndSend(
            UUID userId,
            NotificationType type,
            Map<String, Object> metadata,
            UserPreviewResponse fromUser
    ) {
        NotificationResponse notification =
                notificationService.createNotification(userId, type, metadata, fromUser);

        send(notification);
    }

    public void send(NotificationResponse notification) {
        log.info("notification sent to user with id: {}", notification.getUserId());
        messagingTemplate.convertAndSendToUser(
                String.valueOf(notification.getUserId()),
                WebsocketDestinations.USER_QUEUE_NOTIFICATIONS,
                notification
        );
    }
}
