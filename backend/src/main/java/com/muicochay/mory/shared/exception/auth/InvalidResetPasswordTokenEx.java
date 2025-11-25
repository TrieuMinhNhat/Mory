package com.muicochay.mory.shared.exception.auth;

import com.muicochay.mory.shared.exception.BaseException;
import org.springframework.http.HttpStatus;

public class InvalidResetPasswordTokenEx extends BaseException {
    public InvalidResetPasswordTokenEx(String message) {
        super(message, HttpStatus.BAD_REQUEST);
    }
}
