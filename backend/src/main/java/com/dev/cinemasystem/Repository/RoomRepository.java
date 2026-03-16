package com.dev.cinemasystem.Repository;

import com.dev.cinemasystem.Entity.Room;
import com.dev.cinemasystem.enums.Status;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RoomRepository extends JpaRepository<Room, Integer> {

    Optional<Room> findByRoomId(Integer roomId);


    Page<Room> findAllByCinema_CinemaIdAndRoomType_RoomTypeIdAndStatus(
            Integer cinemaId, Integer roomTypeId, Status status, Pageable pageable);

    Page<Room> findAllByCinema_CinemaIdAndStatus(
            Integer cinemaId, Status status, Pageable pageable);

    Page<Room> findAllByRoomType_RoomTypeIdAndStatus(
            Integer roomTypeId, Status status, Pageable pageable);

    Page<Room> findAllByStatus(Status status, Pageable pageable);
}

