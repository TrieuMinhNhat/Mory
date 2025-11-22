package com.muicochay.mory.shared.exception.auth;

import com.fantus.mory.shared.dto.BlockInfoResponse;
import com.fantus.mory.shared.exception.BaseException;
import org.springframework.http.HttpStatus;

public class BlockedAccountEx extends BaseException {
    public BlockedAccountEx(String message, BlockInfoResponse response) {
        super(message, HttpStatus.FORBIDDEN, response);
    }
}
