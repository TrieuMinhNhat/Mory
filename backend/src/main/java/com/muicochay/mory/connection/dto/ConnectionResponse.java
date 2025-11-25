package com.muicochay.mory.connection.dto;

import com.fantus.mory.connection.enums.ConnectionStatus;
import com.fantus.mory.connection.enums.ConnectionType;
import com.fantus.mory.user.dto.UserPreviewResponse;
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
public class ConnectionResponse {
    private UUID id;
    private UserPreviewResponse user1;
    private UserPreviewResponse user2;
    private List<UserPreviewResponse> mutualConnections;
    private ConnectionType connectionType;
    private ConnectionStatus status;
    private Boolean hasPendingRequest;
    private Instant createdAt;
}
