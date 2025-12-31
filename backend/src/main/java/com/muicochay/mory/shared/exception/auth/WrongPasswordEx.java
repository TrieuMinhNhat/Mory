package com.muicochay.mory.shared.exception.auth;

import com.muicochay.mory.shared.exception.BaseException;
import org.springframework.http.HttpStatus;

public class WrongPasswordEx extends BaseException {
    public WrongPasswordEx(String message, Boolean wrongPassword) {
        super(message, HttpStatus.BAD_REQUEST, wrongPassword);
    }
}
