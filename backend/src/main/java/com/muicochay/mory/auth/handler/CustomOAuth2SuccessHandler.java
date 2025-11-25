package com.muicochay.mory.auth.handler;

import com.muicochay.mory.auth.dto.CookiePair;
import com.muicochay.mory.auth.dto.Oauth2SignInOrRegisterResult;
import com.muicochay.mory.auth.dto.TokenPair;
import com.muicochay.mory.auth.enums.AuthProvider;
import com.muicochay.mory.auth.helper.CookieBuilder;
import com.muicochay.mory.auth.service.OAuth2Service;
import com.muicochay.mory.shared.config.AppProperties;
import com.muicochay.mory.shared.dto.BlockInfoResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
@Slf4j
@RequiredArgsConstructor
public class CustomOAuth2SuccessHandler implements AuthenticationSuccessHandler {

    private final OAuth2Service oAuth2Service;
    private final CookieBuilder cookieBuilder;
    private final AppProperties appProperties;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException {
        if (!(authentication instanceof OAuth2AuthenticationToken authToken)) {
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Unsupported authentication type");
            return;
        }

        OAuth2User oAuth2User = authToken.getPrincipal();
        log.info("OAuth2 login successful for user: {}, provider: {}", oAuth2User.getName(), authToken.getAuthorizedClientRegistrationId());

        AuthProvider authProvider = AuthProvider.valueOf(authToken.getAuthorizedClientRegistrationId().toUpperCase());
        Oauth2SignInOrRegisterResult oauth2SignInOrRegisterResult = oAuth2Service.signInOrRegisterWithOAuth2(
                oAuth2User,
                authProvider,
                request.getRemoteAddr(),
                request.getHeader("User-Agent")
        );

        if (oauth2SignInOrRegisterResult.getBlockInfoResponse() != null) {
            BlockInfoResponse blockInfoResponse = oauth2SignInOrRegisterResult.getBlockInfoResponse();
            String redirectUrl = appProperties.getFrontendUrl()
                    + "/oauth2-blocked.html"
                    + buildBlockedQueryParams(blockInfoResponse);

            response.sendRedirect(redirectUrl);
            log.warn("Blocked user attempted login. Redirecting to: {}", redirectUrl);
            return;
        }

        TokenPair tokenPair = oauth2SignInOrRegisterResult.getTokenPair();

        CookiePair cookiePair = cookieBuilder.getCookiePair(
                tokenPair.getAccessToken(),
                tokenPair.getRefreshToken()
        );

        response.addHeader(HttpHeaders.SET_COOKIE, cookiePair.getRefreshCookie().toString());
        response.addHeader(HttpHeaders.SET_COOKIE, cookiePair.getAccessCookie().toString());

        response.sendRedirect(appProperties.getFrontendUrl() + "/oauth2-success.html");
    }

    private String buildBlockedQueryParams(BlockInfoResponse blockInfoResponse) {
        StringBuilder query = new StringBuilder("?permanent=" + blockInfoResponse.isPermanent());
        if (!blockInfoResponse.isPermanent() && blockInfoResponse.getUnblockAt() != null) {
            query.append("&unblockAt=").append(blockInfoResponse.getUnblockAt().toString());
        }
        return query.toString();
    }
}
