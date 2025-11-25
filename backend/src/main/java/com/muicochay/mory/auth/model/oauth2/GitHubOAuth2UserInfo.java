package com.muicochay.mory.auth.model.oauth2;

import lombok.RequiredArgsConstructor;

import java.util.Map;

@RequiredArgsConstructor
public class GitHubOAuth2UserInfo implements OAuth2UserInfo {

    private final Map<String, Object> attributes;

    @Override
    public String getEmail() {
        return (String) attributes.get("email");
    }

    @Override
    public String getFirstName() {
        return getFullName();
    }

    @Override
    public String getLastName() {
        return "";
    }

    @Override
    public String getFullName() {
        return (String) attributes.get("name");
    }
}
