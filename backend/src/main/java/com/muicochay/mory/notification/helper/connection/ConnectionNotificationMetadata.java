package com.muicochay.mory.notification.helper.connection;

import com.muicochay.mory.notification.enums.ConnectionNotificationVariant;
import com.muicochay.mory.user.dto.UserPreviewResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
@RequiredArgsConstructor
public class ConnectionNotificationMetadata {

    public Map<String, Object> connectRequest(UserPreviewResponse fromUser) {
        return Map.of(
                "variant", ConnectionNotificationVariant.CONNECT,
                "fromUserId", fromUser.getId()
        );
    }

    public Map<String, Object> changeConnectionTypeRequest(
            UserPreviewResponse fromUser,
            String fromType,
            String toType
    ) {
        return Map.of(
                "variant", ConnectionNotificationVariant.CHANGE_TYPE,
                "fromUserId", fromUser.getId(),
                "fromConnectionType", fromType,
                "toConnectionType", toType
        );
    }

    public Map<String, Object> connectAccepted(UserPreviewResponse fromUser) {
        return Map.of(
                "variant", ConnectionNotificationVariant.CONNECT,
                "fromUserId", fromUser.getId()
        );
    }

    public Map<String, Object> changeConnectionTypeAccepted(
            UserPreviewResponse fromUser,
            String fromType,
            String toType
    ) {
        return Map.of(
                "variant", ConnectionNotificationVariant.CHANGE_TYPE,
                "fromUserId", fromUser.getId(),
                "fromConnectionType", fromType,
                "toConnectionType", toType
        );
    }
}