package com.muicochay.mory.auth.dto;

import com.muicochay.mory.user.dto.UserProfileDto;
import com.muicochay.mory.user.enums.RoleCode;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

/**
 * Represents the user information returned after a successful authentication
 * request. This DTO is typically used to populate the frontend user profile
 * upon login.
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class AuthUserResponse {

    private UUID id;
    private String email;
    private boolean isVerified;
    private UserProfileDto profile;
    private RoleCode roleCode;
}
