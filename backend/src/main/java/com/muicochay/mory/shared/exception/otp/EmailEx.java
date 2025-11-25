package com.muicochay.mory.shared.exception.otp;

import com.muicochay.mory.shared.exception.BaseException;
import org.springframework.http.HttpStatus;

public class EmailEx extends BaseException {
    public EmailEx(String message) {
        super(message, HttpStatus.BAD_REQUEST);
    }
}
