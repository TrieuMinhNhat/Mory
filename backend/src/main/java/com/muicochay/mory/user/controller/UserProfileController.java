package com.muicochay.mory.user.controller;

import com.muicochay.mory.auth.model.AuthUserPrincipal;
import com.muicochay.mory.shared.dto.ApiResponse;
import com.muicochay.mory.shared.ratelimit.RateLimit;
import com.muicochay.mory.shared.ratelimit.RateLimitKeyStrategy;
import com.muicochay.mory.user.dto.*;
import com.muicochay.mory.user.service.UserProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserProfileController {

    private final UserProfileService userProfileService;

    @PostMapping(value = "/me/onboarding")
    @RateLimit(
            prefix = "user::onboarding:",
            limit = 4,
            windowSeconds = 60 * 60,
            strategy = RateLimitKeyStrategy.PER_USER_ID
    )
    public ResponseEntity<ApiResponse<OnboardingResponse>> onboarding(
            @RequestBody OnboardingRequest onboardingRequest,
            @AuthenticationPrincipal AuthUserPrincipal principal
    ) {
        OnboardingResponse onboardingResponse = userProfileService.onboarding(
                onboardingRequest,
                principal.getId()
        );
        return ResponseEntity.ok(ApiResponse.success(onboardingResponse, "Onboard successfully!"));
    }

    @PutMapping("/me/profile")
    @RateLimit(
            prefix = "user::profile::update-user-profile:",
            limit = 20,
            windowSeconds = 60,
            strategy = RateLimitKeyStrategy.PER_USER_ID
    )
    public ResponseEntity<ApiResponse<UpdateUserProfileResponse>> updateUserInfo(
            @AuthenticationPrincipal AuthUserPrincipal principal,
            @RequestBody UpdateUserProfileRequest request
    ) {
        UpdateUserProfileResponse updated = userProfileService.updateInfo(principal.getId(), request);
        return ResponseEntity.ok(ApiResponse.success(updated, "User info updated successfully"));
    }

    @GetMapping("/{id}/profile")
    @RateLimit(
            prefix = "user::profile::get-user-profile:",
            limit = 60,
            windowSeconds = 60,
            strategy = RateLimitKeyStrategy.PER_USER_ID
    )
    public ResponseEntity<ApiResponse<UserProfileResponse>> getUserProfile(
            @PathVariable(name = "id") UUID userId,
            @AuthenticationPrincipal AuthUserPrincipal principal
    ) {
        UserProfileResponse response = userProfileService.getUserProfile(userId, principal.getId());
        return ResponseEntity.ok(ApiResponse.success(response, "Get user profile successfully"));
    }

}
