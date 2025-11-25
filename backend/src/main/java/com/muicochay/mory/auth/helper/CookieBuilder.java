package com.muicochay.mory.auth.helper;

import com.muicochay.mory.auth.dto.CookiePair;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Component;

@Component
public class CookieBuilder {

    @Value("${jwt.auth.refresh_expires_in}")
    private int refreshExpiresIn;

    @Value("${jwt.auth.access_expires_in}")
    private int accessExpiresIn;

    private final boolean httpOnly = false;
    private final boolean secure = false;
    private final String path = "/";
    private final String sameSite = "Strict";

    public CookiePair getCookiePair(String accessToken, String refreshToken) {
        ResponseCookie accessCookie = ResponseCookie.from("access_token", accessToken)
                .httpOnly(httpOnly)
                .secure(secure)
                .path(path)
                .maxAge(accessExpiresIn)
                .sameSite(sameSite)
                .build();
        ResponseCookie refreshCookie = ResponseCookie.from("refresh_token", refreshToken)
                .httpOnly(httpOnly)
                .secure(secure)
                .path(path)
                .maxAge(refreshExpiresIn)
                .sameSite(sameSite)
                .build();
        return CookiePair.builder()
                .accessCookie(accessCookie)
                .refreshCookie(refreshCookie)
                .build();
    }

    public CookiePair getZeroMaxAgeCookiePair() {
        ResponseCookie accessCookie = ResponseCookie.from("access_token")
                .httpOnly(httpOnly)
                .secure(secure)
                .path(path)
                .maxAge(0)
                .sameSite(sameSite)
                .build();
        ResponseCookie refreshCookie = ResponseCookie.from("refresh_token")
                .httpOnly(httpOnly)
                .secure(secure)
                .path(path)
                .maxAge(0)
                .sameSite(sameSite)
                .build();
        return CookiePair.builder()
                .accessCookie(accessCookie)
                .refreshCookie(refreshCookie)
                .build();
    }
}
