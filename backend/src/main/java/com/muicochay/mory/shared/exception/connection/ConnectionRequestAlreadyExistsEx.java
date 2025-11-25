package com.muicochay.mory.shared.exception.connection;

import com.muicochay.mory.shared.dto.ConnectionRequestAlreadyExistsExResponse;
import com.muicochay.mory.shared.exception.BaseException;
import org.springframework.http.HttpStatus;

public class ConnectionRequestAlreadyExistsEx extends BaseException {
    public ConnectionRequestAlreadyExistsEx(String message, ConnectionRequestAlreadyExistsExResponse response) {
        super(message, HttpStatus.BAD_REQUEST, response);
    }
}
