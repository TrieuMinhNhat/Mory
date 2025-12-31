package com.muicochay.mory.shared.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public abstract class BaseException extends RuntimeException {
    private final HttpStatus status;
    private final Object data;

    public BaseException(String message, HttpStatus status) {
        super(message);
        this.status = status;
        this.data = null;
    }

    public BaseException(String message, HttpStatus status, Object data) {
        super(message);
        this.status = status;
        this.data = data;
    }

}
