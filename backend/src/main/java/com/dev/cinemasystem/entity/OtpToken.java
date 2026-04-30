package com.dev.cinemasystem.entity;

import com.dev.cinemasystem.enums.OtpPurpose;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "otp_token")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class OtpToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    User user;

    @Column(nullable = false)
    String email;

    @Column(nullable = false)
    String otpHash;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    OtpPurpose purpose;

    @Column(nullable = false)
    LocalDateTime expiresAt;

    @Builder.Default
    @Column(nullable = false)
    Boolean used = false;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    LocalDateTime createdAt;
}
