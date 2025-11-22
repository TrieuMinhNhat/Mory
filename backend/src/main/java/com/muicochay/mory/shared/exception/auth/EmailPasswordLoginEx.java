package com.muicochay.mory.shared.exception.auth;

import com.fantus.mory.shared.exception.BaseException;
import org.springframework.http.HttpStatus;

public class EmailPasswordLoginEx extends BaseException {
    public EmailPasswordLoginEx(String message) {
        super(message, HttpStatus.UNAUTHORIZED);
    }
}
