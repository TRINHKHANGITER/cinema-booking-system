package com.dev.cinemasystem.service;

import com.dev.cinemasystem.dto.ticket.TicketCreationRequest;
import com.dev.cinemasystem.dto.ticket.TicketResponse;
import com.dev.cinemasystem.entity.*;
import com.dev.cinemasystem.mapper.TicketMapper;
import com.dev.cinemasystem.repository.*;
import com.dev.cinemasystem.enums.TicketStatus;
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
    TicketMapper ticketMapper;
    OrderRepository orderRepository;
    ShowTimeRepository showTimeRepository;
    SeatRepository seatRepository;
    PriceTicketRepository priceTicketRepository;
    RoomService roomService;

    public TicketResponse createTicket(TicketCreationRequest ticketCreationRequest) {
        Order order = orderRepository.findById(ticketCreationRequest.getOrderId())
                .orElseThrow(() -> new RuntimeException("Order not exists!"));

        ShowTime showTime = showTimeRepository.findById(ticketCreationRequest.getShowTimeId())
                .orElseThrow(() -> new RuntimeException("ShowTime not exists!"));

        Seat seat = seatRepository.findById(ticketCreationRequest.getSeatId())
                .orElseThrow(() -> new RuntimeException("Seat not exists!"));

        int roomId = showTime.getRoom().getRoomId();
        int roomTypeId = roomService.getRoomById(roomId).getRoomTypeId();
        PriceTicket priceTicket =
                priceTicketRepository.findByRoomType_RoomTypeIdAndSeatType_SeatTypeId(roomTypeId, seat.getSeatType().getSeatTypeId());

        Ticket ticket = ticketMapper.toTicket(ticketCreationRequest);
        ticket.setShow(showTime);
        ticket.setSeat(seat);
        ticket.setOrder(order);
        ticket.setPriceTicket(priceTicket);

        return ticketMapper.toTicketResponse(ticketRepository.save(ticket));
    }

    public TicketResponse getTicketById(int ticketId) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("TicketId not exists!"));

        return  ticketMapper.toTicketResponse(ticket);
    }

    public List<TicketResponse> getTickets(TicketStatus status) {
        var tickets = status == null
                ? ticketRepository.findAll()
                : ticketRepository.findAllByStatus(status);

        return tickets.stream().map(ticketMapper::toTicketResponse).toList();
    }

    public List<TicketResponse> getTicketsByOrderId(int orderId) {
        List<Ticket> tickets = ticketRepository.findAllByOrder_OrderId(orderId);
        return tickets.stream().map(ticketMapper::toTicketResponse).toList();
    }

}
