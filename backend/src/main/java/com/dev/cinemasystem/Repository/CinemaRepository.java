package com.dev.cinemasystem.Repository;


import com.dev.cinemasystem.Entity.Cinema;
import com.dev.cinemasystem.Entity.Province;
import com.dev.cinemasystem.dto.cinemaDTO.CinemaResponse;
import com.dev.cinemasystem.enums.Status;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CinemaRepository extends JpaRepository<Cinema, Integer> {
    boolean existsByAddress_AddressId(Integer addressId);
    boolean existsByAddress_AddressIdAndCinemaIdNot(Integer addressId, Integer cinemaId);
    Page<Cinema> findByAddress_Province_CodeAndStatus(Integer provinceCode, Status status, Pageable pageable);
    Page<Cinema> findByAddress_Province_Code(Integer provinceCode, Pageable pageable);
    Page<Cinema> findByStatus(Status status, Pageable pageable);

}
