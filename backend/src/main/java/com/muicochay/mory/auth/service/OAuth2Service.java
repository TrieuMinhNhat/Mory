package com.muicochay.mory.auth.service;

import com.muicochay.mory.auth.config.JwtTokenHelper;
import com.muicochay.mory.auth.constants.AuthConstants;
import com.muicochay.mory.auth.dto.Oauth2SignInOrRegisterResult;
import com.muicochay.mory.auth.dto.signin.SignInResponse;
import com.muicochay.mory.auth.dto.TokenPair;
import com.muicochay.mory.auth.enums.AuthProvider;
import com.muicochay.mory.auth.helper.AuthHelper;
import com.muicochay.mory.auth.model.oauth2.OAuth2UserInfo;
import com.muicochay.mory.auth.model.oauth2.OAuth2UserInfoFactory;
import com.muicochay.mory.auth.repository.AuthUserRepository;
import com.muicochay.mory.shared.dto.BlockInfoResponse;
import com.muicochay.mory.shared.service.BlockedUserService;
import com.muicochay.mory.user.entity.User;
import com.muicochay.mory.user.entity.UserProfile;
import com.muicochay.mory.user.enums.RoleCode;
import lombok.RequiredArgsConstructor;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.Set;

/**
 * Service responsible for handling authentication and registration using OAuth2
 * providers.
 *
 * <p>
 * Responsibilities:</p>
 * <ul>
 * <li>Authenticate user via OAuth2 provider (e.g., GOOGLE, GITHUB)</li>
 * <li>Link provider to existing user if needed</li>
 * <li>Replace unverified EMAIL_PASSWORD provider with OAuth2 if applicable</li>
 * <li>Create a new user if not found</li>
 * <li>Generate JWT token pair (access + refresh)</li>
 * <li>Persist session metadata in Redis</li>
 * </ul>
 *
 * <p>
 * Important behavior:</p>
 * <ul>
 * <li>If a user exists but has an unverified EMAIL_PASSWORD provider, that
 * provider is removed and replaced with the OAuth2 one.</li>
 * <li>If the OAuth2 provider is blocked by the user, login is rejected.</li>
 * </ul>
 */
@Service
@RequiredArgsConstructor
public class OAuth2Service {

    private final AuthUserRepository authUserRepository;
    private final JwtTokenHelper jwtTokenHelper;

    private final RefreshTokenRedisService refreshTokenRedisService;

    private final BlockedUserService blockedUserService;

    /**
     * Handles sign-in or registration for a user authenticated via an OAuth2
     * provider.
     *
     * <p>
     * If a user with the given email already exists:
     * <ul>
     * <li>Checks for blocked OAuth2 providers.</li>
     * <li>Checks if the user account is blocked and prevents access if so.</li>
     * <li>Handles unverified EMAIL_PASSWORD accounts by replacing
     * provider.</li>
     * <li>Links the OAuth2 provider if not already linked</li>
     * </ul>
     *
     * If the user does not exist, a new account is created.
     *
     * @param oAuth2User the user attributes returned from the OAuth2 provider
     * @param provider the OAuth2 provider used for login (e.g. GOOGLE, GITHUB)
     * @param ip the client’s IP address
     * @param userAgent the client’s user-agent string
     * @return {@link SignInResponse} containing JWT token pair and user info
     */
    @Transactional
    public Oauth2SignInOrRegisterResult signInOrRegisterWithOAuth2(
            OAuth2User oAuth2User,
            AuthProvider provider,
            String ip,
            String userAgent
    ) {
        OAuth2UserInfo userInfo = OAuth2UserInfoFactory.getOAuth2UserInfo(provider, oAuth2User.getAttributes());
        String fullName = userInfo.getFullName();
        String email = userInfo.getEmail();

        Optional<User> optionalUser = authUserRepository.findByEmail(email);

        if (optionalUser.isPresent()) {
            User existingUser = optionalUser.get();

            boolean blocked = blockedUserService.isBlocked(existingUser.getId());
            if (blocked) {
                BlockInfoResponse blockInfoResponse = blockedUserService.getBlockInfo(existingUser.getId());
                return Oauth2SignInOrRegisterResult.builder()
                        .blockInfoResponse(blockInfoResponse)
                        .build();
            }

            return Oauth2SignInOrRegisterResult.builder()
                    .tokenPair(handleUserExisted(existingUser, provider, ip, userAgent))
                    .build();
        }

        // Register new user
        User newUser = User.builder()
                .email(email)
                .password(AuthConstants.NO_PASSWORD)
                .providers(Set.of(provider))
                .roleCode(RoleCode.USER)
                .build();
        UserProfile userProfile = UserProfile.builder()
                .user(newUser)
                .displayName(fullName)
                .build();

        newUser.setProfile(userProfile);

        User savedUser = authUserRepository.save(newUser);
        return Oauth2SignInOrRegisterResult.builder()
                .tokenPair(handleSignIn(savedUser, ip, userAgent, provider))
                .build();
    }

    private TokenPair handleUserExisted(User existingUser, AuthProvider provider, String ip, String userAgent) {
        if (!existingUser.getProviders().contains(provider)) {
            Set<AuthProvider> providers = AuthHelper.mergeProviders(existingUser, provider);
            existingUser.setProviders(providers);
            authUserRepository.save(existingUser);
        }
        return handleSignIn(existingUser, ip, userAgent, provider);
    }

    private TokenPair handleSignIn(User user, String ip, String userAgent, AuthProvider provider) {
        TokenPair tokenPair = jwtTokenHelper.generateTokenPair(
                user.getId(),
                true,
                user.getRoleCode().name(),
                provider
        );
        refreshTokenRedisService.saveSession(
                user.getId(),
                tokenPair.getRefreshTokenId(),
                ip,
                userAgent
        );
        return TokenPair.builder()
                .accessToken(tokenPair.getAccessToken())
                .refreshToken(tokenPair.getRefreshToken())
                .build();
    }
}
