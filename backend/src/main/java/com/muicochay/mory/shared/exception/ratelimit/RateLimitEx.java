package com.muicochay.mory.shared.exception.ratelimit;

import com.muicochay.mory.shared.exception.BaseException;
import org.springframework.http.HttpStatus;

public class RateLimitEx extends BaseException {
    public RateLimitEx(String message) {
        super(message, HttpStatus.TOO_MANY_REQUESTS);
    }
}
