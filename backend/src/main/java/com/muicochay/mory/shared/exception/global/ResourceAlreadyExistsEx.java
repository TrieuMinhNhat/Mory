package com.muicochay.mory.shared.exception.global;

import com.fantus.mory.shared.exception.BaseException;
import org.springframework.http.HttpStatus;

public class ResourceAlreadyExistsEx extends BaseException {
    public ResourceAlreadyExistsEx(String message) {
        super(message, HttpStatus.CONFLICT);
    }
}
