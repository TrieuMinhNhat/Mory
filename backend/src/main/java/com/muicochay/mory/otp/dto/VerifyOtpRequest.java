package com.muicochay.mory.otp.dto;

import lombok.*;

@Builder
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class VerifyOtpRequest {
    private String inputOtp;
}
