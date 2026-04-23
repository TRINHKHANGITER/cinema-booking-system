package com.dev.cinemasystem.service;

import com.dev.cinemasystem.dto.ticket.TicketCreationRequest;
import com.dev.cinemasystem.dto.ticket.TicketResponse;
import com.dev.cinemasystem.entity.*;
import com.dev.cinemasystem.enums.TicketStatus;
import com.dev.cinemasystem.exception.AppException;
import com.dev.cinemasystem.exception.ErrorCode;
import com.dev.cinemasystem.mapper.TicketMapper;
import com.dev.cinemasystem.repository.*;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
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

    public TicketResponse createTicket(TicketCreationRequest ticketCreationRequest) {
        Order order = orderRepository.findById(ticketCreationRequest.getOrderId())
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));

        ShowTime showTime = showTimeRepository.findById(ticketCreationRequest.getShowTimeId())
                .orElseThrow(() -> new AppException(ErrorCode.MOVIE_NOT_FOUND));

        Seat seat = seatRepository.findById(ticketCreationRequest.getSeatId())
                .orElseThrow(() -> new AppException(ErrorCode.SEAT_NOT_FOUND));

        PriceTicket priceTicket = priceTicketRepository
                .findByRoomType_RoomTypeIdAndSeatType_SeatTypeId(
                        showTime.getRoom().getRoomType().getRoomTypeId(),
                        seat.getSeatType().getSeatTypeId()
                );
        if (priceTicket == null) {
            throw new AppException(ErrorCode.PRICE_TICKET_NOT_FOUND);
        }

        Ticket ticket = ticketMapper.toTicket(ticketCreationRequest);
        ticket.setShow(showTime);
        ticket.setSeat(seat);
        ticket.setOrder(order);
        ticket.setPriceTicket(priceTicket);
        ticket.setUnitPrice(priceTicket.getPrice());
        ticket.setQrCode(buildQr(order.getOrderId(), showTime.getShowTimeId(), seat.getSeatId()));
        ticket.setStatus(TicketStatus.ACTIVE);

        return ticketMapper.toTicketResponse(ticketRepository.save(ticket));
    }

    public List<TicketResponse> createTicketsFromSoldSeats(Order order, List<ShowTimeSeat> soldSeats) {
        List<TicketResponse> responses = new ArrayList<>();
        for (ShowTimeSeat soldSeat : soldSeats) {
            Integer showTimeId = soldSeat.getShowTime().getShowTimeId();
            Integer seatId = soldSeat.getSeat().getSeatId();

            if (ticketRepository.existsByShow_ShowTimeIdAndSeat_SeatId(showTimeId, seatId)) {
                continue;
            }

            PriceTicket priceTicket = priceTicketRepository
                    .findByRoomType_RoomTypeIdAndSeatType_SeatTypeId(
                            soldSeat.getShowTime().getRoom().getRoomType().getRoomTypeId(),
                            soldSeat.getSeat().getSeatType().getSeatTypeId()
                    );
            if (priceTicket == null) {
                throw new AppException(ErrorCode.PRICE_TICKET_NOT_FOUND);
            }

            Ticket ticket = Ticket.builder()
                    .order(order)
                    .show(soldSeat.getShowTime())
                    .seat(soldSeat.getSeat())
                    .priceTicket(priceTicket)
                    .unitPrice(priceTicket.getPrice())
                    .qrCode(buildQr(order.getOrderId(), showTimeId, seatId))
                    .status(TicketStatus.ACTIVE)
                    .build();

            responses.add(ticketMapper.toTicketResponse(ticketRepository.save(ticket)));
        }

        return responses;
    }

    public TicketResponse getTicketById(int ticketId) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new AppException(ErrorCode.TICKET_NOT_FOUND));

        return ticketMapper.toTicketResponse(ticket);
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

    private String buildQr(Integer orderId, Integer showTimeId, Integer seatId) {
        return "QR-" + orderId + "-" + showTimeId + "-" + seatId;
    }
}
