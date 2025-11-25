package com.muicochay.mory.auth.dto.signin;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class EmailPasswordSignInRequest {

    private String email;
    private CharSequence password;
}
