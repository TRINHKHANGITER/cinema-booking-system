package com.dev.cinemasystem.service;

import com.dev.cinemasystem.configuration.booking.BookingProperties;
import com.dev.cinemasystem.dto.bookingDTO.OrderComboItemRequest;
import com.dev.cinemasystem.dto.bookingDTO.UpdateOrderCombosRequest;
import com.dev.cinemasystem.dto.orderDTO.OrderResponse;
import com.dev.cinemasystem.dto.showTimeSeatDTO.HoldSeatRequest;
import com.dev.cinemasystem.dto.showTimeSeatDTO.HoldSeatResponse;
import com.dev.cinemasystem.dto.showTimeSeatDTO.ReleaseSeatRequest;
import com.dev.cinemasystem.dto.showTimeSeatDTO.ShowTimeSeatResponse;
import com.dev.cinemasystem.entity.Combo;
import com.dev.cinemasystem.entity.Order;
import com.dev.cinemasystem.entity.OrderCombo;
import com.dev.cinemasystem.entity.Payment;
import com.dev.cinemasystem.entity.PriceTicket;
import com.dev.cinemasystem.entity.Seat;
import com.dev.cinemasystem.entity.ShowTime;
import com.dev.cinemasystem.entity.ShowTimeSeat;
import com.dev.cinemasystem.entity.Ticket;
import com.dev.cinemasystem.entity.User;
import com.dev.cinemasystem.enums.ComboDetailStatus;
import com.dev.cinemasystem.enums.ComboStatus;
import com.dev.cinemasystem.enums.OrderStatus;
import com.dev.cinemasystem.enums.PaymentStatus;
import com.dev.cinemasystem.enums.PriceTicketStatus;
import com.dev.cinemasystem.enums.ShowTimeSeatStatus;
import com.dev.cinemasystem.enums.ShowTimeStatus;
import com.dev.cinemasystem.enums.TicketStatus;
import com.dev.cinemasystem.exception.AppException;
import com.dev.cinemasystem.exception.ErrorCode;
import com.dev.cinemasystem.mapper.OrderMapper;
import com.dev.cinemasystem.repository.ComboRepository;
import com.dev.cinemasystem.repository.OrderComboRepository;
import com.dev.cinemasystem.repository.OrderRepository;
import com.dev.cinemasystem.repository.PaymentRepository;
import com.dev.cinemasystem.repository.PriceTicketRepository;
import com.dev.cinemasystem.repository.ShowTimeRepository;
import com.dev.cinemasystem.repository.ShowTimeSeatRepository;
import com.dev.cinemasystem.repository.TicketRepository;
import com.dev.cinemasystem.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.EnumSet;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

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

        List<Integer> normalizedSeatIds = request.getSeatIds() == null
                ? List.of()
                : request.getSeatIds().stream()
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
                    if (targetSeat.getHoldExpiresAt() == null) {
                        targetSeat.setHoldExpiresAt(holdExpiresAt);
                    }
                    continue;
                }

                boolean isExpiredHold = targetSeat.getHoldExpiresAt() != null && targetSeat.getHoldExpiresAt().isBefore(now);
                if (isExpiredHold) {
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

        List<ShowTimeSeat> heldSeats = showTimeSeatRepository.findAllByOrder_OrderIdAndStatus(
                order.getOrderId(),
                ShowTimeSeatStatus.HELD
        );
        syncTicketsWithHeldSeats(order, heldSeats);
        recalculateOrderTotals(order);

        return toHoldSeatResponse(order, heldSeats);
    }

    @Transactional
    public HoldSeatResponse releaseSeats(ReleaseSeatRequest request) {
        Order order = ensurePayingOrder(request.getOrderId());
        List<Integer> seatIds = request.getSeatIds() == null
                ? List.of()
                : request.getSeatIds().stream().filter(Objects::nonNull).distinct().toList();
        if (seatIds.isEmpty()) {
            throw new AppException(ErrorCode.INVALID_SEAT_SELECTION);
        }

        List<ShowTimeSeat> targetSeats = showTimeSeatRepository.findAllForUpdate(order.getShowTime().getShowTimeId(), seatIds);
        if (targetSeats.size() != seatIds.size()) {
            throw new AppException(ErrorCode.INVALID_SEAT_SELECTION);
        }

        List<ShowTimeSeat> releasedSeats = new ArrayList<>();
        for (ShowTimeSeat seat : targetSeats) {
            if (seat.getStatus() == ShowTimeSeatStatus.HELD
                    && seat.getOrder() != null
                    && Objects.equals(seat.getOrder().getOrderId(), order.getOrderId())) {
                seat.setStatus(ShowTimeSeatStatus.AVAILABLE);
                seat.setOrder(null);
                seat.setHoldExpiresAt(null);
                releasedSeats.add(seat);
            }
        }

        if (!releasedSeats.isEmpty()) {
            showTimeSeatRepository.saveAll(releasedSeats);
            deleteTicketsForSeats(order.getOrderId(), releasedSeats);
        }

        List<ShowTimeSeat> heldSeats = showTimeSeatRepository.findAllByOrder_OrderIdAndStatus(
                order.getOrderId(),
                ShowTimeSeatStatus.HELD
        );
        syncTicketsWithHeldSeats(order, heldSeats);
        recalculateOrderTotals(order);

        return toHoldSeatResponse(order, heldSeats);
    }

    @Transactional
    public OrderResponse updateOrderCombos(Integer orderId, UpdateOrderCombosRequest request) {
        Order order = ensurePayingOrder(orderId);

        Map<Integer, Integer> requestedComboQuantities = new LinkedHashMap<>();
        if (request != null && request.getCombos() != null) {
            for (OrderComboItemRequest comboItem : request.getCombos()) {
                if (comboItem == null || comboItem.getComboId() == null) {
                    continue;
                }
                Integer quantity = comboItem.getQuantity();
                if (quantity == null || quantity <= 0) {
                    continue;
                }
                requestedComboQuantities.put(comboItem.getComboId(), quantity);
            }
        }

        List<OrderCombo> existingRows = orderComboRepository.findAllByOrder_OrderId(orderId);
        Map<Integer, OrderCombo> existingByComboId = new HashMap<>();
        for (OrderCombo row : existingRows) {
            existingByComboId.put(row.getCombo().getComboId(), row);
        }

        List<OrderCombo> rowsToSave = new ArrayList<>();
        for (Map.Entry<Integer, Integer> entry : requestedComboQuantities.entrySet()) {
            Integer comboId = entry.getKey();
            Integer quantity = entry.getValue();

            Combo combo = comboRepository.findById(comboId)
                    .orElseThrow(() -> new AppException(ErrorCode.COMBO_NOT_FOUND));
            if (combo.getStatus() != ComboStatus.AVAILABLE) {
                throw new AppException(ErrorCode.COMBO_NOT_FOUND);
            }

            OrderCombo row = existingByComboId.remove(comboId);
            if (row == null) {
                row = OrderCombo.builder()
                        .order(order)
                        .combo(combo)
                        .quantity(quantity)
                        .unitPrice(combo.getPrice())
                        .status(ComboDetailStatus.ACTIVE)
                        .build();
            } else {
                row.setQuantity(quantity);
                row.setUnitPrice(combo.getPrice());
                row.setStatus(ComboDetailStatus.ACTIVE);
            }
            rowsToSave.add(row);
        }

        if (!rowsToSave.isEmpty()) {
            orderComboRepository.saveAll(rowsToSave);
        }
        if (!existingByComboId.isEmpty()) {
            orderComboRepository.deleteAllInBatch(existingByComboId.values());
        }

        recalculateOrderTotals(order);
        return orderMapper.toOrderResponse(order);
    }

    @Transactional
    public OrderResponse cancelOrder(Integer orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));

        if (order.getStatus() != OrderStatus.PAYING) {
            throw new AppException(ErrorCode.ORDER_STATUS_INVALID);
        }

        releaseSeats(order, EnumSet.of(ShowTimeSeatStatus.HELD));
        deleteOrderTickets(orderId);
        deleteOrderCombos(orderId);
        expirePendingPayments(orderId, PaymentStatus.CANCELLED);

        order.setStatus(OrderStatus.CANCELLED);
        recalculateOrderTotals(order);
        orderRepository.save(order);

        return orderMapper.toOrderResponse(order);
    }

    @Transactional
    public OrderResponse recalculateOrderTotalsForOrder(Integer orderId) {
        Order order = orderRepository.findByIdForUpdate(orderId)
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));
        recalculateOrderTotals(order);
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
        syncTicketsWithHeldSeats(order, heldSeats);

        for (ShowTimeSeat seat : heldSeats) {
            seat.setStatus(ShowTimeSeatStatus.SOLD);
            seat.setHoldExpiresAt(null);
        }
        if (!heldSeats.isEmpty()) {
            showTimeSeatRepository.saveAll(heldSeats);
        }

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

        boolean shouldDeleteOrderLines = failedStatus != OrderStatus.EXPIRED;
        releaseSeats(order, EnumSet.of(ShowTimeSeatStatus.HELD), shouldDeleteOrderLines);
        if (shouldDeleteOrderLines) {
            deleteOrderTickets(orderId);
            deleteOrderCombos(orderId);
        }
        order.setStatus(failedStatus);
        recalculateOrderTotals(order);
        orderRepository.save(order);
    }

    @Transactional
    @Scheduled(fixedDelay = 30000)
    public void expireStaleOrdersAndReleaseSeats() {
        LocalDateTime now = LocalDateTime.now();

        List<ShowTimeSeat> expiredHeldSeats = showTimeSeatRepository
                .findAllByStatusAndHoldExpiresAtBefore(ShowTimeSeatStatus.HELD, now);

        Set<Integer> expiredHeldOrderIds = expiredHeldSeats.stream()
                .filter(seat -> seat.getOrder() != null)
                .map(seat -> seat.getOrder().getOrderId())
                .collect(Collectors.toSet());

        for (ShowTimeSeat seat : expiredHeldSeats) {
            seat.setStatus(ShowTimeSeatStatus.AVAILABLE);
            seat.setOrder(null);
            seat.setHoldExpiresAt(null);
        }

        if (!expiredHeldSeats.isEmpty()) {
            showTimeSeatRepository.saveAll(expiredHeldSeats);
        }

        for (Integer orderId : expiredHeldOrderIds) {
            orderRepository.findById(orderId).ifPresent(this::recalculateOrderTotals);
        }

        List<Order> expiredOrders = orderRepository.findAllByStatusAndExpiredAtBefore(OrderStatus.PAYING, now);
        for (Order expiredOrder : expiredOrders) {
            releaseSeats(expiredOrder, EnumSet.of(ShowTimeSeatStatus.HELD), false);
            expirePendingPayments(expiredOrder.getOrderId(), PaymentStatus.EXPIRED);
            expiredOrder.setStatus(OrderStatus.EXPIRED);
            recalculateOrderTotals(expiredOrder);
            orderRepository.save(expiredOrder);
        }
    }

    @Transactional
    public void releaseReservedSeatsAndCancelTickets(Integer orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));

        releaseSeats(order, EnumSet.of(ShowTimeSeatStatus.HELD, ShowTimeSeatStatus.SOLD));
        deleteOrderTickets(orderId);
        deleteOrderCombos(orderId);
        recalculateOrderTotals(order);
    }

    @Transactional
    public void cancelPaidOrderLinesForOrderStatusChange(Integer orderId) {
        Order order = orderRepository.findByIdForUpdate(orderId)
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));

        if (order.getStatus() != OrderStatus.PAID) {
            throw new AppException(ErrorCode.ORDER_STATUS_INVALID);
        }

        if (isShowTimeStarted(order.getShowTime())) {
            throw new AppException(ErrorCode.ORDER_STATUS_INVALID);
        }

        List<Ticket> tickets = ticketRepository.findAllByOrder_OrderId(orderId);
        List<Ticket> activeTickets = tickets.stream()
                .filter(ticket -> ticket.getStatus() == null || ticket.getStatus() == TicketStatus.ACTIVE)
                .toList();
        if (!activeTickets.isEmpty()) {
            for (Ticket ticket : activeTickets) {
                ticket.setStatus(TicketStatus.CANCELLED);
            }
            ticketRepository.saveAll(activeTickets);
        }

        List<OrderCombo> orderCombos = orderComboRepository.findAllByOrder_OrderId(orderId);
        List<OrderCombo> activeCombos = orderCombos.stream()
                .filter(item -> item.getStatus() == null || item.getStatus() == ComboDetailStatus.ACTIVE)
                .toList();
        if (!activeCombos.isEmpty()) {
            for (OrderCombo item : activeCombos) {
                item.setStatus(ComboDetailStatus.CANCELLED);
            }
            orderComboRepository.saveAll(activeCombos);
        }

        releaseSeats(order, EnumSet.of(ShowTimeSeatStatus.HELD, ShowTimeSeatStatus.SOLD), false);
        recalculateOrderTotals(order);
    }

    public boolean isShowTimeStarted(ShowTime showTime) {
        if (showTime == null || showTime.getReleaseDate() == null || showTime.getStartTime() == null) {
            return true;
        }
        LocalDateTime showTimeStart = LocalDateTime.of(showTime.getReleaseDate(), showTime.getStartTime());
        return !showTimeStart.isAfter(LocalDateTime.now());
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

            var existingOrder = orderRepository
                    .findTopByUser_UserIdAndShowTime_ShowTimeIdAndStatusOrderByOrderIdDesc(
                            request.getUserId(),
                            showTime.getShowTimeId(),
                            OrderStatus.PAYING
                    );

            if (existingOrder.isPresent()) {
                Order order = orderRepository.findByIdForUpdate(existingOrder.get().getOrderId())
                        .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));
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
        Order order = orderRepository.findByIdForUpdate(orderId)
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
        List<Ticket> tickets = ticketRepository.findAllByOrder_OrderId(order.getOrderId());
        BigDecimal ticketTotal = tickets.stream()
                .filter(ticket -> ticket.getStatus() == null || ticket.getStatus() == TicketStatus.ACTIVE)
                .map(ticket -> ticket.getUnitPrice() == null ? BigDecimal.ZERO : ticket.getUnitPrice())
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        List<OrderCombo> orderCombos = orderComboRepository.findAllByOrder_OrderId(order.getOrderId());
        BigDecimal comboTotal = orderCombos.stream()
                .filter(item -> item.getStatus() == null || item.getStatus() == ComboDetailStatus.ACTIVE)
                .map(item -> {
                    BigDecimal unitPrice = item.getUnitPrice() == null ? BigDecimal.ZERO : item.getUnitPrice();
                    int quantity = item.getQuantity() == null ? 0 : item.getQuantity();
                    return unitPrice.multiply(BigDecimal.valueOf(quantity));
                })
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

    private PriceTicket resolveActivePriceTicket(int roomTypeId, int seatTypeId) {
        PriceTicket priceTicket = priceTicketRepository
                .findByRoomType_RoomTypeIdAndSeatType_SeatTypeId(roomTypeId, seatTypeId);

        if (priceTicket == null || priceTicket.getStatus() != PriceTicketStatus.ACTIVE) {
            throw new AppException(ErrorCode.PRICE_TICKET_NOT_FOUND);
        }

        return priceTicket;
    }

    private void releaseExpiredHoldsForShowTime(Integer showTimeId) {
        LocalDateTime now = LocalDateTime.now();
        List<ShowTimeSeat> expiredSeats = showTimeSeatRepository.findAllByShowTimeIdAndStatus(
                showTimeId,
                ShowTimeSeatStatus.HELD
        ).stream().filter(item -> item.getHoldExpiresAt() != null && item.getHoldExpiresAt().isBefore(now)).toList();

        if (expiredSeats.isEmpty()) {
            return;
        }

        Set<Integer> expiredOrderIds = expiredSeats.stream()
                .filter(seat -> seat.getOrder() != null)
                .map(seat -> seat.getOrder().getOrderId())
                .collect(Collectors.toSet());

        for (ShowTimeSeat expired : expiredSeats) {
            expired.setStatus(ShowTimeSeatStatus.AVAILABLE);
            expired.setOrder(null);
            expired.setHoldExpiresAt(null);
        }

        showTimeSeatRepository.saveAll(expiredSeats);

        for (Integer orderId : expiredOrderIds) {
            orderRepository.findById(orderId).ifPresent(this::recalculateOrderTotals);
        }
    }

    private void releaseSeats(Order order, Set<ShowTimeSeatStatus> targetStatuses) {
        releaseSeats(order, targetStatuses, true);
    }

    private void releaseSeats(Order order, Set<ShowTimeSeatStatus> targetStatuses, boolean deleteReleasedSeatTickets) {
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
            if (deleteReleasedSeatTickets) {
                deleteTicketsForSeats(order.getOrderId(), changedSeats);
            }
        }
    }

    private void deleteOrderCombos(Integer orderId) {
        orderComboRepository.deleteAllByOrder_OrderId(orderId);
    }

    private void deleteOrderTickets(Integer orderId) {
        ticketRepository.deleteAllByOrder_OrderId(orderId);
    }

    private void deleteTicketsForSeats(Integer orderId, List<ShowTimeSeat> seats) {
        if (orderId == null || seats == null || seats.isEmpty()) {
            return;
        }

        Set<Integer> seatIds = seats.stream()
                .map(ShowTimeSeat::getSeat)
                .filter(Objects::nonNull)
                .map(Seat::getSeatId)
                .filter(Objects::nonNull)
                .collect(Collectors.toCollection(HashSet::new));

        if (seatIds.isEmpty()) {
            return;
        }

        List<Ticket> existingTickets = ticketRepository.findAllByOrder_OrderId(orderId);
        List<Ticket> staleTickets = existingTickets.stream()
                .filter(ticket -> ticket.getSeat() != null
                        && ticket.getSeat().getSeatId() != null
                        && seatIds.contains(ticket.getSeat().getSeatId()))
                .toList();

        if (!staleTickets.isEmpty()) {
            ticketRepository.deleteAllInBatch(staleTickets);
        }
    }

    private void syncTicketsWithHeldSeats(Order order, List<ShowTimeSeat> heldSeats) {
        List<Ticket> existingTickets = ticketRepository.findAllByOrder_OrderId(order.getOrderId());
        Map<Integer, Ticket> existingBySeatId = new HashMap<>();
        for (Ticket ticket : existingTickets) {
            if (ticket.getSeat() == null || ticket.getSeat().getSeatId() == null) {
                continue;
            }
            existingBySeatId.putIfAbsent(ticket.getSeat().getSeatId(), ticket);
        }

        Map<Integer, ShowTimeSeat> heldBySeatId = new LinkedHashMap<>();
        for (ShowTimeSeat heldSeat : heldSeats) {
            if (heldSeat.getSeat() == null || heldSeat.getSeat().getSeatId() == null) {
                continue;
            }
            heldBySeatId.putIfAbsent(heldSeat.getSeat().getSeatId(), heldSeat);
        }

        Set<Integer> heldSeatIds = heldBySeatId.keySet();
        List<Ticket> staleTickets = existingTickets.stream()
                .filter(ticket -> ticket.getSeat() == null
                        || ticket.getSeat().getSeatId() == null
                        || !heldSeatIds.contains(ticket.getSeat().getSeatId()))
                .toList();
        if (!staleTickets.isEmpty()) {
            ticketRepository.deleteAllInBatch(staleTickets);
        }

        if (heldBySeatId.isEmpty()) {
            return;
        }

        int roomTypeId = order.getShowTime().getRoom().getRoomType().getRoomTypeId();
        List<Ticket> ticketsToSave = new ArrayList<>();
        for (ShowTimeSeat heldSeat : heldBySeatId.values()) {
            Seat seat = heldSeat.getSeat();
            Integer seatId = seat.getSeatId();
            int seatTypeId = seat.getSeatType().getSeatTypeId();
            PriceTicket priceTicket = resolveActivePriceTicket(roomTypeId, seatTypeId);

            Ticket ticket = existingBySeatId.getOrDefault(
                    seatId,
                    Ticket.builder()
                            .order(order)
                            .show(heldSeat.getShowTime())
                            .seat(seat)
                            .build()
            );

            ticket.setOrder(order);
            ticket.setShow(heldSeat.getShowTime());
            ticket.setSeat(seat);
            ticket.setPriceTicket(priceTicket);
            ticket.setUnitPrice(priceTicket.getPrice());
            ticket.setQrCode(buildTicketQr(order.getOrderId(), heldSeat.getShowTime().getShowTimeId(), seatId));
            ticket.setStatus(TicketStatus.ACTIVE);

            ticketsToSave.add(ticket);
        }

        if (!ticketsToSave.isEmpty()) {
            ticketRepository.saveAll(ticketsToSave);
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

    private String buildTicketQr(Integer orderId, Integer showTimeId, Integer seatId) {
        return "QR-" + orderId + "-" + showTimeId + "-" + seatId;
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
