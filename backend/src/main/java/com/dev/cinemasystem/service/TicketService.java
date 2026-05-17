package com.dev.cinemasystem.service;

import com.dev.cinemasystem.entity.Ticket;
import com.dev.cinemasystem.enums.TicketStatus;
import com.dev.cinemasystem.repository.TicketRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class TicketService {
    TicketRepository ticketRepository;

    public boolean existsByPriceTicketId(Integer priceTicketId) {
        return ticketRepository.existsByPriceTicket_PriceTicketId(priceTicketId);
    }

    public boolean existsBySeatId(Integer seatId) {
        return ticketRepository.existsBySeat_SeatId(seatId);
    }

    public boolean existsByShowTimeId(Integer showTimeId) {
        return ticketRepository.existsByShow_ShowTimeId(showTimeId);
    }

    public List<Ticket> findAllByOrderId(Integer orderId) {
        return ticketRepository.findAllByOrder_OrderId(orderId);
    }

    public List<Ticket> findAllByOrderIdAndStatus(Integer orderId, TicketStatus status) {
        return ticketRepository.findAllByOrder_OrderIdAndStatus(orderId, status);
    }

    public List<Ticket> saveAll(List<Ticket> tickets) {
        return ticketRepository.saveAll(tickets);
    }

    public void deleteAllByOrderId(Integer orderId) {
        ticketRepository.deleteAllByOrder_OrderId(orderId);
    }
}
