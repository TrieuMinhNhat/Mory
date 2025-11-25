package com.muicochay.mory.shared.exception.global;

import com.muicochay.mory.shared.exception.BaseException;
import org.springframework.http.HttpStatus;

public class InvalidArgumentEx extends BaseException {
    public InvalidArgumentEx(String message) {
        super(message, HttpStatus.BAD_REQUEST);
    }
}
