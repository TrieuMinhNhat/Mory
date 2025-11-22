package com.muicochay.mory.shared.exception.auth;

import com.fantus.mory.shared.exception.BaseException;
import org.springframework.http.HttpStatus;

public class EmailAlreadyVerifiedEx extends BaseException {
    public EmailAlreadyVerifiedEx(String message) {
        super(message, HttpStatus.BAD_REQUEST);
    }
}
