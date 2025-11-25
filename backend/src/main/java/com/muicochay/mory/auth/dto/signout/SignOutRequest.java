package com.muicochay.mory.auth.dto.signout;

import lombok.*;

@AllArgsConstructor
@NoArgsConstructor
@Builder
@Getter
@Setter
public class SignOutRequest {

    private String refreshToken;
}
