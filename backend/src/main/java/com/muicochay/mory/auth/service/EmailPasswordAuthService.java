package com.muicochay.mory.auth.service;

import com.muicochay.mory.auth.config.JwtTokenHelper;
import com.muicochay.mory.auth.dto.AuthUserResponse;
import com.muicochay.mory.auth.dto.CookiePair;
import com.muicochay.mory.auth.dto.signin.SignInResponse;
import com.muicochay.mory.auth.dto.signup.RegistrationRequest;
import com.muicochay.mory.auth.dto.TokenPair;
import com.muicochay.mory.auth.dto.signup.VerifyEmailResponse;
import com.muicochay.mory.auth.enums.AuthProvider;
import com.muicochay.mory.auth.helper.CookieBuilder;
import com.muicochay.mory.auth.model.EmailPasswordUserDetails;
import com.muicochay.mory.auth.helper.AuthHelper;
import com.muicochay.mory.auth.repository.AuthUserRepository;
import com.muicochay.mory.otp.dto.EmailJob;
import com.muicochay.mory.otp.enums.EmailTemplateType;
import com.muicochay.mory.otp.enums.OtpType;
import com.muicochay.mory.otp.service.EmailQueueService;
import com.muicochay.mory.otp.service.OtpService;
import com.muicochay.mory.shared.config.AppProperties;
import com.muicochay.mory.shared.dto.BlockInfoResponse;
import com.muicochay.mory.shared.exception.auth.BlockedAccountEx;
import com.muicochay.mory.shared.exception.auth.EmailPasswordLoginEx;
import com.muicochay.mory.shared.exception.auth.WeakPasswordEx;
import com.muicochay.mory.shared.exception.global.ResourceAlreadyExistsEx;
import com.muicochay.mory.shared.exception.global.ResourcesNotFoundEx;
import com.muicochay.mory.shared.service.BlockedUserService;
import com.muicochay.mory.user.entity.User;
import com.muicochay.mory.user.entity.UserProfile;
import com.muicochay.mory.user.enums.RoleCode;
import com.muicochay.mory.user.mapper.UserProfileMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.*;

@Service
@RequiredArgsConstructor
public class EmailPasswordAuthService {

    private final PasswordEncoder passwordEncoder;
    private final AuthUserRepository authUserRepository;
    private final OtpService otpService;
    private final UserProfileMapper userProfileMapper;
    private final JwtTokenHelper jwtTokenHelper;
    private final CookieBuilder cookieBuilder;

    private final RefreshTokenRedisService refreshTokenRedisService;
    private final EmailPasswordUserDetailsService emailPasswordUserDetailsService;

    private final EmailQueueService emailQueueService;
    private final BlockedUserService blockedUserService;
    private final AppProperties appProperties;

    public SignInResponse signIn(
            String username,
            CharSequence password,
            String ip,
            String userAgent
    ) {
        try {
            EmailPasswordUserDetails user
                    = (EmailPasswordUserDetails) emailPasswordUserDetailsService
                            .loadUserByUsername(username);

            if (!passwordEncoder.matches(password, user.getPassword())) {
                throw new EmailPasswordLoginEx("Wrong email or password");
            }

            boolean blocked = blockedUserService.isBlocked(user.getId());
            if (blocked) {
                BlockInfoResponse blockInfoResponse = blockedUserService.getBlockInfo(user.getId());
                throw new BlockedAccountEx("Account blocked", blockInfoResponse);
            }

            if (!user.getProviders().contains(AuthProvider.EMAIL_PASSWORD)) {
                throw new EmailPasswordLoginEx("Wrong email or password");
            }
            TokenPair tokenPair = jwtTokenHelper.generateTokenPair(
                    user.getId(),
                    user.isPasswordVerified(),
                    AuthHelper.mapAuthoritiesToRoleCode(user.getAuthorities()),
                    AuthProvider.EMAIL_PASSWORD);

            refreshTokenRedisService.saveSession(
                    user.getId(),
                    tokenPair.getRefreshTokenId(),
                    ip,
                    userAgent
            );

            AuthUserResponse authUserResponse = AuthUserResponse.builder()
                    .id(user.getId())
                    .email(user.getEmail())
                    .isVerified(user.isPasswordVerified())
                    .roleCode(user.getRoleCode())
                    .profile(userProfileMapper.toDto(user.getProfile()))
                    .build();
            return SignInResponse.builder()
                    .accessToken(tokenPair.getAccessToken())
                    .refreshToken(tokenPair.getRefreshToken())
                    .user(authUserResponse)
                    .build();
        } catch (ResourcesNotFoundEx | IllegalArgumentException e) {
            throw new EmailPasswordLoginEx("Wrong email or password");
        }
    }

