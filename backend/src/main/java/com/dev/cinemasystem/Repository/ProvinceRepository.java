package com.dev.cinemasystem.Repository;

import com.dev.cinemasystem.Entity.Province;
import com.dev.cinemasystem.enums.ProvinceStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProvinceRepository extends JpaRepository<Province, Integer> {
    Optional<Province> findByProvinceName(String provinceName);

    boolean existsByProvinceName(String provinceName);

    List<Province> findAllByStatus(ProvinceStatus status);
}

