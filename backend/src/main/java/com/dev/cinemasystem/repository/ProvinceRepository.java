package com.dev.cinemasystem.repository;

import com.dev.cinemasystem.entity.Province;
import com.dev.cinemasystem.enums.ProvinceStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProvinceRepository extends JpaRepository<Province, Integer>, JpaSpecificationExecutor<Province> {
    Optional<Province> findByProvinceName(String provinceName);

    boolean existsByProvinceName(String provinceName);
    boolean existsByProvinceNameIgnoreCase(String provinceName);
    boolean existsByProvinceNameIgnoreCaseAndProvinceIdNot(String provinceName, Integer provinceId);

    List<Province> findAllByStatus(ProvinceStatus status);
}

