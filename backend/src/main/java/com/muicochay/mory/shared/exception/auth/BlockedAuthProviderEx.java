package com.muicochay.mory.shared.exception.auth;

import com.muicochay.mory.auth.dto.signin.BlockedAuthProviderResponse;
import com.muicochay.mory.shared.exception.BaseException;
import org.springframework.http.HttpStatus;

public class BlockedAuthProviderEx extends BaseException {
    public BlockedAuthProviderEx(String message, BlockedAuthProviderResponse response) {
        super(message, HttpStatus.FORBIDDEN, response);
    }
}
