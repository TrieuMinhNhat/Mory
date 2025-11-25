package com.muicochay.mory.auth.dto.forgotpassword;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Represents the request body for resetting a user's password. This includes
 * the user's email, the reset token (usually sent via email), and the new
 * password to be set.
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ResetPasswordRequest {

    private String email;
    private String token;
    private CharSequence newPassword;
}
