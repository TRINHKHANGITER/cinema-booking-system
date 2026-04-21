package com.dev.cinemasystem.configuration.security;


import com.dev.cinemasystem.entity.User;
import com.dev.cinemasystem.repository.UserRepository;
import com.dev.cinemasystem.enums.Role;
import com.dev.cinemasystem.enums.UserStatus;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class
ApplicationInitConfig {

    PasswordEncoder passwordEncoder;

    @Bean
    ApplicationRunner applicationRunner(UserRepository userRepository){
        return args -> {
            if(!userRepository.existsByUsername("admin") && !userRepository.existsByEmail("admin@gmail.com") && !userRepository.existsByPhoneNumber("0123456789")){
                User user = User.builder()
                        .username("admin")
                        .password(passwordEncoder.encode("password123"))
                        .role(Role.ADMIN)
                        .email("admin@gmail.com")
                        .fullName("System Administrator")
                        .phoneNumber("0123456789")
                        .status(UserStatus.ACTIVE)
                        .build();
                userRepository.save(user);
                log.info("admin has been created with default password : admin");
            }

            if(!userRepository.existsByUsername("user123") && !userRepository.existsByEmail("user123@gmail.com") && !userRepository.existsByPhoneNumber("012345678910")){
                User user = User.builder()
                        .username("user123")
                        .password(passwordEncoder.encode("password123"))
                        .role(Role.USER)
                        .email("user123@gmail.com")
                        .fullName("user123")
                        .phoneNumber("012345678910")
                        .status(UserStatus.ACTIVE)
                        .build();
                userRepository.save(user);
                log.info(" user123 has been created with default password : user123 ");
            }




            log.info("Initialization of default users completed.");
        };
    }

}

