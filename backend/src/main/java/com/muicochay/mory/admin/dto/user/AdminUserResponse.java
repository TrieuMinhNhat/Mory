package com.muicochay.mory.admin.dto.user;

import com.muicochay.mory.auth.enums.AuthProvider;
import com.muicochay.mory.user.dto.UserProfileDto;
import com.muicochay.mory.user.enums.RoleCode;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.Set;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class AdminUserResponse {

    private UUID id;
    private String email;
    private UserProfileDto profile;
    private RoleCode roleCode;
    private Set<AuthProvider> providers;
    private Instant createdAt;
    @JsonProperty("isDeleted")
    private boolean isDeleted;
    @JsonProperty("isPasswordVerified")
    private boolean isPasswordVerified;
    @JsonProperty("isBlocked")
    private boolean isBlocked;
}
