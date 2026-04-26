package com.dev.cinemasystem.repository;

import com.dev.cinemasystem.entity.Room;
import com.dev.cinemasystem.enums.RoomStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;
import java.util.Optional;

public interface RoomRepository extends JpaRepository<Room, Integer>, JpaSpecificationExecutor<Room> {

    Optional<Room> findByRoomId(Integer roomId);
    boolean existsByRoomType_RoomTypeIdAndStatus(Integer roomTypeId, RoomStatus status);
    boolean existsByCinema_CinemaIdAndStatus(Integer cinemaId, RoomStatus status);


    Page<Room> findAllByCinema_CinemaIdAndRoomType_RoomTypeIdAndStatus(
            Integer cinemaId, Integer roomTypeId, RoomStatus status, Pageable pageable);

    Page<Room> findAllByCinema_CinemaIdAndStatus(
            Integer cinemaId, RoomStatus status, Pageable pageable);

    Page<Room> findAllByRoomType_RoomTypeIdAndStatus(
            Integer roomTypeId, RoomStatus status, Pageable pageable);

    Page<Room> findAllByStatus(RoomStatus status, Pageable pageable);

    List<Room> findAllByCinema_CinemaIdAndStatusOrderByRoomNameAsc(Integer cinemaId, RoomStatus status);
    List<Room> findAllByCinema_CinemaIdOrderByRoomNameAsc(Integer cinemaId);
    List<Room> findAllByStatusOrderByRoomNameAsc(RoomStatus status);
    List<Room> findAllByOrderByRoomNameAsc();
}


