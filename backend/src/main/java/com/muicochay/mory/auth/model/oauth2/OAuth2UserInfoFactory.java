package com.muicochay.mory.auth.model.oauth2;

import com.muicochay.mory.auth.enums.AuthProvider;

import java.util.Map;

public class OAuth2UserInfoFactory {

    public static OAuth2UserInfo getOAuth2UserInfo(AuthProvider authProvider, Map<String, Object> attributes) {
        return switch (authProvider) {
            case GOOGLE ->
                new GoogleOAuth2UserInfo(attributes);
            default ->
                throw new IllegalArgumentException("Unsupported provider: " + authProvider);
        };
    }
}
