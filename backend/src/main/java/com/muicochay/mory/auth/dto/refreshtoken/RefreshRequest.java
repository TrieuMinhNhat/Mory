package com.muicochay.mory.auth.dto.refreshtoken;

import lombok.*;

@AllArgsConstructor
@NoArgsConstructor
@Builder
@Getter
@Setter
public class RefreshRequest {

    private String refreshToken;
}
