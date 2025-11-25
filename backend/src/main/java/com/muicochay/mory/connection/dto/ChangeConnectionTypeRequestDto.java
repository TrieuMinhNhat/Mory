package com.muicochay.mory.connection.dto;

import com.fantus.mory.connection.enums.ConnectionType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ChangeConnectionTypeRequestDto {
    private UUID recipientId;
    private ConnectionType newType;
    private String message;
}
