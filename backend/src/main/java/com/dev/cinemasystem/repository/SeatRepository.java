package com.dev.cinemasystem.repository;

import com.dev.cinemasystem.entity.Seat;
import com.dev.cinemasystem.enums.SeatStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SeatRepository extends JpaRepository<Seat, Integer> {

    Optional<Seat> findBySeatId(Integer seatId);
    boolean existsBySeatType_SeatTypeIdAndStatus(Integer seatTypeId, SeatStatus status);
    boolean existsByRoom_RoomIdAndStatus(Integer roomId, SeatStatus status);

    boolean existsBySeatRowAndSeatColumnAndRoom_RoomId(
            String seatRow, Integer seatColumn, Integer roomId);

    Optional<Seat> findBySeatRowAndSeatColumnAndRoom_RoomId(
            String seatRow, Integer seatColumn,  Integer roomId);

    Page<Seat> findAllByRoom_RoomIdAndSeatType_SeatTypeIdAndStatus(
            Integer cinemaId, Integer seatTypeId, SeatStatus status, Pageable pageable);

    Page<Seat> findAllByRoom_RoomIdAndStatus(
            Integer cinemaId, SeatStatus status, Pageable pageable);

    Page<Seat> findAllBySeatType_SeatTypeIdAndStatus(
            Integer seatTypeId, SeatStatus status, Pageable pageable);

    Page<Seat> findAllByStatus(SeatStatus status, Pageable pageable);

    List<Seat> findAllByRoom_RoomId(Integer roomId);
    List<Seat> findAllByRoom_RoomIdOrderBySeatRowAscSeatColumnAsc(Integer roomId);
    List<Seat> findAllByRoom_RoomIdAndStatusOrderBySeatRowAscSeatColumnAsc(Integer roomId, SeatStatus status);
}


