package com.muicochay.mory.shared.exception.connection;

import com.fantus.mory.shared.dto.MaxRelationshipLimitResponse;
import com.fantus.mory.shared.exception.BaseException;
import org.springframework.http.HttpStatus;

public class MaxConnectionLimitEx extends BaseException {
    public MaxConnectionLimitEx(String message, MaxRelationshipLimitResponse response) {
        super(message, HttpStatus.BAD_REQUEST, response);
    }
}
