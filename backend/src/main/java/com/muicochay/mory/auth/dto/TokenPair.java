package com.muicochay.mory.auth.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TokenPair {
    private String accessToken;
    private String refreshToken;
    private String refreshTokenId;
}
