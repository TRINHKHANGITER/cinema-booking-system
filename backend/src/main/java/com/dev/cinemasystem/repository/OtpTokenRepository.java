package com.dev.cinemasystem.repository;

import com.dev.cinemasystem.entity.OtpToken;
import com.dev.cinemasystem.enums.OtpPurpose;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface OtpTokenRepository extends JpaRepository<OtpToken, Integer> {

    Optional<OtpToken> findTopByEmailAndPurposeAndUsedFalseOrderByCreatedAtDesc(
            String email,
            OtpPurpose purpose
    );

    Optional<OtpToken> findTopByUser_UserIdAndEmailAndPurposeAndUsedFalseOrderByCreatedAtDesc(
            Integer userId,
            String email,
            OtpPurpose purpose
    );
}
