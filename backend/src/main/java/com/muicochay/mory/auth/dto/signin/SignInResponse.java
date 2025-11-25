package com.muicochay.mory.auth.dto.signin;

import com.muicochay.mory.auth.dto.AuthUserResponse;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class SignInResponse {

    private String accessToken;
    private String refreshToken;
    private AuthUserResponse user;
}
