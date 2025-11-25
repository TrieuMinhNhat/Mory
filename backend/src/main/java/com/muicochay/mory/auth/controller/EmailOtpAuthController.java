package com.muicochay.mory.auth.controller;

import com.muicochay.mory.auth.dto.CookiePair;
import com.muicochay.mory.auth.dto.signin.EmailOtpSignInRequest;
import com.muicochay.mory.auth.dto.signin.SendOtpRequest;
import com.muicochay.mory.auth.dto.signin.SignInResponse;
import com.muicochay.mory.auth.helper.CookieBuilder;
import com.muicochay.mory.auth.service.EmailOtpAuthService;
import com.muicochay.mory.shared.dto.ApiResponse;
import com.muicochay.mory.shared.ratelimit.RateLimit;
import com.muicochay.mory.shared.ratelimit.RateLimitKeyStrategy;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth/email-otp")
@RequiredArgsConstructor
public class EmailOtpAuthController {

    private final EmailOtpAuthService emailOtpAuthService;
    private final CookieBuilder cookieBuilder;

    @PostMapping("/sign-in")
    @RateLimit(
            prefix = "auth::email-otp::sign-in:",
            limit = 4,
            windowSeconds = 60,
            strategy = RateLimitKeyStrategy.PER_IP_AND_CUSTOM,
            customKey = "emailOtpSignInRequest.email"
    )
    public ResponseEntity<ApiResponse<SignInResponse>> signIn(
            @RequestBody EmailOtpSignInRequest emailOtpSignInRequest,
            HttpServletRequest httpServletRequest,
            HttpServletResponse httpServletResponse
    ) {
        SignInResponse signInResponse = emailOtpAuthService.signIn(
                emailOtpSignInRequest.getEmail(),
                emailOtpSignInRequest.getInputOtp(),
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

    @PostMapping("/send-otp")
    @RateLimit(
            prefix = "auth::email-otp::send-otp:",
            limit = 1,
            windowSeconds = 30,
            strategy = RateLimitKeyStrategy.CUSTOM,
            customKey = "sendOtpRequest.email"
    )
    public ResponseEntity<ApiResponse<Object>> sendOtp(
            @RequestBody SendOtpRequest sendOtpRequest
    ) {
        emailOtpAuthService.sendOtp(sendOtpRequest.getEmail());
        return ResponseEntity.ok(ApiResponse.success(null, "Otp sent"));
    }
}
