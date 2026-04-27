package com.dev.cinemasystem.repository;

import com.dev.cinemasystem.entity.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Integer> {
    boolean existsByPriceTicket_PriceTicketId(Integer priceTicketId);
    boolean existsBySeat_SeatId(Integer seatId);
    boolean existsByShow_ShowTimeId(Integer showTimeId);

    List<Ticket> findAllByOrder_OrderId(int orderId);

    boolean existsByShow_ShowTimeIdAndSeat_SeatId(Integer showTimeId, Integer seatId);

    void deleteAllByOrder_OrderId(Integer orderId);
}
