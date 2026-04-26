package com.dev.cinemasystem.service;

import com.dev.cinemasystem.configuration.booking.BookingProperties;
import com.dev.cinemasystem.dto.bookingDTO.OrderComboItemRequest;
import com.dev.cinemasystem.dto.bookingDTO.UpdateOrderCombosRequest;
import com.dev.cinemasystem.dto.orderDTO.OrderResponse;
import com.dev.cinemasystem.dto.showTimeSeatDTO.HoldSeatRequest;
import com.dev.cinemasystem.dto.showTimeSeatDTO.HoldSeatResponse;
import com.dev.cinemasystem.dto.showTimeSeatDTO.ReleaseSeatRequest;
import com.dev.cinemasystem.dto.showTimeSeatDTO.ShowTimeSeatResponse;
import com.dev.cinemasystem.entity.*;
import com.dev.cinemasystem.enums.*;
import com.dev.cinemasystem.exception.AppException;
import com.dev.cinemasystem.exception.ErrorCode;
import com.dev.cinemasystem.mapper.OrderMapper;
import com.dev.cinemasystem.repository.*;
import jakarta.transaction.Transactional;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class BookingService {

    BookingProperties bookingProperties;
    ShowTimeSeatRepository showTimeSeatRepository;
    ShowTimeRepository showTimeRepository;
    OrderRepository orderRepository;
    OrderComboRepository orderComboRepository;
    ComboRepository comboRepository;
    UserRepository userRepository;
    PriceTicketRepository priceTicketRepository;
    PaymentRepository paymentRepository;
    TicketRepository ticketRepository;
    OrderMapper orderMapper;

    @Transactional
    public List<ShowTimeSeatResponse> getSeatMap(Integer showTimeId) {
        showTimeRepository.findById(showTimeId)
                .orElseThrow(() -> new AppException(ErrorCode.MOVIE_NOT_FOUND));

        releaseExpiredHoldsForShowTime(showTimeId);

        return showTimeSeatRepository.findSeatMapByShowTimeId(showTimeId)
                .stream()
                .map(this::toShowTimeSeatResponse)
                .toList();
    }

    @Transactional
    public HoldSeatResponse holdSeats(HoldSeatRequest request) {
        ShowTime showTime = showTimeRepository.findById(request.getShowTimeId())
                .orElseThrow(() -> new AppException(ErrorCode.MOVIE_NOT_FOUND));

        if (showTime.getStatus() == ShowTimeStatus.CANCELLED
                || showTime.getStatus() == ShowTimeStatus.COMPLETED
                || showTime.getStatus() == ShowTimeStatus.STOPPED) {
            throw new AppException(ErrorCode.ORDER_STATUS_INVALID);
        }

        Order order = resolveOrderForHold(request, showTime);
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime holdExpiresAt = order.getExpiredAt() != null
                ? order.getExpiredAt()
                : now.plusMinutes(bookingProperties.getHoldMinutes());

        List<Integer> normalizedSeatIds = request.getSeatIds().stream()
                .filter(Objects::nonNull)
                .distinct()
                .toList();
        if (normalizedSeatIds.isEmpty()) {
            throw new AppException(ErrorCode.INVALID_SEAT_SELECTION);
        }

        List<ShowTimeSeat> targetSeats = showTimeSeatRepository.findAllForUpdate(showTime.getShowTimeId(), normalizedSeatIds);
        if (targetSeats.size() != normalizedSeatIds.size()) {
            throw new AppException(ErrorCode.INVALID_SEAT_SELECTION);
        }

        for (ShowTimeSeat targetSeat : targetSeats) {
            if (targetSeat.getStatus() == ShowTimeSeatStatus.BLOCKED || targetSeat.getStatus() == ShowTimeSeatStatus.SOLD) {
                throw new AppException(ErrorCode.SHOWTIME_SEAT_NOT_AVAILABLE);
            }

            if (targetSeat.getStatus() == ShowTimeSeatStatus.HELD) {
                if (targetSeat.getOrder() != null && Objects.equals(targetSeat.getOrder().getOrderId(), order.getOrderId())) {
                    // Không gia hạn bộ đếm cho những lần chọn tiếp theo.
                    if (targetSeat.getHoldExpiresAt() == null) {
                        targetSeat.setHoldExpiresAt(holdExpiresAt);
                    }
                    continue;
                }

                if (targetSeat.getHoldExpiresAt() != null && targetSeat.getHoldExpiresAt().isBefore(now)) {
                    targetSeat.setStatus(ShowTimeSeatStatus.AVAILABLE);
                    targetSeat.setOrder(null);
                    targetSeat.setHoldExpiresAt(null);
                } else {
                    throw new AppException(ErrorCode.SHOWTIME_SEAT_NOT_AVAILABLE);
                }
            }

            targetSeat.setStatus(ShowTimeSeatStatus.HELD);
            targetSeat.setOrder(order);
            targetSeat.setHoldExpiresAt(holdExpiresAt);
        }

        showTimeSeatRepository.saveAll(targetSeats);

        if (order.getExpiredAt() == null) {
            order.setExpiredAt(holdExpiresAt);
        }
        order.setStatus(OrderStatus.PAYING);
        recalculateOrderTotals(order);

        List<ShowTimeSeat> heldSeats = showTimeSeatRepository.findAllByOrder_OrderIdAndStatus(
                order.getOrderId(),
                ShowTimeSeatStatus.HELD
        );

        return toHoldSeatResponse(order, heldSeats);
    }

    @Transactional
    public HoldSeatResponse releaseSeats(ReleaseSeatRequest request) {
        Order order = ensurePayingOrder(request.getOrderId());
        List<Integer> seatIds = request.getSeatIds().stream().filter(Objects::nonNull).distinct().toList();
        if (seatIds.isEmpty()) {
            throw new AppException(ErrorCode.INVALID_SEAT_SELECTION);
        }

        List<ShowTimeSeat> targetSeats = showTimeSeatRepository.findAllForUpdate(order.getShowTime().getShowTimeId(), seatIds);
        for (ShowTimeSeat seat : targetSeats) {
            if (seat.getStatus() == ShowTimeSeatStatus.HELD
                    && seat.getOrder() != null
                    && Objects.equals(seat.getOrder().getOrderId(), order.getOrderId())) {
                seat.setStatus(ShowTimeSeatStatus.AVAILABLE);
                seat.setOrder(null);
                seat.setHoldExpiresAt(null);
            }
        }

        showTimeSeatRepository.saveAll(targetSeats);
        recalculateOrderTotals(order);

        List<ShowTimeSeat> heldSeats = showTimeSeatRepository.findAllByOrder_OrderIdAndStatus(
                order.getOrderId(),
                ShowTimeSeatStatus.HELD
        );

        return toHoldSeatResponse(order, heldSeats);
    }

    @Transactional
    public OrderResponse updateOrderCombos(Integer orderId, UpdateOrderCombosRequest request) {
        Order order = ensurePayingOrder(orderId);

        List<OrderCombo> existingRows = orderComboRepository.findAllByOrder_OrderId(orderId);
        Map<Integer, OrderCombo> existingByComboId = new HashMap<>();
        for (OrderCombo row : existingRows) {
            existingByComboId.put(row.getCombo().getComboId(), row);
        }

        Set<Integer> requestedComboIds = new HashSet<>();

        for (OrderComboItemRequest comboItem : request.getCombos()) {
            if (comboItem.getQuantity() == null || comboItem.getQuantity() <= 0) {
                continue;
            }

            Combo combo = comboRepository.findById(comboItem.getComboId())
                    .orElseThrow(() -> new AppException(ErrorCode.COMBO_NOT_FOUND));
            if (combo.getStatus() != ComboStatus.AVAILABLE) {
                throw new AppException(ErrorCode.COMBO_NOT_FOUND);
            }

            requestedComboIds.add(combo.getComboId());
            OrderCombo row = existingByComboId.get(combo.getComboId());
            if (row == null) {
                row = OrderCombo.builder()
                        .order(order)
                        .combo(combo)
                        .quantity(comboItem.getQuantity())
                        .unitPrice(combo.getPrice())
                        .status(OrderComboStatus.ACTIVE)
                        .build();
            } else {
                row.setQuantity(comboItem.getQuantity());
                row.setUnitPrice(combo.getPrice());
                row.setStatus(OrderComboStatus.ACTIVE);
            }
            orderComboRepository.save(row);
        }

        for (OrderCombo existing : existingRows) {
            if (!requestedComboIds.contains(existing.getCombo().getComboId())
                    && existing.getStatus() == OrderComboStatus.ACTIVE) {
                existing.setStatus(OrderComboStatus.CANCELLED);
                orderComboRepository.save(existing);
            }
        }

        recalculateOrderTotals(order);
        return orderMapper.toOrderResponse(order);
    }

    @Transactional
    public OrderResponse cancelOrder(Integer orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));

        if (order.getStatus() == OrderStatus.PAID) {
            throw new AppException(ErrorCode.ORDER_STATUS_INVALID);
        }

        releaseSeats(order, EnumSet.of(ShowTimeSeatStatus.HELD));
        cancelOrderCombos(orderId);
        expirePendingPayments(orderId, PaymentStatus.CANCELLED);

        order.setStatus(OrderStatus.CANCELLED);
        orderRepository.save(order);

        return orderMapper.toOrderResponse(order);
    }

    @Transactional
    public void markOrderPaid(Integer orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));

        if (order.getStatus() == OrderStatus.PAID) {
            return;
        }

        if (order.getStatus() != OrderStatus.PAYING) {
            throw new AppException(ErrorCode.ORDER_STATUS_INVALID);
        }

        List<ShowTimeSeat> heldSeats = showTimeSeatRepository.findAllByOrder_OrderIdAndStatus(orderId, ShowTimeSeatStatus.HELD);
        for (ShowTimeSeat seat : heldSeats) {
            seat.setStatus(ShowTimeSeatStatus.SOLD);
            seat.setHoldExpiresAt(null);
        }
        showTimeSeatRepository.saveAll(heldSeats);

        order.setStatus(OrderStatus.PAID);
        recalculateOrderTotals(order);
    }

    @Transactional
    public void markOrderFailed(Integer orderId, OrderStatus failedStatus) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));

        if (order.getStatus() == OrderStatus.PAID) {
            return;
        }

        releaseSeats(order, EnumSet.of(ShowTimeSeatStatus.HELD));
        cancelOrderCombos(orderId);
        order.setStatus(failedStatus);
        orderRepository.save(order);
    }

    @Transactional
    public List<ShowTimeSeat> getSoldSeatsByOrder(Integer orderId) {
        return showTimeSeatRepository.findAllByOrder_OrderIdAndStatus(orderId, ShowTimeSeatStatus.SOLD);
    }

    @Transactional
    public Order getOrderEntity(Integer orderId) {
        return orderRepository.findById(orderId)
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));
    }

    @Transactional
    @Scheduled(fixedDelay = 30000)
    public void expireStaleOrdersAndReleaseSeats() {
        LocalDateTime now = LocalDateTime.now();

        List<ShowTimeSeat> expiredHeldSeats = showTimeSeatRepository
                .findAllByStatusAndHoldExpiresAtBefore(ShowTimeSeatStatus.HELD, now);

        for (ShowTimeSeat seat : expiredHeldSeats) {
            seat.setStatus(ShowTimeSeatStatus.AVAILABLE);
            seat.setOrder(null);
            seat.setHoldExpiresAt(null);
        }

        if (!expiredHeldSeats.isEmpty()) {
            showTimeSeatRepository.saveAll(expiredHeldSeats);
        }

        List<Order> expiredOrders = orderRepository.findAllByStatusAndExpiredAtBefore(OrderStatus.PAYING, now);
        for (Order expiredOrder : expiredOrders) {
            releaseSeats(expiredOrder, EnumSet.of(ShowTimeSeatStatus.HELD));
            cancelOrderCombos(expiredOrder.getOrderId());
            expirePendingPayments(expiredOrder.getOrderId(), PaymentStatus.EXPIRED);
            expiredOrder.setStatus(OrderStatus.EXPIRED);
            orderRepository.save(expiredOrder);
        }
    }

    @Transactional
    public void releaseReservedSeatsAndCancelTickets(Integer orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));

        releaseSeats(order, EnumSet.of(ShowTimeSeatStatus.HELD, ShowTimeSeatStatus.SOLD));
        cancelActiveTickets(orderId);
    }

    private Order resolveOrderForHold(HoldSeatRequest request, ShowTime showTime) {
        LocalDateTime now = LocalDateTime.now();

        if (request.getOrderId() != null) {
            Order order = ensurePayingOrder(request.getOrderId());
            if (!Objects.equals(order.getShowTime().getShowTimeId(), showTime.getShowTimeId())) {
                throw new AppException(ErrorCode.INVALID_REQUEST);
            }
            return order;
        }

        User user = null;
        if (request.getUserId() != null) {
            user = userRepository.findById(request.getUserId())
                    .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

            Optional<Order> existingOrder = orderRepository
                    .findTopByUser_UserIdAndShowTime_ShowTimeIdAndStatusOrderByOrderIdDesc(
                            request.getUserId(),
                            showTime.getShowTimeId(),
                            OrderStatus.PAYING
                    );

            if (existingOrder.isPresent()) {
                Order order = existingOrder.get();
                if (order.getExpiredAt() != null && order.getExpiredAt().isBefore(now)) {
                    markOrderFailed(order.getOrderId(), OrderStatus.EXPIRED);
                } else {
                    return order;
                }
            }
        }

        return orderRepository.save(Order.builder()
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

    private Order ensurePayingOrder(Integer orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));

        if (order.getStatus() != OrderStatus.PAYING) {
            throw new AppException(ErrorCode.ORDER_STATUS_INVALID);
        }

        if (order.getExpiredAt() != null && order.getExpiredAt().isBefore(LocalDateTime.now())) {
            markOrderFailed(orderId, OrderStatus.EXPIRED);
            throw new AppException(ErrorCode.ORDER_EXPIRED);
        }

        return order;
    }

    private void recalculateOrderTotals(Order order) {
        int roomTypeId = order.getShowTime().getRoom().getRoomType().getRoomTypeId();

        List<ShowTimeSeat> reservedSeats = showTimeSeatRepository.findAllByOrder_OrderId(order.getOrderId());
        Map<Integer, BigDecimal> seatTypePrices = new HashMap<>();
        BigDecimal ticketTotal = BigDecimal.ZERO;
        for (ShowTimeSeat seat : reservedSeats) {
            if (seat.getStatus() != ShowTimeSeatStatus.HELD && seat.getStatus() != ShowTimeSeatStatus.SOLD) {
                continue;
            }
            int seatTypeId = seat.getSeat().getSeatType().getSeatTypeId();
            BigDecimal seatPrice = seatTypePrices.computeIfAbsent(seatTypeId,
                    key -> resolveSeatPrice(roomTypeId, key));
            ticketTotal = ticketTotal.add(seatPrice);
        }

        List<OrderCombo> orderCombos = orderComboRepository.findAllByOrder_OrderId(order.getOrderId());
        BigDecimal comboTotal = orderCombos.stream()
                .filter(item -> item.getStatus() == OrderComboStatus.ACTIVE)
                .map(item -> item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal discountAmount = order.getDiscountAmount() == null ? BigDecimal.ZERO : order.getDiscountAmount();
        BigDecimal totalAmount = ticketTotal.add(comboTotal);
        BigDecimal netAmount = totalAmount.subtract(discountAmount);
        if (netAmount.compareTo(BigDecimal.ZERO) < 0) {
            netAmount = BigDecimal.ZERO;
        }

        order.setTicketTotal(ticketTotal);
        order.setComboTotal(comboTotal);
        order.setTotalAmount(totalAmount);
        order.setNetAmount(netAmount);

        orderRepository.save(order);
    }

    private BigDecimal resolveSeatPrice(int roomTypeId, int seatTypeId) {
        PriceTicket priceTicket = priceTicketRepository
                .findByRoomType_RoomTypeIdAndSeatType_SeatTypeId(roomTypeId, seatTypeId);

        if (priceTicket == null || priceTicket.getStatus() != PriceTicketStatus.ACTIVE) {
            throw new AppException(ErrorCode.PRICE_TICKET_NOT_FOUND);
        }

        return priceTicket.getPrice();
    }

    private void releaseExpiredHoldsForShowTime(Integer showTimeId) {
        LocalDateTime now = LocalDateTime.now();
        List<ShowTimeSeat> expiredSeats = showTimeSeatRepository.findAllByShowTimeIdAndStatus(
                showTimeId,
                ShowTimeSeatStatus.HELD
        ).stream().filter(item -> item.getHoldExpiresAt() != null && item.getHoldExpiresAt().isBefore(now)).toList();

        for (ShowTimeSeat expired : expiredSeats) {
            expired.setStatus(ShowTimeSeatStatus.AVAILABLE);
            expired.setOrder(null);
            expired.setHoldExpiresAt(null);
        }

        if (!expiredSeats.isEmpty()) {
            showTimeSeatRepository.saveAll(expiredSeats);
        }
    }

    private void releaseSeats(Order order, Set<ShowTimeSeatStatus> targetStatuses) {
        List<ShowTimeSeat> reservedSeats = showTimeSeatRepository.findAllByOrder_OrderId(order.getOrderId());
        if (reservedSeats.isEmpty()) {
            return;
        }

        List<ShowTimeSeat> changedSeats = new ArrayList<>();
        for (ShowTimeSeat seat : reservedSeats) {
            if (!targetStatuses.contains(seat.getStatus())) {
                continue;
            }

            seat.setStatus(ShowTimeSeatStatus.AVAILABLE);
            seat.setOrder(null);
            seat.setHoldExpiresAt(null);
            changedSeats.add(seat);
        }

        if (!changedSeats.isEmpty()) {
            showTimeSeatRepository.saveAll(changedSeats);
        }
    }

    private void cancelOrderCombos(Integer orderId) {
        List<OrderCombo> orderCombos = orderComboRepository.findAllByOrder_OrderId(orderId);
        for (OrderCombo orderCombo : orderCombos) {
            if (orderCombo.getStatus() == OrderComboStatus.ACTIVE) {
                orderCombo.setStatus(OrderComboStatus.CANCELLED);
            }
        }
        if (!orderCombos.isEmpty()) {
            orderComboRepository.saveAll(orderCombos);
        }
    }

    private void expirePendingPayments(Integer orderId, PaymentStatus paymentStatus) {
        List<Payment> pendingPayments = paymentRepository.findAllByOrder_OrderIdAndStatus(orderId, PaymentStatus.PENDING);
        for (Payment payment : pendingPayments) {
            payment.setStatus(paymentStatus);
        }
        if (!pendingPayments.isEmpty()) {
            paymentRepository.saveAll(pendingPayments);
        }
    }

    private void cancelActiveTickets(Integer orderId) {
        List<Ticket> tickets = ticketRepository.findAllByOrder_OrderId(orderId);
        if (tickets.isEmpty()) {
            return;
        }

        List<Ticket> changedTickets = new ArrayList<>();
        for (Ticket ticket : tickets) {
            if (ticket.getStatus() != TicketStatus.ACTIVE) {
                continue;
            }
            ticket.setStatus(TicketStatus.CANCELLED);
            changedTickets.add(ticket);
        }

        if (!changedTickets.isEmpty()) {
            ticketRepository.saveAll(changedTickets);
        }
    }

    private HoldSeatResponse toHoldSeatResponse(Order order, List<ShowTimeSeat> heldSeats) {
        return HoldSeatResponse.builder()
                .orderId(order.getOrderId())
                .showTimeId(order.getShowTime().getShowTimeId())
                .expiredAt(order.getExpiredAt())
                .ticketTotal(order.getTicketTotal())
                .comboTotal(order.getComboTotal())
                .discountAmount(order.getDiscountAmount())
                .totalAmount(order.getTotalAmount())
                .netAmount(order.getNetAmount())
                .heldSeats(heldSeats.stream().map(this::toShowTimeSeatResponse).toList())
                .build();
    }

    private ShowTimeSeatResponse toShowTimeSeatResponse(ShowTimeSeat showTimeSeat) {
        return ShowTimeSeatResponse.builder()
                .showTimeSeatId(showTimeSeat.getShowTimeSeatId())
                .showTimeId(showTimeSeat.getShowTime().getShowTimeId())
                .seatId(showTimeSeat.getSeat().getSeatId())
                .seatRow(showTimeSeat.getSeat().getSeatRow())
                .seatColumn(showTimeSeat.getSeat().getSeatColumn())
                .seatTypeId(showTimeSeat.getSeat().getSeatType().getSeatTypeId())
                .seatTypeName(showTimeSeat.getSeat().getSeatType().getSeatTypeName())
                .status(showTimeSeat.getStatus())
                .holdExpiresAt(showTimeSeat.getHoldExpiresAt())
                .orderId(showTimeSeat.getOrder() != null ? showTimeSeat.getOrder().getOrderId() : null)
                .build();
    }
}
