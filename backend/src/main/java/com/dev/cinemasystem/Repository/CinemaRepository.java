package com.dev.cinemasystem.Repository;

import com.dev.cinemasystem.Entity.Cinema;
import com.dev.cinemasystem.enums.Status;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CinemaRepository extends JpaRepository<Cinema, Integer> {
    boolean existsByCinemaName(String cinemaName);

    Page<Cinema> findByProvince_ProvinceIdAndStatus(Integer provinceId, Status status, Pageable pageable);

    Page<Cinema> findByProvince_ProvinceId(Integer provinceId, Pageable pageable);

    Page<Cinema> findByStatus(Status status, Pageable pageable);
}
