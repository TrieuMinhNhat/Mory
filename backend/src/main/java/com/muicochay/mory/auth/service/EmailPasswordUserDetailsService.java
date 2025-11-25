package com.muicochay.mory.auth.service;

import com.muicochay.mory.auth.model.EmailPasswordUserDetails;
import com.muicochay.mory.auth.repository.AuthUserRepository;
import com.muicochay.mory.shared.exception.global.ResourcesNotFoundEx;
import com.muicochay.mory.user.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Service;

/**
 * Implementation of {@link UserDetailsService} used for authenticating users
 * via email and password.
 * <p>
 * This service loads user-specific data during Spring Security's authentication
 * process. It retrieves a {@link User} entity from the
 * {@link AuthUserRepository} using the provided email, and wraps it in a
 * {@link EmailPasswordUserDetails} for use by Spring Security.
 * </p>
 */
@Service
@RequiredArgsConstructor
public class EmailPasswordUserDetailsService implements UserDetailsService {

    private final AuthUserRepository authUserRepository;

    /**
     * Loads the user by their email address and wraps it in a custom
     * {@link EmailPasswordUserDetails}.
     *
     * @param username the email address used for authentication
     * @return a {@link EmailPasswordUserDetails} representing the authenticated
     * user
     * @throws ResourcesNotFoundEx if no user is found with the given email
     */
    @Override
    public UserDetails loadUserByUsername(String username) {
        User user = authUserRepository.findByEmail(username)
                .orElseThrow(() -> new ResourcesNotFoundEx("User not found with email: " + username));
        return new EmailPasswordUserDetails(user);
    }
}
