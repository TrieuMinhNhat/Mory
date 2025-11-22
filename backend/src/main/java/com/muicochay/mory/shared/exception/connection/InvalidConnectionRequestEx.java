package com.muicochay.mory.shared.exception.connection;

import com.fantus.mory.shared.exception.BaseException;
import org.springframework.http.HttpStatus;

public class InvalidConnectionRequestEx extends BaseException {
    public InvalidConnectionRequestEx(String message) {
        super(message, HttpStatus.BAD_REQUEST);
    }
}
