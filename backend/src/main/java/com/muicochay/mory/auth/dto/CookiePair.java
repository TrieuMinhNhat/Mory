package com.muicochay.mory.auth.dto;

import org.springframework.http.ResponseCookie;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CookiePair {

    private ResponseCookie accessCookie;
    private ResponseCookie refreshCookie;
}
