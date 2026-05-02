package com.dev.cinemasystem.repository;

import com.dev.cinemasystem.entity.Ticket;
import com.dev.cinemasystem.enums.TicketStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Integer> {
    boolean existsByPriceTicket_PriceTicketId(Integer priceTicketId);
    boolean existsBySeat_SeatId(Integer seatId);
    boolean existsByShow_ShowTimeId(Integer showTimeId);

    List<Ticket> findAllByOrder_OrderId(int orderId);

    boolean existsByShow_ShowTimeIdAndSeat_SeatId(Integer showTimeId, Integer seatId);

    List<Ticket> findAllByOrder_OrderIdAndStatus(Integer orderId, TicketStatus status);

    Optional<Ticket> findByTicketIdAndOrder_OrderId(Integer ticketId, Integer orderId);

    void deleteAllByOrder_OrderId(Integer orderId);
}
