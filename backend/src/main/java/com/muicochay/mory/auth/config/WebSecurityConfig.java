package com.fantus.mory.auth.config;

import com.fantus.mory.auth.handler.CustomOAuth2SuccessHandler;
import com.fantus.mory.auth.service.EmailPasswordUserDetailsService;
import com.fantus.mory.user.enums.RoleCode;
import com.fantus.mory.shared.config.AppProperties;
import com.fantus.mory.shared.dto.ApiResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletResponse;
import lombok.AllArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.factory.PasswordEncoderFactories;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;
import java.util.Objects;

@Configuration
@EnableWebSecurity
@AllArgsConstructor
public class WebSecurityConfig {
    private final EmailPasswordUserDetailsService emailPasswordUserDetailsService;
    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final EmailVerifiedAuthorizationManager emailVerifiedAuthorizationManager;
    private final CustomOAuth2SuccessHandler customOAuth2SuccessHandler;

    private final AppProperties appProperties;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .authorizeHttpRequests((authorize) ->
                    authorize
                        .requestMatchers("/v3/api-docs/**", "/swagger-ui/**", "/swagger.html").permitAll()
                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/auth/sign-out",
                                "/api/auth/refresh",
                                "/api/auth/forgot-password",
                                "/api/auth/reset-password",
                                "/api/auth/check-email",

                                "/api/auth/email-otp/send-otp",
                                "/api/auth/email-otp/sign-in",

                                "/api/auth/email-password/sign-in",
                                "/api/auth/email-password/sign-up"
                        ).permitAll()
                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/auth/me",

                                "/api/auth/email-password/verify-email",
                                "/api/auth/email-password/send-verification-message"

                        ).authenticated()
                        .requestMatchers(
                                HttpMethod.PUT,
                                "/api/auth/onboarding/complete"
                        ).authenticated()
                        .requestMatchers("/oauth2/success").permitAll()
                        .requestMatchers("/api/admin/**").hasAuthority(String.valueOf(RoleCode.ADMIN))
                        .anyRequest().access(emailVerifiedAuthorizationManager)
                )
                .oauth2Login(oauth2 ->
                        oauth2.successHandler(customOAuth2SuccessHandler)
                )
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .csrf(AbstractHttpConfigurer::disable)
                .cors(Customizer.withDefaults())
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
                .exceptionHandling(exception -> exception
                        .defaultAuthenticationEntryPointFor(
                                restAuthenticationEntryPoint(),
                                request -> request.getRequestURI().startsWith("/api/")
                        )
                        .accessDeniedHandler((request, response, accessDeniedException) -> {
                            response.setContentType("application/json");
                            response.setStatus(HttpServletResponse.SC_FORBIDDEN);

                            ApiResponse<Object> apiResponse = ApiResponse.fail("You are not authorized to access this resource");

                            String json = new ObjectMapper().writeValueAsString(apiResponse);

                            response.getWriter().write(json);
                        })
                );
        return http.build();
    }

    @Bean
    public AuthenticationManager authenticationManager(HttpSecurity http) throws Exception {
        AuthenticationManagerBuilder builder = http.getSharedObject(AuthenticationManagerBuilder.class);
        builder.userDetailsService(emailPasswordUserDetailsService)
                .passwordEncoder(passwordEncoder());
        return builder.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return PasswordEncoderFactories.createDelegatingPasswordEncoder();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration corsConfiguration = new CorsConfiguration();
        corsConfiguration.setAllowedOrigins(List.of(
                appProperties.getFrontendUrl(),
                "http://192.168.1.167:3000"
                ));
        corsConfiguration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        corsConfiguration.setAllowedHeaders(List.of(
                "Origin", "Content-Type", "Accept", "responseType",
                "Authorization", "x-authorization", "content-range", "range"
        ));
        corsConfiguration.setExposedHeaders(List.of(
                "X-Total-Count", "content-range", "Content-Type", "Accept", "X-Requested-With", "remember-me"
        ));
        corsConfiguration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", corsConfiguration);
        return source;
    }

    @Bean
    public AuthenticationEntryPoint restAuthenticationEntryPoint() {
        return (request, response, authException) -> {
            response.setContentType("application/json");
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);

            ApiResponse<Objects> apiResponse = ApiResponse.fail("You are not logged in or your token is invalid");

            String json = new ObjectMapper().writeValueAsString(apiResponse);

            response.getWriter().write(json);
        };
    }

}
