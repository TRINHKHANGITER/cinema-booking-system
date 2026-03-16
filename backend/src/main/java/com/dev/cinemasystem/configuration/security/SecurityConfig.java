package com.dev.cinemasystem.configuration.security;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final CustomJwtDecoder customJwtDecoder;


    private static final String[] PUBLIC_ENDPOINTS = {

            "/auth/**",
            "/login/**",

            "/user/**",
            "/cinema/**",
            "/room/**",
            "/room-type/**",
            "/seat/**",
            "/seat-type/**",
            "/movie/**",
            "/movie-type/**",
            "/ticket/**",
            "/ticket-type/**",
            "/price-ticket/**",
            "/show-time/**",

            // Swagger
            "/swagger-ui/**",
            "/swagger-ui.html",
            "/v3/api-docs/**",
            "/api-docs/**"
    };

    @Bean
    SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())

                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )

                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(PUBLIC_ENDPOINTS).permitAll()

                        //  fix chắc chắn cho swagger (Spring Boot 3)
                        .requestMatchers(HttpMethod.GET,
                                "/v3/api-docs/**",
                                "/swagger-ui/**"
                        ).permitAll()

                        .anyRequest().authenticated()
                )
                .oauth2ResourceServer(oauth2 -> oauth2
                        .jwt(jwt -> jwt.decoder(customJwtDecoder))
                )
                .httpBasic(httpBasic -> httpBasic.disable())
                .formLogin(form -> form.disable())
                ;

        return http.build();
    }
}