    @Transactional
    public void createUser(RegistrationRequest request) {
        boolean exists = authUserRepository.existsByEmail(request.getEmail());
        if (exists) {
            throw new ResourceAlreadyExistsEx("User already exists with email: " + request.getEmail());
        }
        if (!AuthHelper.isStrongPassword(request.getPassword())) {
            throw new WeakPasswordEx("Weak password");
        }
        User newUser = User.builder()
                .email(request.getEmail())
                .build();
        newUser.setPassword(passwordEncoder.encode(request.getPassword()));
        newUser.setProviders(Set.of(AuthProvider.EMAIL_PASSWORD));
        newUser.setRoleCode(RoleCode.USER);
        UserProfile userProfile = UserProfile.builder()
                .user(newUser)
                .build();

        newUser.setProfile(userProfile);
        authUserRepository.save(newUser);
    }

    @Transactional
    public VerifyEmailResponse verifyEmail(UUID userId, String inputOtp) {
        otpService.verifyOtp(
                OtpType.REGISTRATION,
                userId,
                inputOtp
        );
        User user = authUserRepository.findById(userId)
                .orElseThrow(() -> new ResourcesNotFoundEx("User not found with Id: " + userId));
        user.setPasswordVerifiedAt(Instant.now());
        User savedUser = authUserRepository.save(user);
        AuthUserResponse authUserResponse = AuthUserResponse.builder()
                .id(savedUser.getId())
                .email(savedUser.getEmail())
                .isVerified(savedUser.isPasswordVerified())
                .roleCode(savedUser.getRoleCode())
                .profile(userProfileMapper.toDto(savedUser.getProfile()))
                .build();

        authUserResponse.setVerified(true);

        Map<String, Object> vars = new HashMap<>();
        EmailJob emailJob = EmailJob.builder()
                .email(user.getEmail())
                .subject("Your email has been verified")
                .templateType(EmailTemplateType.EMAIL_VERIFIED)
                .variables(vars)
                .build();
        emailQueueService.pushToMailQueue(emailJob);
        return VerifyEmailResponse.builder().isVerified(true).build();
    }

    public CookiePair getVerifiedCookiePair(
            UUID userId,
            Collection<? extends GrantedAuthority> authorities,
            AuthProvider provider,
            String ip,
            String userAgent
    ) {
        TokenPair tokenPair = jwtTokenHelper.generateTokenPair(
                userId,
                true,
                AuthHelper.mapAuthoritiesToRoleCode(authorities),
                provider
        );

        refreshTokenRedisService.saveSession(
                userId,
                tokenPair.getRefreshTokenId(),
                ip,
                userAgent
        );

        return cookieBuilder.getCookiePair(
                tokenPair.getAccessToken(),
                tokenPair.getRefreshToken()
        );
    }

    public void sendEmailOtpForRegistration(UUID userId) {
        String email = authUserRepository.findEmailOnlyById(userId)
                .orElseThrow(() -> new ResourcesNotFoundEx("User not found with Id: " + userId));
        String otp = otpService.generateOtp(
                OtpType.REGISTRATION,
                userId
        );
        Map<String, Object> vars = new HashMap<>();
        vars.put("otp", otp);
        EmailJob emailJob = EmailJob.builder()
                .email(email)
                .subject("Your verification code for " + appProperties.getAppName())
                .templateType(EmailTemplateType.OTP_VERIFY_REGISTRATION)
                .variables(vars)
                .build();
        emailQueueService.pushToMailQueue(emailJob);
    }
}
