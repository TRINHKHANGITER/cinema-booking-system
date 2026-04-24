package com.dev.cinemasystem.repository;

import com.dev.cinemasystem.entity.Ticket;
import com.dev.cinemasystem.enums.TicketStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Integer> {
    List<Ticket> findAllByStatus(TicketStatus status);
    boolean existsByPriceTicket_PriceTicketIdAndStatus(Integer priceTicketId, TicketStatus status);
    boolean existsBySeat_SeatIdAndStatus(Integer seatId, TicketStatus status);
    boolean existsByShow_ShowTimeIdAndStatus(Integer showTimeId, TicketStatus status);

    List<Ticket> findAllByOrder_OrderId(int orderId);

    boolean existsByShow_ShowTimeIdAndSeat_SeatId(Integer showTimeId, Integer seatId);
}
