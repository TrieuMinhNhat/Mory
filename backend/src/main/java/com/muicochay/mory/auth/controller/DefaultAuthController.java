package com.muicochay.mory.auth.controller;

import com.muicochay.mory.auth.config.JwtTokenHelper;
import com.muicochay.mory.auth.dto.*;
import com.muicochay.mory.auth.dto.forgotpassword.ForgotPasswordRequest;
import com.muicochay.mory.auth.dto.forgotpassword.ResetPasswordRequest;
import com.muicochay.mory.auth.dto.refreshtoken.RefreshRequest;
import com.muicochay.mory.auth.dto.signout.SignOutRequest;
import com.muicochay.mory.auth.model.AuthUserPrincipal;
import com.muicochay.mory.auth.helper.CookieBuilder;
import com.muicochay.mory.auth.service.DefaultAuthService;
import com.muicochay.mory.shared.dto.ApiResponse;
import com.muicochay.mory.shared.dto.BlockInfoResponse;
import com.muicochay.mory.shared.exception.auth.BlockedAccountEx;
import com.muicochay.mory.shared.exception.auth.InvalidTokenEx;
import com.muicochay.mory.shared.ratelimit.RateLimit;
import com.muicochay.mory.shared.ratelimit.RateLimitKeyStrategy;
import com.muicochay.mory.shared.service.BlockedUserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/auth")
public class DefaultAuthController {

    private final DefaultAuthService defaultAuthService;
    private final CookieBuilder cookieBuilder;

    private final BlockedUserService blockedUserService;

    private final JwtTokenHelper jwtTokenHelper;

    @PostMapping("/me")
    @RateLimit(prefix = "auth::me:", limit = 30, windowSeconds = 60, strategy = RateLimitKeyStrategy.PER_IP_AND_USER_ID)
    public ResponseEntity<ApiResponse<AuthUserResponse>> checkAuth(
            @AuthenticationPrincipal AuthUserPrincipal principal,
            HttpServletResponse httpServletResponse
    ) {
        boolean blocked = blockedUserService.isBlocked(principal.getId());
        if (blocked) {
            CookiePair cookiePair = cookieBuilder.getZeroMaxAgeCookiePair();
            httpServletResponse.addHeader(HttpHeaders.SET_COOKIE, cookiePair.getRefreshCookie().toString());
            httpServletResponse.addHeader(HttpHeaders.SET_COOKIE, cookiePair.getAccessCookie().toString());

            BlockInfoResponse blockInfoResponse = blockedUserService.getBlockInfo(principal.getId());
            throw new BlockedAccountEx("Account blocked", blockInfoResponse);
        }
        AuthUserResponse authUserResponse = defaultAuthService.checkAuth(principal.getId(), principal.getCurrentProvider());
        return ResponseEntity.ok(ApiResponse.success(authUserResponse, "Check Auth successfully!"));
    }

    @PostMapping("check-email")
    @RateLimit(prefix = "auth::check-email:", limit = 5, windowSeconds = 60, strategy = RateLimitKeyStrategy.PER_USER_ID)
    public ResponseEntity<ApiResponse<Object>> checkEmail(
            @RequestBody CheckEmailRequest checkEmailRequest
    ) {
        boolean exists = defaultAuthService.checkEmail(checkEmailRequest.getEmail());
        CheckEmailResponse checkEmailResponse = CheckEmailResponse.builder()
                .exists(exists)
                .build();
        return ResponseEntity.ok(ApiResponse.success(checkEmailResponse, "No message"));
    }

