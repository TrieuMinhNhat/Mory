package com.muicochay.mory.auth.dto.forgotpassword;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class PasswordResetTokenData {

    private String email;
    private LocalDateTime expiry;
}
