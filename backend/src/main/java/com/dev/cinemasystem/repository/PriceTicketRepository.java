package com.dev.cinemasystem.repository;

import com.dev.cinemasystem.entity.PriceTicket;
import com.dev.cinemasystem.enums.PriceTicketStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface PriceTicketRepository extends JpaRepository<PriceTicket, Integer>, JpaSpecificationExecutor<PriceTicket> {

    Page<PriceTicket> findAllByStatus(PriceTicketStatus status, Pageable pageable);
    PriceTicket findByRoomType_RoomTypeIdAndSeatType_SeatTypeId(Integer roomTypeId, Integer seatTypeId);


}


