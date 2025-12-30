package com.muicochay.mory.otp.enums;

import lombok.Getter;

import java.util.List;

/**
 * Enum representing the supported types of email templates used for various system notifications.
 * <p>
 * Each template type includes a corresponding template file name (without extension)
 * and a list of required variables that must be provided when rendering the template.
 */
public enum EmailTemplateType {
    OTP_VERIFY_REGISTRATION(
            "otp-verify-registration",
            List.of("otp")
    ),
    RESET_PASSWORD(
            "reset-password",
            List.of("resetLink")
    ),
    SECURITY_ALERT("security-alert",
            List.of("activity")
    ),
    EMAIL_VERIFIED("email-verified",
            List.of()
    ),
    OTP_SIGN_IN(
            "otp-sign-in",
            List.of("otp")
    );

    private final String fileName;
    @Getter
    private final List<String> requiredVariables;

    EmailTemplateType(String fileName, List<String> requiredVariables) {
        this.fileName = fileName;
        this.requiredVariables = requiredVariables;
    }
    /**
     * Returns the full path to the template file within the email template directory.
     *
     * @return the full relative path, e.g., {@code email/otp-verify-registration}
     */
    public String getFullPath() {
        return "email/" + fileName;
    }
}

