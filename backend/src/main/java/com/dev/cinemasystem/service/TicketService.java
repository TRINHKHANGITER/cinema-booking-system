package com.dev.cinemasystem.service;

import com.dev.cinemasystem.dto.ticket.TicketCreationRequest;
import com.dev.cinemasystem.dto.ticket.TicketResponse;
import com.dev.cinemasystem.entity.*;
import com.dev.cinemasystem.enums.OrderStatus;
import com.dev.cinemasystem.enums.Role;
import com.dev.cinemasystem.enums.ShowTimeSeatStatus;
import com.dev.cinemasystem.enums.TicketStatus;
import com.dev.cinemasystem.exception.AppException;
import com.dev.cinemasystem.exception.ErrorCode;
import com.dev.cinemasystem.mapper.TicketMapper;
import com.dev.cinemasystem.repository.*;
import jakarta.transaction.Transactional;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@Slf4j
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
    ShowTimeSeatRepository showTimeSeatRepository;
    UserRepository userRepository;
    BookingService bookingService;

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

        System.out.println("priceTicket: " + priceTicket);
        if (priceTicket == null) {
            throw new AppException(ErrorCode.PRICE_TICKET_NOT_FOUND);
        }

        Ticket ticket = ticketMapper.toTicket(ticketCreationRequest);
        ticket.setShow(showTime);
        ticket.setSeat(seat);
        ticket.setOrder(order);
        ticket.setPriceTicket(priceTicket);
        ticket.setNetAmount(priceTicket.getPrice());
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
            log.info("giá vé {}", priceTicket);
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

    public List<TicketResponse> getTickets() {
        return ticketRepository.findAll().stream().map(ticketMapper::toTicketResponse).toList();
    }

    public List<TicketResponse> getTicketsByOrderId(int orderId) {
        List<Ticket> tickets = ticketRepository.findAllByOrder_OrderId(orderId);
        return tickets.stream().map(ticketMapper::toTicketResponse).toList();
    }

    @Transactional
    public TicketResponse updateTicketStatus(Integer ticketId, TicketStatus status) {
        ensureCurrentUserIsAdmin();

        if (status == null) {
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }

        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new AppException(ErrorCode.TICKET_NOT_FOUND));

        Order order = ticket.getOrder();
        if (order == null || order.getStatus() != OrderStatus.PAID) {
            throw new AppException(ErrorCode.ORDER_STATUS_INVALID);
        }

        if (bookingService.isShowTimeStarted(order.getShowTime())) {
            throw new AppException(ErrorCode.ORDER_STATUS_INVALID);
        }

        TicketStatus currentStatus = ticket.getStatus() == null ? TicketStatus.ACTIVE : ticket.getStatus();
        if (currentStatus == status) {
            return ticketMapper.toTicketResponse(ticket);
        }

        ShowTimeSeat showTimeSeat = showTimeSeatRepository.findByShowTimeIdAndSeatIdForUpdate(
                        ticket.getShow().getShowTimeId(),
                        ticket.getSeat().getSeatId()
                )
                .orElseThrow(() -> new AppException(ErrorCode.SHOWTIME_SEAT_NOT_AVAILABLE));

        if (status == TicketStatus.CANCELLED) {
            ticket.setStatus(TicketStatus.CANCELLED);
            ticketRepository.save(ticket);
            releaseSeatForCancelledTicket(showTimeSeat, order.getOrderId());
        } else if (status == TicketStatus.ACTIVE) {
            reserveSeatForActiveTicket(showTimeSeat, order);
            ticket.setStatus(TicketStatus.ACTIVE);
            ticketRepository.save(ticket);
        } else {
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }

        bookingService.recalculateOrderTotalsForOrder(order.getOrderId());
        return ticketMapper.toTicketResponse(ticket);
    }



    private void reserveSeatForActiveTicket(ShowTimeSeat showTimeSeat, Order order) {
        Integer orderId = order.getOrderId();
        Integer currentOrderId = showTimeSeat.getOrder() != null ? showTimeSeat.getOrder().getOrderId() : null;

        if (showTimeSeat.getStatus() == ShowTimeSeatStatus.SOLD) {
            if (!Objects.equals(currentOrderId, orderId)) {
                throw new AppException(ErrorCode.SHOWTIME_SEAT_NOT_AVAILABLE);
            }
            showTimeSeat.setHoldExpiresAt(null);
            showTimeSeatRepository.save(showTimeSeat);
            return;
        }

        if (showTimeSeat.getStatus() == ShowTimeSeatStatus.HELD) {
            boolean isOwnHold = Objects.equals(currentOrderId, orderId);
            boolean expiredHold = showTimeSeat.getHoldExpiresAt() != null
                    && showTimeSeat.getHoldExpiresAt().isBefore(LocalDateTime.now());
            if (!isOwnHold && !expiredHold) {
                throw new AppException(ErrorCode.SHOWTIME_SEAT_NOT_AVAILABLE);
            }
        } else if (showTimeSeat.getStatus() != ShowTimeSeatStatus.AVAILABLE) {
            throw new AppException(ErrorCode.SHOWTIME_SEAT_NOT_AVAILABLE);
        }

        showTimeSeat.setStatus(ShowTimeSeatStatus.SOLD);
        showTimeSeat.setOrder(order);
        showTimeSeat.setHoldExpiresAt(null);
        showTimeSeatRepository.save(showTimeSeat);
    }

    private void releaseSeatForCancelledTicket(ShowTimeSeat showTimeSeat, Integer orderId) {
        Integer currentOrderId = showTimeSeat.getOrder() != null ? showTimeSeat.getOrder().getOrderId() : null;
        if (!Objects.equals(currentOrderId, orderId)) {
            return;
        }
        if (showTimeSeat.getStatus() != ShowTimeSeatStatus.SOLD && showTimeSeat.getStatus() != ShowTimeSeatStatus.HELD) {
            return;
        }

        showTimeSeat.setStatus(ShowTimeSeatStatus.AVAILABLE);
        showTimeSeat.setOrder(null);
        showTimeSeat.setHoldExpiresAt(null);
        showTimeSeatRepository.save(showTimeSeat);
    }

    private void ensureCurrentUserIsAdmin() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getName() == null) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }

        String email = authentication.getName() == null
                ? null
                : authentication.getName().trim().toLowerCase();
        if (email == null || email.isBlank() || "anonymoususer".equals(email)) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }

        User currentUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        if (currentUser.getRole() != Role.ADMIN) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }
    }

    private String buildQr(Integer orderId, Integer showTimeId, Integer seatId) {
        return "QR-" + orderId + "-" + showTimeId + "-" + seatId;
    }
}
