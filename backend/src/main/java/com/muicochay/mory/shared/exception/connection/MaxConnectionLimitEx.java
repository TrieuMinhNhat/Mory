package com.muicochay.mory.shared.exception.connection;

import com.muicochay.mory.shared.dto.MaxRelationshipLimitResponse;
import com.muicochay.mory.shared.exception.BaseException;
import org.springframework.http.HttpStatus;

public class MaxConnectionLimitEx extends BaseException {
    public MaxConnectionLimitEx(String message, MaxRelationshipLimitResponse response) {
        super(message, HttpStatus.BAD_REQUEST, response);
    }
}
