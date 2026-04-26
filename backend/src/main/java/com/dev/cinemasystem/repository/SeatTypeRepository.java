package com.dev.cinemasystem.repository;

import com.dev.cinemasystem.entity.SeatType;
import com.dev.cinemasystem.enums.SeatTypeStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface SeatTypeRepository extends JpaRepository<SeatType, Integer>, JpaSpecificationExecutor<SeatType> {
    Page<SeatType> findAllByStatus(SeatTypeStatus status, Pageable pageable);
    boolean existsBySeatTypeNameIgnoreCase(String seatTypeName);
    boolean existsBySeatTypeNameIgnoreCaseAndSeatTypeIdNot(String seatTypeName, Integer seatTypeId);
}

