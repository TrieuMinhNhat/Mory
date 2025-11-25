package com.muicochay.mory.auth.dto.refreshtoken;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class RefreshTokenRedisData {

    private UUID userId;
    private Long createAt;
    private String ip;
    private String userAgent;
    private boolean revoked;
}
