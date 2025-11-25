package com.muicochay.mory.shared.exception.global;

import com.muicochay.mory.shared.exception.BaseException;
import org.springframework.http.HttpStatus;

public class MediaUploadEx extends BaseException {
    public MediaUploadEx(String message) {
        super(message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
