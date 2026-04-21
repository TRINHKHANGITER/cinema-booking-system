package com.dev.cinemasystem.repository;

import com.dev.cinemasystem.entity.PriceTicket;
import com.dev.cinemasystem.enums.PriceTicketStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;


public interface PriceTicketRepository extends JpaRepository<PriceTicket, Integer> {

    Page<PriceTicket> findAllByStatus(PriceTicketStatus status, Pageable pageable);
    PriceTicket findByRoomType_RoomTypeIdAndSeatType_SeatTypeIdAndTicketType_TicketTypeId(Integer roomTypeId, Integer seatTypeId, Integer ticketTypeId);


}


