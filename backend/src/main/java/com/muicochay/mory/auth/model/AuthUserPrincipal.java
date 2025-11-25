package com.muicochay.mory.auth.model;

import com.muicochay.mory.auth.enums.AuthProvider;
import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;
import java.util.UUID;

/**
 * A custom implementation of {@link UserDetails} representing an authenticated
 * user in JWT-based OAuth2 authentication flow.
 *
 * <p>
 * This class is used internally in JWT authentication context and does not
 * store a password. Instead, it holds minimal metadata extracted from the
 * token, such as user ID, current login provider, and basic account status.</p>
 *
 * <p>
 * This is typically created when decoding a JWT token for stateless
 * authentication.</p>
 */
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuthUserPrincipal implements UserDetails {

    private UUID id;
    private boolean verified;
    private boolean deleted;
    private List<GrantedAuthority> authorities;
    private AuthProvider currentProvider;

    @JsonIgnore
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    @JsonIgnore
    @Override
    public String getPassword() {
        return "";
    }

    @JsonIgnore
    @Override
    public String getUsername() {
        return String.valueOf(this.id);
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
