package com.muicochay.mory.shared.exception.otp;

import com.fantus.mory.shared.exception.BaseException;
import org.springframework.http.HttpStatus;

public class MissingEmailVariablesEx extends BaseException {
    public MissingEmailVariablesEx(String message) {
        super(message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
