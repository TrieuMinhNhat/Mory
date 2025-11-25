package com.muicochay.mory.shared.exception.auth;

import com.muicochay.mory.shared.exception.BaseException;
import org.springframework.http.HttpStatus;

public class SamePasswordEx extends BaseException {
    public SamePasswordEx(String message, Boolean samePassword) {
        super(message, HttpStatus.BAD_REQUEST, samePassword);
    }
}
