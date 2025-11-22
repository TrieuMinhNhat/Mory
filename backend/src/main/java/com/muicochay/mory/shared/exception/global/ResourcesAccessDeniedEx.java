package com.muicochay.mory.shared.exception.global;

import com.fantus.mory.shared.exception.BaseException;
import org.springframework.http.HttpStatus;

public class ResourcesAccessDeniedEx extends BaseException {
    public ResourcesAccessDeniedEx(String message) {
        super(message, HttpStatus.FORBIDDEN);
    }
}
