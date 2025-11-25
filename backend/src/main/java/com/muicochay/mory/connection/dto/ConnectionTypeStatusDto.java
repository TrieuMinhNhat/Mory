package com.muicochay.mory.connection.dto;

import com.fantus.mory.connection.enums.ConnectionStatus;
import com.fantus.mory.connection.enums.ConnectionType;
import com.fantus.mory.user.dto.UserPreviewResponse;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ConnectionTypeStatusDto {
    private UUID userId;
    private ConnectionType connectionType;
    private ConnectionStatus status;
    private List<UserPreviewResponse> mutualConnections;
}
