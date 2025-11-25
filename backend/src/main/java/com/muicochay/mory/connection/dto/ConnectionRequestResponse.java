package com.muicochay.mory.connection.dto;

import com.fantus.mory.connection.enums.ConnectionType;
import com.fantus.mory.connection.enums.RequestStatus;
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
public class ConnectionRequestResponse {
    private UUID id;
    private ConnectionType newConnectionType;
    private ConnectionType oldConnectionType;
    private UserPreviewResponse requester;
    private UserPreviewResponse recipient;
    private List<UserPreviewResponse> mutualConnections;
    private String message;
    private RequestStatus status;
    private Instant createdAt;
}
