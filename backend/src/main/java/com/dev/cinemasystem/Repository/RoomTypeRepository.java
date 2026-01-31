package com.dev.cinemasystem.Repository;

import com.dev.cinemasystem.Entity.room.RoomType;
import com.dev.cinemasystem.enums.Status;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RoomTypeRepository extends JpaRepository<RoomType, Integer>{
    Page<RoomType> findAllByStatus(Status status, Pageable pageable);
    boolean existsByRoomTypeName(String roomTypeName);
    RoomType findByRoomTypeName(String roomTypeName);
}