    @PostMapping("/sign-out")
    @RateLimit(prefix = "auth::sign-out:", limit = 60, windowSeconds = 60, strategy = RateLimitKeyStrategy.PER_IP_AND_USER_ID)
    public ResponseEntity<Void> logout(
            @CookieValue(value = "refresh_token", required = false) String refreshTokenFromCookie,
            @RequestBody(required = false) SignOutRequest request,
            @AuthenticationPrincipal AuthUserPrincipal principal,
            HttpServletResponse httpServletResponse
    ) {
        String refreshToken = refreshTokenFromCookie;

        if (refreshToken == null && request != null && request.getRefreshToken() != null) {
            refreshToken = request.getRefreshToken();
        }

        if (refreshToken == null) {
            throw new InvalidTokenEx("Refresh token is missing");
        }
        if (principal != null) {
            defaultAuthService.signOut(principal.getId(), refreshToken);
        }
        CookiePair cookiePair = cookieBuilder.getZeroMaxAgeCookiePair();

        httpServletResponse.addHeader(HttpHeaders.SET_COOKIE, cookiePair.getRefreshCookie().toString());
        httpServletResponse.addHeader(HttpHeaders.SET_COOKIE, cookiePair.getAccessCookie().toString());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/set-password")
    @RateLimit(
            prefix = "auth::set-password",
            limit = 3,
            windowSeconds = 60 * 60 * 24 * 7,
            strategy = RateLimitKeyStrategy.PER_USER_ID
    )
    public ResponseEntity<ApiResponse<Object>> createPassword(
            @AuthenticationPrincipal AuthUserPrincipal principal,
            @RequestBody CreatePasswordRequest request
    ) {
        defaultAuthService.createPassword(principal.getId(), request);
        return ResponseEntity.ok(ApiResponse.success(null, "Create password successfully"));
    }

    @PostMapping("/forgot-password")
    @RateLimit(
            prefix = "auth::forgot-password:",
            limit = 4,
            windowSeconds = 60 * 60,
            strategy = RateLimitKeyStrategy.PER_IP_AND_CUSTOM,
            customKey = "forgotPasswordRequest.email"
    )
    public ResponseEntity<ApiResponse<Object>> forgotPassword(
            @RequestBody @Valid ForgotPasswordRequest forgotPasswordRequest
    ) {
        defaultAuthService.handleForgotPassword(forgotPasswordRequest.getEmail());
        return ResponseEntity.ok(ApiResponse.success(null, "If the email exists, we've sent you a password reset link."));
    }

    @PostMapping("/reset-password")
    @RateLimit(
            prefix = "auth::reset-password:",
            limit = 3,
            windowSeconds = 60 * 60 * 24,
            strategy = RateLimitKeyStrategy.PER_IP_AND_CUSTOM,
            customKey = "resetPasswordRequest.email"
    )
    public ResponseEntity<ApiResponse<Object>> resetPassword(
            @RequestBody ResetPasswordRequest resetPasswordRequest
    ) {
        defaultAuthService.handleResetPassword(
                resetPasswordRequest.getToken(),
                resetPasswordRequest.getEmail(),
                resetPasswordRequest.getNewPassword()
        );
        return ResponseEntity.ok(ApiResponse.success(null, "Your password has been reset successfully."));
    }

    @PostMapping("/refresh")
    @RateLimit(prefix = "auth::refresh:", limit = 4, windowSeconds = 10, strategy = RateLimitKeyStrategy.PER_IP_AND_USER_ID)
    public ResponseEntity<ApiResponse<Object>> refresh(
            @CookieValue(value = "refresh_token", required = false) String refreshTokenFromCookie,
            @RequestBody(required = false) RefreshRequest request,
            HttpServletRequest httpServletRequest,
            HttpServletResponse httpServletResponse
    ) {
        String refreshToken = refreshTokenFromCookie;

        if (refreshToken == null && request != null && request.getRefreshToken() != null) {
            refreshToken = request.getRefreshToken();
        }

        if (refreshToken == null) {
            throw new InvalidTokenEx("Refresh token is missing");
        }

        UUID userId = jwtTokenHelper.getUserIdFromToken(refreshToken);

        boolean blocked = blockedUserService.isBlocked(userId);

        if (blocked) {
            CookiePair cookiePair = cookieBuilder.getZeroMaxAgeCookiePair();
            httpServletResponse.addHeader(HttpHeaders.SET_COOKIE, cookiePair.getRefreshCookie().toString());
            httpServletResponse.addHeader(HttpHeaders.SET_COOKIE, cookiePair.getAccessCookie().toString());
            BlockInfoResponse blockInfoResponse = blockedUserService.getBlockInfo(userId);
            throw new BlockedAccountEx("Account blocked", blockInfoResponse);
        }

        TokenPair tokenPair = defaultAuthService.validateRefreshTokenAndGenerateTokenPair(
                refreshToken,
                httpServletRequest.getRemoteAddr(),
                httpServletRequest.getHeader("User-Agent")
        );
        CookiePair cookiePair = cookieBuilder.getCookiePair(
                tokenPair.getAccessToken(),
                tokenPair.getRefreshToken()
        );

        httpServletResponse.addHeader(HttpHeaders.SET_COOKIE, cookiePair.getRefreshCookie().toString());
        httpServletResponse.addHeader(HttpHeaders.SET_COOKIE, cookiePair.getAccessCookie().toString());

        return ResponseEntity.ok()
                .body(ApiResponse.success(null, "Token refreshed"));
    }

}
