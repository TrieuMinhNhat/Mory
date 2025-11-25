package com.muicochay.mory.auth.dto.forgotpassword;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Represents a request to initiate the forgot password process. This DTO
 * contains the user's email address, which will be used to send a reset
 * password link.
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ForgotPasswordRequest {

    @Email
    @NotBlank
    private String email;
}
