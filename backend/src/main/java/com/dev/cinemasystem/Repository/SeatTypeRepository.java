package com.dev.cinemasystem.Repository;

import com.dev.cinemasystem.Entity.SeatType;
import com.dev.cinemasystem.enums.SeatTypeStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SeatTypeRepository extends JpaRepository<SeatType, Integer>{
    Page<SeatType> findAllByStatus(SeatTypeStatus status, Pageable pageable);
    boolean existsBySeatTypeName(String seatTypeName);
    SeatType findBySeatTypeName(String seatTypeName);
}

