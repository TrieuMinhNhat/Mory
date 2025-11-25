package com.muicochay.mory.auth.dto.signin;

import com.muicochay.mory.auth.enums.AuthProvider;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class BlockedAuthProviderResponse {

    private AuthProvider blockedProvider;
}
