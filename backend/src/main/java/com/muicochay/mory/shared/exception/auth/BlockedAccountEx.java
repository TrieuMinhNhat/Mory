package com.muicochay.mory.shared.exception.auth;

import com.muicochay.mory.shared.dto.BlockInfoResponse;
import com.muicochay.mory.shared.exception.BaseException;
import org.springframework.http.HttpStatus;

public class BlockedAccountEx extends BaseException {
    public BlockedAccountEx(String message, BlockInfoResponse response) {
        super(message, HttpStatus.FORBIDDEN, response);
    }
}
