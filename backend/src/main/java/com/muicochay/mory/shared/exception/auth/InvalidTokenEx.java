package com.muicochay.mory.shared.exception.auth;

import com.fantus.mory.shared.exception.BaseException;
import org.springframework.http.HttpStatus;

public class InvalidTokenEx extends BaseException {
    public InvalidTokenEx(String message) {
        super(message, HttpStatus.UNAUTHORIZED);
    }
}
