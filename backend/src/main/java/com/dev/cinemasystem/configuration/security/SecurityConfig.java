package com.dev.cinemasystem.configuration.security;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
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



            "/swagger-ui/**",
            "/swagger-ui.html",

            "/v3/api-docs/**",
            "/api-docs/**"
    };

    @Bean
    SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(PUBLIC_ENDPOINTS).permitAll()
                        .anyRequest().authenticated()

                )
                .httpBasic(httpBasic -> httpBasic.disable())   // tắt popup basic
                .formLogin(form -> form.disable()) ;          // tắt login page


        return http.build();
    }
}
