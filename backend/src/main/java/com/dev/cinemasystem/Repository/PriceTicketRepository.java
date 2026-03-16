package com.dev.cinemasystem.Repository;

import com.dev.cinemasystem.Entity.Seat;
import com.dev.cinemasystem.Entity.PriceTicket;
import com.dev.cinemasystem.enums.Status;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;


public interface PriceTicketRepository extends JpaRepository<PriceTicket, Integer> {

    Page<PriceTicket> findAllByStatus(Status status, Pageable pageable);
    PriceTicket findByRoomType_RoomTypeIdAndSeatType_SeatTypeIdAndTicketType_TicketTypeId(Integer roomTypeId, Integer seatTypeId, Integer ticketTypeId);


}

