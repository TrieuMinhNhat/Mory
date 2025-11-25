package com.muicochay.mory.auth.controller;

import com.muicochay.mory.auth.dto.*;
import com.muicochay.mory.auth.dto.signin.EmailPasswordSignInRequest;
import com.muicochay.mory.auth.dto.signin.SignInResponse;
import com.muicochay.mory.auth.dto.signup.RegistrationRequest;
import com.muicochay.mory.auth.dto.signup.VerifyEmailRequest;
import com.muicochay.mory.auth.dto.signup.VerifyEmailResponse;
import com.muicochay.mory.auth.model.AuthUserPrincipal;
import com.muicochay.mory.auth.helper.CookieBuilder;
import com.muicochay.mory.auth.service.EmailPasswordAuthService;
import com.muicochay.mory.shared.dto.ApiResponse;
import com.muicochay.mory.shared.exception.auth.EmailAlreadyVerifiedEx;
import com.muicochay.mory.shared.ratelimit.RateLimit;
import com.muicochay.mory.shared.ratelimit.RateLimitKeyStrategy;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/auth/email-password")
public class EmailPasswordAuthController {

    private final EmailPasswordAuthService emailPasswordAuthService;
    private final CookieBuilder cookieBuilder;

    @PostMapping("/sign-in")
    @RateLimit(
            prefix = "auth::email-otp::sign-in:",
            limit = 10,
            windowSeconds = 60,
            strategy = RateLimitKeyStrategy.PER_IP_AND_CUSTOM,
            customKey = "emailPasswordSignInRequest.email"
    )
    public ResponseEntity<ApiResponse<SignInResponse>> login(
            @RequestBody EmailPasswordSignInRequest emailPasswordSignInRequest,
            HttpServletRequest httpServletRequest,
            HttpServletResponse httpServletResponse
    ) {
        SignInResponse signInResponse = emailPasswordAuthService.signIn(
                emailPasswordSignInRequest.getEmail(),
                emailPasswordSignInRequest.getPassword(),
                httpServletRequest.getRemoteAddr(),
                httpServletRequest.getHeader("User-Agent")
        );
        CookiePair cookiePair = cookieBuilder.getCookiePair(
                signInResponse.getAccessToken(),
                signInResponse.getRefreshToken()
        );

        httpServletResponse.addHeader(HttpHeaders.SET_COOKIE, cookiePair.getRefreshCookie().toString());
        httpServletResponse.addHeader(HttpHeaders.SET_COOKIE, cookiePair.getAccessCookie().toString());
        return ResponseEntity.ok(ApiResponse.success(signInResponse, "Login successfully"));
    }

    @PostMapping("/sign-up")
    @RateLimit(
            prefix = "auth::sign-up:",
            limit = 5,
            windowSeconds = 60,
            strategy = RateLimitKeyStrategy.PER_IP_AND_CUSTOM,
            customKey = "registrationRequest.email"
    )
    public ResponseEntity<ApiResponse<Void>> register(@RequestBody RegistrationRequest registrationRequest) {
        emailPasswordAuthService.createUser(registrationRequest);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success(null, "Register successfully"));

    }

    @PostMapping("/send-verification-message")
    @RateLimit(
            prefix = "auth::sign-up::send-verification-message:",
            limit = 1,
            windowSeconds = 60,
            strategy = RateLimitKeyStrategy.PER_USER_ID
    )
    public ResponseEntity<ApiResponse<Void>> resendRegistrationOtp(
            @AuthenticationPrincipal AuthUserPrincipal principal
    ) {
        if (principal.isVerified()) {
            throw new EmailAlreadyVerifiedEx("Email already verified");
        }
        emailPasswordAuthService.sendEmailOtpForRegistration(principal.getId());
        return ResponseEntity.ok(ApiResponse.success(null, "Otp has been sent"));
    }

    @PostMapping("/verify-email")
    @RateLimit(prefix = "auth::sign-up::verify-email:", limit = 5, windowSeconds = 60, strategy = RateLimitKeyStrategy.PER_USER_ID)
    public ResponseEntity<ApiResponse<VerifyEmailResponse>> verifyRegistration(
            @RequestBody VerifyEmailRequest request,
            @AuthenticationPrincipal AuthUserPrincipal principal,
            HttpServletRequest httpServletRequest,
            HttpServletResponse httpServletResponse
    ) {
        if (principal.isVerified()) {
            throw new EmailAlreadyVerifiedEx("Email already verified");
        }
        VerifyEmailResponse response = emailPasswordAuthService.verifyEmail(
                principal.getId(),
                request.getInputOtp()
        );

        CookiePair cookiePair = emailPasswordAuthService.getVerifiedCookiePair(
                principal.getId(),
                principal.getAuthorities(),
                principal.getCurrentProvider(),
                httpServletRequest.getRemoteAddr(),
                httpServletRequest.getHeader("User-Agent")
        );
        httpServletResponse.addHeader(HttpHeaders.SET_COOKIE, cookiePair.getRefreshCookie().toString());
        httpServletResponse.addHeader(HttpHeaders.SET_COOKIE, cookiePair.getAccessCookie().toString());

        return ResponseEntity
                .status(HttpStatus.OK)
                .body(ApiResponse.success(response, "Email has been verified successfully"));
    }

}
