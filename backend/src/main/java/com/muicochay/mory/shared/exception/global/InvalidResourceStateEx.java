package com.muicochay.mory.shared.exception.global;

import com.fantus.mory.shared.exception.BaseException;
import org.springframework.http.HttpStatus;

public class InvalidResourceStateEx extends BaseException {
    public InvalidResourceStateEx(String message) {
        super(message, HttpStatus.BAD_REQUEST);
    }
}
