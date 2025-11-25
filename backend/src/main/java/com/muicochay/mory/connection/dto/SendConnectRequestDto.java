package com.muicochay.mory.connection.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class SendConnectRequestDto {
    private UUID recipientId;
    private String code;
    private String message;
}
