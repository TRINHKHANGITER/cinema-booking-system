package com.dev.cinemasystem.repository;

import com.dev.cinemasystem.entity.RoomType;
import com.dev.cinemasystem.enums.RoomTypeStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;

public interface RoomTypeRepository extends JpaRepository<RoomType, Integer>, JpaSpecificationExecutor<RoomType> {
    Page<RoomType> findAllByStatus(RoomTypeStatus status, Pageable pageable);
    List<RoomType> findAllByStatusOrderByRoomTypeNameAsc(RoomTypeStatus status);
    boolean existsByRoomTypeNameIgnoreCase(String roomTypeName);
    boolean existsByRoomTypeNameIgnoreCaseAndRoomTypeIdNot(String roomTypeName, Integer roomTypeId);
}

