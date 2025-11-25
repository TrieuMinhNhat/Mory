package com.muicochay.mory.auth.dto;

import com.muicochay.mory.shared.dto.BlockInfoResponse;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Oauth2SignInOrRegisterResult {

    private BlockInfoResponse blockInfoResponse;
    private TokenPair tokenPair;
}
