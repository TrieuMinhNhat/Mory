package com.muicochay.mory.user.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.web.multipart.MultipartFile;

/**
 * Represents the request payload for onboarding a user. This data is typically
 * collected after account creation to complete the user's profile.
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class OnboardingRequest {

    private String displayName;
    private String avatarImageUrl;
}
