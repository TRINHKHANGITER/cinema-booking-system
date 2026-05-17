package com.dev.cinemasystem.service;

import com.dev.cinemasystem.configuration.booking.BookingProperties;
import com.dev.cinemasystem.dto.showTimeSeatDTO.HoldSeatRequest;
import com.dev.cinemasystem.dto.showTimeSeatDTO.HoldSeatResponse;
import com.dev.cinemasystem.dto.showTimeSeatDTO.ReleaseSeatRequest;
import com.dev.cinemasystem.dto.showTimeSeatDTO.ShowTimeSeatResponse;
import com.dev.cinemasystem.entity.Order;
import com.dev.cinemasystem.entity.OrderCombo;
import com.dev.cinemasystem.entity.PriceTicket;
import com.dev.cinemasystem.entity.ShowTime;
import com.dev.cinemasystem.entity.ShowTimeSeat;
import com.dev.cinemasystem.entity.Ticket;
import com.dev.cinemasystem.entity.User;
import com.dev.cinemasystem.enums.ComboDetailStatus;
import com.dev.cinemasystem.enums.OrderStatus;
import com.dev.cinemasystem.enums.PaymentStatus;
import com.dev.cinemasystem.enums.ShowTimeSeatStatus;
import com.dev.cinemasystem.enums.TicketStatus;
import com.dev.cinemasystem.exception.AppException;
import com.dev.cinemasystem.exception.ErrorCode;
import com.dev.cinemasystem.mapper.ShowTimeSeatMapper;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class SeatInventoryService {
    ShowTimeSeatService showTimeSeatService;
    ShowTimeService showTimeService;
    OrderService orderService;
    UserService userService;
    TicketService ticketService;
    PriceTicketService priceTicketService;
    OrderComboService orderComboService;
    BookingProperties bookingProperties;
    PaymentService paymentService;
    ShowTimeSeatMapper showTimeSeatMapper;

    public List<ShowTimeSeatResponse> getSeatMap(Integer showTimeId) {
        ensureShowTimeExists(showTimeId);
        return showTimeSeatService.findSeatMapByShowTimeId(showTimeId).stream()
                .map(showTimeSeatMapper::mapSeatResponse)
                .toList();
    }

    @Transactional
    public HoldSeatResponse holdSeats(HoldSeatRequest request) {
        if (request == null) {
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }

        List<Integer> seatIds = normalizeSeatIds(request.getSeatIds());
        ShowTime showTime = showTimeService.getShowTimeEntityById(request.getShowTimeId());

        LocalDateTime now = LocalDateTime.now();
        Order order = resolveOrderForHolding(request, showTime, now);
        assertPayingAndNotExpired(order, now);

        List<ShowTimeSeat> lockedSeats = showTimeSeatService.findAllForUpdate(showTime.getShowTimeId(), seatIds);
        if (lockedSeats.size() != seatIds.size()) {
            throw new AppException(ErrorCode.INVALID_SEAT_SELECTION);
        }

        LocalDateTime nextExpiredAt = now.plusMinutes(bookingProperties.getHoldMinutes());
        for (ShowTimeSeat seat : lockedSeats) {
            if (seat.getStatus() == ShowTimeSeatStatus.BLOCKED || seat.getStatus() == ShowTimeSeatStatus.SOLD) {
                throw new AppException(ErrorCode.SHOWTIME_SEAT_NOT_AVAILABLE);
            }

            if (seat.getStatus() == ShowTimeSeatStatus.HELD) {
                boolean heldBySameOrder = seat.getOrder() != null
                        && Objects.equals(seat.getOrder().getOrderId(), order.getOrderId());

                if (!heldBySameOrder && seat.getHoldExpiresAt() != null && seat.getHoldExpiresAt().isAfter(now)) {
                    throw new AppException(ErrorCode.SHOWTIME_SEAT_NOT_AVAILABLE);
                }
            }

            seat.setStatus(ShowTimeSeatStatus.HELD);
            seat.setOrder(order);
            seat.setHoldExpiresAt(nextExpiredAt);
        }

        order.setStatus(OrderStatus.PAYING);
        order.setExpiredAt(nextExpiredAt);
        showTimeSeatService.saveAll(lockedSeats);
        orderService.saveOrder(order);

        extendCurrentHeldSeatsExpiry(order.getOrderId(), nextExpiredAt, seatIds);
        recalculateOrderTotalsInternal(order);
        return buildHoldSeatResponse(order);
    }

    @Transactional
    public HoldSeatResponse releaseSeats(ReleaseSeatRequest request) {
        if (request == null || request.getOrderId() == null) {
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }

        List<Integer> seatIds = normalizeSeatIds(request.getSeatIds());
        LocalDateTime now = LocalDateTime.now();
        Order order = findOrderForUpdate(request.getOrderId());
        assertPayingAndNotExpired(order, now);

        Integer showTimeId = order.getShowTime().getShowTimeId();
        List<ShowTimeSeat> lockedSeats = showTimeSeatService.findAllForUpdate(showTimeId, seatIds);
        if (lockedSeats.size() != seatIds.size()) {
            throw new AppException(ErrorCode.INVALID_SEAT_SELECTION);
        }

        for (ShowTimeSeat seat : lockedSeats) {
            boolean heldByThisOrder = seat.getStatus() == ShowTimeSeatStatus.HELD
                    && seat.getOrder() != null
                    && Objects.equals(seat.getOrder().getOrderId(), order.getOrderId());
            if (!heldByThisOrder) {
                throw new AppException(ErrorCode.SHOWTIME_SEAT_NOT_AVAILABLE);
            }

            seat.setStatus(ShowTimeSeatStatus.AVAILABLE);
            seat.setOrder(null);
            seat.setHoldExpiresAt(null);
        }

        showTimeSeatService.saveAll(lockedSeats);
        recalculateOrderTotalsInternal(order);
        return buildHoldSeatResponse(order);
    }

    @Transactional
    public Integer confirmSold(Integer orderId) {
        LocalDateTime now = LocalDateTime.now();
        Order order = findOrderForUpdate(orderId);

        if (order.getStatus() == OrderStatus.PAID) {
            return order.getShowTime().getShowTimeId();
        }
        if (order.getStatus() != OrderStatus.PAYING) {
            throw new AppException(ErrorCode.ORDER_STATUS_INVALID);
        }
        if (isOrderExpired(order, now)) {
            expireOrderInternal(order, now);
            throw new AppException(ErrorCode.ORDER_EXPIRED);
        }

        List<ShowTimeSeat> heldSeats = showTimeSeatService.findAllByOrderIdAndStatusForUpdate(
                orderId,
                ShowTimeSeatStatus.HELD
        );

        for (ShowTimeSeat seat : heldSeats) {
            seat.setStatus(ShowTimeSeatStatus.SOLD);
            seat.setHoldExpiresAt(null);
        }
        if (!heldSeats.isEmpty()) {
            showTimeSeatService.saveAll(heldSeats);
        }

        createMissingTickets(order, heldSeats);
        order.setStatus(OrderStatus.PAID);
        orderService.saveOrder(order);
        return order.getShowTime().getShowTimeId();
    }

    @Transactional
    public Integer cancelOrder(Integer orderId) {
        Order order = findOrderForUpdate(orderId);

        if (order.getStatus() == OrderStatus.CANCELLED || order.getStatus() == OrderStatus.EXPIRED) {
            return order.getShowTime().getShowTimeId();
        }
        if (order.getStatus() == OrderStatus.PAID) {
            throw new AppException(ErrorCode.ORDER_STATUS_INVALID);
        }

        LocalDateTime now = LocalDateTime.now();
        releaseHeldSeatsOfOrder(order.getOrderId());
        cancelAllOrderCombos(order.getOrderId());
        order.setTicketTotal(BigDecimal.ZERO);
        order.setComboTotal(BigDecimal.ZERO);
        order.setTotalAmount(BigDecimal.ZERO);
        order.setNetAmount(BigDecimal.ZERO);
        order.setDiscountAmount(BigDecimal.ZERO);
        order.setExpiredAt(now);
        order.setStatus(OrderStatus.CANCELLED);
        orderService.saveOrder(order);
        paymentService.cancelPayment(orderId, PaymentStatus.CANCELLED);
        return order.getShowTime().getShowTimeId();
    }

    @Transactional
    public Integer releaseForPaymentFailure(Integer orderId, PaymentStatus paymentStatus) {
        Order order = findOrderForUpdate(orderId);
        if (order.getStatus() != OrderStatus.PAYING) {
            return order.getShowTime().getShowTimeId();
        }

        LocalDateTime now = LocalDateTime.now();
        releaseHeldSeatsOfOrder(orderId);
        order.setStatus(paymentStatus == PaymentStatus.EXPIRED ? OrderStatus.EXPIRED : OrderStatus.CANCELLED);
        order.setExpiredAt(now);
        orderService.saveOrder(order);
        paymentService.cancelPayment(orderId, paymentStatus);
        return order.getShowTime().getShowTimeId();
    }

    @Transactional
    public List<Integer> expireHolds() {
        LocalDateTime now = LocalDateTime.now();
        List<ShowTimeSeat> expiredSeats = showTimeSeatService.findAllExpiredForUpdate(
                ShowTimeSeatStatus.HELD,
                now
        );
        if (expiredSeats.isEmpty()) {
            return List.of();
        }

        Set<Integer> affectedShowTimeIds = new LinkedHashSet<>();
        Set<Integer> affectedOrderIds = new LinkedHashSet<>();

        for (ShowTimeSeat seat : expiredSeats) {
            affectedShowTimeIds.add(seat.getShowTime().getShowTimeId());
            if (seat.getOrder() != null) {
                affectedOrderIds.add(seat.getOrder().getOrderId());
            }

            seat.setStatus(ShowTimeSeatStatus.AVAILABLE);
            seat.setOrder(null);
            seat.setHoldExpiresAt(null);
        }
        showTimeSeatService.saveAll(expiredSeats);

        for (Integer orderId : affectedOrderIds) {
            Order order = findOrderForUpdate(orderId);
            if (order.getStatus() == OrderStatus.PAYING && isOrderExpired(order, now)) {
                order.setStatus(OrderStatus.EXPIRED);
                order.setExpiredAt(now);
                orderService.saveOrder(order);
                paymentService.cancelPayment(orderId, PaymentStatus.EXPIRED);
            }
        }

        return new ArrayList<>(affectedShowTimeIds);
    }

    @Transactional
    public Order recalculateOrderTotals(Integer orderId) {
        Order order = findOrderForUpdate(orderId);
        LocalDateTime now = LocalDateTime.now();
        assertPayingAndNotExpired(order, now);
        return recalculateOrderTotalsInternal(order);
    }

    @Transactional
    public Order getOrder(Integer orderId) {
        return orderService.getOrderEntityById(orderId);
    }

    private HoldSeatResponse buildHoldSeatResponse(Order order) {
        List<ShowTimeSeatResponse> heldSeats = showTimeSeatService
                .findAllByOrderIdAndStatus(order.getOrderId(), ShowTimeSeatStatus.HELD)
                .stream()
                .sorted(Comparator
                        .comparing((ShowTimeSeat seat) -> seat.getSeat().getSeatRow())
                        .thenComparing(seat -> seat.getSeat().getSeatColumn()))
                .map(showTimeSeatMapper::mapSeatResponse)
                .toList();

        return HoldSeatResponse.builder()
                .orderId(order.getOrderId())
                .showTimeId(order.getShowTime().getShowTimeId())
                .expiredAt(order.getExpiredAt())
                .ticketTotal(order.getTicketTotal())
                .comboTotal(order.getComboTotal())
                .discountAmount(order.getDiscountAmount())
                .totalAmount(order.getTotalAmount())
                .netAmount(order.getNetAmount())
                .heldSeats(heldSeats)
                .build();
    }

    private void ensureShowTimeExists(Integer showTimeId) {
        if (!showTimeService.existsShowTimeById(showTimeId)) {
            throw new AppException(ErrorCode.SHOWTIME_NOT_FOUND);
        }
    }

    private List<Integer> normalizeSeatIds(List<Integer> seatIds) {
        if (seatIds == null || seatIds.isEmpty()) {
            throw new AppException(ErrorCode.INVALID_SEAT_SELECTION);
        }

        List<Integer> normalized = seatIds.stream()
                .filter(Objects::nonNull)
                .filter(seatId -> seatId > 0)
                .distinct()
                .toList();

        if (normalized.isEmpty()) {
            throw new AppException(ErrorCode.INVALID_SEAT_SELECTION);
        }
        return normalized;
    }

    private Order resolveOrderForHolding(HoldSeatRequest request, ShowTime showTime, LocalDateTime now) {
        if (request.getOrderId() != null) {
            Order order = findOrderForUpdate(request.getOrderId());
            if (!Objects.equals(order.getShowTime().getShowTimeId(), showTime.getShowTimeId())) {
                throw new AppException(ErrorCode.ORDER_STATUS_INVALID);
            }
            return order;
        }

        Order order = null;
        if (request.getUserId() != null) {
            order = orderService.findLatestPayingOrder(request.getUserId(), showTime.getShowTimeId())
                    .map(existing -> findOrderForUpdate(existing.getOrderId()))
                    .orElse(null);
        }

        if (order != null && isOrderExpired(order, now)) {
            expireOrderInternal(order, now);
            order = null;
        }

        if (order == null) {
            order = createNewPayingOrder(showTime, request.getUserId(), now);
        }

        return order;
    }

    private Order createNewPayingOrder(ShowTime showTime, Integer userId, LocalDateTime now) {
        User user = null;
        if (userId != null) {
            user = userService.getUserEntityById(userId);
        }

        return orderService.saveOrder(Order.builder()
                .user(user)
                .showTime(showTime)
                .ticketTotal(BigDecimal.ZERO)
                .comboTotal(BigDecimal.ZERO)
                .discountAmount(BigDecimal.ZERO)
                .totalAmount(BigDecimal.ZERO)
                .netAmount(BigDecimal.ZERO)
                .expiredAt(now.plusMinutes(bookingProperties.getHoldMinutes()))
                .status(OrderStatus.PAYING)
                .build());
    }

    private void assertPayingAndNotExpired(Order order, LocalDateTime now) {
        if (order.getStatus() != OrderStatus.PAYING) {
            throw new AppException(ErrorCode.ORDER_STATUS_INVALID);
        }
        if (isOrderExpired(order, now)) {
            expireOrderInternal(order, now);
            throw new AppException(ErrorCode.ORDER_EXPIRED);
        }
    }

    private boolean isOrderExpired(Order order, LocalDateTime now) {
        return order.getExpiredAt() != null && !order.getExpiredAt().isAfter(now);
    }

    private Order findOrderForUpdate(Integer orderId) {
        return orderService.getOrderEntityByIdForUpdate(orderId);
    }

    private void extendCurrentHeldSeatsExpiry(Integer orderId, LocalDateTime expiresAt, List<Integer> latestHeldSeatIds) {
        Set<Integer> latestIds = new LinkedHashSet<>(latestHeldSeatIds);
        List<ShowTimeSeat> currentHeldSeats = showTimeSeatService.findAllByOrderIdAndStatus(
                orderId,
                ShowTimeSeatStatus.HELD
        );

        for (ShowTimeSeat seat : currentHeldSeats) {
            if (latestIds.contains(seat.getSeat().getSeatId())) {
                continue;
            }
            seat.setHoldExpiresAt(expiresAt);
        }

        if (!currentHeldSeats.isEmpty()) {
            showTimeSeatService.saveAll(currentHeldSeats);
        }
    }

    private Order recalculateOrderTotalsInternal(Order order) {
        List<ShowTimeSeat> heldSeats = showTimeSeatService.findAllByOrderIdAndStatus(
                order.getOrderId(),
                ShowTimeSeatStatus.HELD
        );
        BigDecimal ticketTotal = calculateTicketTotal(order, heldSeats);
        BigDecimal comboTotal = calculateComboTotal(order.getOrderId());
        BigDecimal discount = order.getDiscountAmount() != null ? order.getDiscountAmount() : BigDecimal.ZERO;
        BigDecimal total = ticketTotal.add(comboTotal);
        BigDecimal net = total.subtract(discount);
        if (net.signum() < 0) {
            net = BigDecimal.ZERO;
        }

        order.setTicketTotal(ticketTotal);
        order.setComboTotal(comboTotal);
        order.setTotalAmount(total);
        order.setDiscountAmount(discount);
        order.setNetAmount(net);
        return orderService.saveOrder(order);
    }

    private BigDecimal calculateTicketTotal(Order order, List<ShowTimeSeat> heldSeats) {
        BigDecimal total = BigDecimal.ZERO;
        for (ShowTimeSeat seat : heldSeats) {
            PriceTicket priceTicket = getPriceTicket(order.getShowTime(), seat.getSeat().getSeatType().getSeatTypeId());
            total = total.add(priceTicket.getPrice());
        }
        return total;
    }

    private BigDecimal calculateComboTotal(Integer orderId) {
        return orderComboService.findAllByOrderIdAndStatus(orderId, ComboDetailStatus.ACTIVE)
                .stream()
                .map(OrderCombo::getNetAmount)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private PriceTicket getPriceTicket(ShowTime showTime, Integer seatTypeId) {
        Integer roomTypeId = showTime.getRoom().getRoomType().getRoomTypeId();
        PriceTicket priceTicket = priceTicketService.findByRoomTypeIdAndSeatTypeId(roomTypeId, seatTypeId);
        if (priceTicket == null) {
            throw new AppException(ErrorCode.PRICE_TICKET_NOT_FOUND);
        }
        return priceTicket;
    }

    private void createMissingTickets(Order order, List<ShowTimeSeat> soldSeats) {
        if (soldSeats.isEmpty()) {
            return;
        }

        Map<Integer, Ticket> existingBySeatId = ticketService.findAllByOrderId(order.getOrderId())
                .stream()
                .collect(Collectors.toMap(ticket -> ticket.getSeat().getSeatId(), ticket -> ticket, (first, second) -> first));

        List<Ticket> newTickets = new ArrayList<>();
        for (ShowTimeSeat soldSeat : soldSeats) {
            Integer seatId = soldSeat.getSeat().getSeatId();
            if (existingBySeatId.containsKey(seatId)) {
                continue;
            }

            PriceTicket priceTicket = getPriceTicket(order.getShowTime(), soldSeat.getSeat().getSeatType().getSeatTypeId());
            String qrCode = "ODR-%04d-STS-%04d".formatted(order.getOrderId(), soldSeat.getShowTimeSeatId());

            Ticket ticket = Ticket.builder()
                    .order(order)
                    .show(order.getShowTime())
                    .seat(soldSeat.getSeat())
                    .priceTicket(priceTicket)
                    .unitPrice(priceTicket.getPrice())
                    .netAmount(priceTicket.getPrice())
                    .qrCode(qrCode)
                    .status(TicketStatus.ACTIVE)
                    .build();
            newTickets.add(ticket);
        }

        if (!newTickets.isEmpty()) {
            ticketService.saveAll(newTickets);
        }
    }

    private void releaseHeldSeatsOfOrder(Integer orderId) {
        List<ShowTimeSeat> heldSeats = showTimeSeatService.findAllByOrderIdAndStatusForUpdate(
                orderId,
                ShowTimeSeatStatus.HELD
        );
        if (heldSeats.isEmpty()) {
            return;
        }

        for (ShowTimeSeat seat : heldSeats) {
            seat.setStatus(ShowTimeSeatStatus.AVAILABLE);
            seat.setOrder(null);
            seat.setHoldExpiresAt(null);
        }
        showTimeSeatService.saveAll(heldSeats);
    }

    private void cancelAllOrderCombos(Integer orderId) {
        List<OrderCombo> combos = orderComboService.findAllByOrderId(orderId);
        if (combos.isEmpty()) {
            return;
        }

        for (OrderCombo combo : combos) {
            combo.setStatus(ComboDetailStatus.CANCELLED);
            combo.setQuantity(0);
            combo.setNetAmount(BigDecimal.ZERO);
        }
        orderComboService.saveAll(combos);
    }

    private void expireOrderInternal(Order order, LocalDateTime now) {
        releaseHeldSeatsOfOrder(order.getOrderId());
        order.setStatus(OrderStatus.EXPIRED);
        order.setExpiredAt(now);
        orderService.saveOrder(order);
        paymentService.cancelPayment(order.getOrderId(), PaymentStatus.EXPIRED);
    }
}
