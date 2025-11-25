package com.muicochay.mory.auth.model;

import com.muicochay.mory.auth.enums.AuthProvider;
import com.muicochay.mory.user.entity.User;
import com.muicochay.mory.user.entity.UserProfile;
import com.muicochay.mory.user.enums.RoleCode;
import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;
import java.util.Set;
import java.util.UUID;

/**
 * A custom {@link UserDetails} implementation used for traditional
 * email/password authentication.
 *
 * <p>
 * This class loads full user details from the database and is used in the
 * authentication process when logging in via email and password (form-based
 * login).</p>
 *
 * <p>
 * It includes additional metadata fields (e.g. username, full name, onboarding
 * status) that may be useful post-login or for personalization.</p>
 */
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmailPasswordUserDetails implements UserDetails {

    private UUID id;
    private String email;
    private String password;
    private boolean passwordVerified;
    private boolean deleted;
    private RoleCode roleCode;
    private Set<AuthProvider> providers;

    private UserProfile profile;

    public EmailPasswordUserDetails(User user) {
        this.id = user.getId();
        this.email = user.getEmail();
        this.password = user.getPassword();
        this.passwordVerified = user.isPasswordVerified();
        this.deleted = user.isDeleted();
        this.roleCode = user.getRoleCode();
        this.providers = user.getProviders();

        this.profile = user.getProfile();
    }

    @JsonIgnore
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        if (roleCode == null) {
            return List.of();
        }
        return List.of(() -> roleCode.name());
    }

    @JsonIgnore
    @Override
    public String getPassword() {
        return this.password;
    }

    @JsonIgnore
    @Override
    public String getUsername() {
        return this.email;
    }

    @JsonIgnore
    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @JsonIgnore
    @Override
    public boolean isAccountNonLocked() {
        return !deleted;
    }

    @JsonIgnore
    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @JsonIgnore
    @Override
    public boolean isEnabled() {
        return true;
    }
}
