package com.muicochay.mory.shared.exception.otp;

import com.fantus.mory.shared.exception.BaseException;
import org.springframework.http.HttpStatus;

public class OtpInvalidEx extends BaseException {
    public OtpInvalidEx(String message) {
        super(message, HttpStatus.BAD_REQUEST);
    }
}
