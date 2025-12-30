package com.muicochay.mory.notification.service.connection;

import com.muicochay.mory.notification.enums.NotificationType;
import com.muicochay.mory.notification.helper.connection.ConnectionNotificationMetadata;
import com.muicochay.mory.notification.service.NotificationWsService;
import com.muicochay.mory.user.dto.UserPreviewResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ConnectionNotificationService {
    private final NotificationWsService notificationWsService;
    private final ConnectionNotificationMetadata metadataBuilder;

    public void sendConnectRequest(
            UUID toUserId,
            UserPreviewResponse fromUser
    ) {
        Map<String, Object> metadata = metadataBuilder.connectRequest(fromUser);

        notificationWsService.createAndSend(
                toUserId,
                NotificationType.CONNECTION_REQUEST,
                metadata,
                fromUser
        );
    }

    public void sendChangeConnectionTypeRequest(
            UUID toUserId,
            UserPreviewResponse fromUser,
            String fromType,
            String toType
    ) {
        Map<String, Object> metadata = metadataBuilder.changeConnectionTypeRequest(
                fromUser,
                fromType,
                toType
        );

        notificationWsService.createAndSend(
                toUserId,
                NotificationType.CONNECTION_REQUEST,
                metadata,
                fromUser
        );
    }

    public void sendConnectAccepted(
            UUID toUserId,
            UserPreviewResponse fromUser
    ) {
        Map<String, Object> metadata = metadataBuilder.connectAccepted(fromUser);

        notificationWsService.createAndSend(
                toUserId,
                NotificationType.CONNECTION_ACCEPTED,
                metadata,
                fromUser
        );
    }

    public void sendChangeConnectionTypeAccepted(
            UUID toUserId,
            UserPreviewResponse fromUser,
            String fromType,
            String toType
    ) {
        Map<String, Object> metadata = metadataBuilder.changeConnectionTypeAccepted(
                fromUser,
                fromType,
                toType
        );

        notificationWsService.createAndSend(
                toUserId,
                NotificationType.CONNECTION_ACCEPTED,
                metadata,
                fromUser
        );
    }
}
