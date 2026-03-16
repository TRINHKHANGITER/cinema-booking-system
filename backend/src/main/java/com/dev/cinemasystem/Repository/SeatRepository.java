package com.dev.cinemasystem.Repository;

import com.dev.cinemasystem.Entity.Seat;
import com.dev.cinemasystem.enums.Status;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SeatRepository extends JpaRepository<Seat, Integer> {

    Optional<Seat> findBySeatId(Integer seatId);

    boolean existsBySeatRowAndSeatColumnAndRoom_RoomId(
            String seatRow, Integer seatColumn, Integer roomId);

    Optional<Seat> findBySeatRowAndSeatColumnAndRoom_RoomId(
            String seatRow, Integer seatColumn,  Integer roomId);

    Page<Seat> findAllByRoom_RoomIdAndSeatType_SeatTypeIdAndStatus(
            Integer cinemaId, Integer seatTypeId, Status status, Pageable pageable);

    Page<Seat> findAllByRoom_RoomIdAndStatus(
            Integer cinemaId, Status status, Pageable pageable);

    Page<Seat> findAllBySeatType_SeatTypeIdAndStatus(
            Integer seatTypeId, Status status, Pageable pageable);

    Page<Seat> findAllByStatus(Status status, Pageable pageable);
}

