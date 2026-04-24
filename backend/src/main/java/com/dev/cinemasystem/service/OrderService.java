package com.dev.cinemasystem.service;

import com.dev.cinemasystem.configuration.booking.BookingProperties;
import com.dev.cinemasystem.dto.apiDTO.PagingDto;
import com.dev.cinemasystem.dto.orderDTO.OrderComboDetailResponse;
import com.dev.cinemasystem.dto.orderDTO.OrderCreationRequest;
import com.dev.cinemasystem.dto.orderDTO.OrderDetailResponse;
import com.dev.cinemasystem.dto.orderDTO.OrderPaymentDetailResponse;
import com.dev.cinemasystem.dto.orderDTO.OrderResponse;
import com.dev.cinemasystem.dto.orderDTO.OrderSeatDetailResponse;
import com.dev.cinemasystem.dto.orderDTO.OrderShowTimeDetailResponse;
import com.dev.cinemasystem.dto.orderDTO.OrderUpdateRequest;
import com.dev.cinemasystem.entity.Order;
import com.dev.cinemasystem.entity.OrderCombo;
import com.dev.cinemasystem.entity.Payment;
import com.dev.cinemasystem.entity.Seat;
import com.dev.cinemasystem.entity.ShowTime;
import com.dev.cinemasystem.entity.ShowTimeSeat;
import com.dev.cinemasystem.entity.Ticket;
import com.dev.cinemasystem.entity.User;
import com.dev.cinemasystem.enums.OrderComboStatus;
import com.dev.cinemasystem.enums.OrderStatus;
import com.dev.cinemasystem.enums.PaymentStatus;
import com.dev.cinemasystem.exception.AppException;
import com.dev.cinemasystem.exception.ErrorCode;
import com.dev.cinemasystem.mapper.OrderMapper;
import com.dev.cinemasystem.repository.OrderComboRepository;
import com.dev.cinemasystem.repository.OrderRepository;
import com.dev.cinemasystem.repository.PaymentRepository;
import com.dev.cinemasystem.repository.ShowTimeRepository;
import com.dev.cinemasystem.repository.ShowTimeSeatRepository;
import com.dev.cinemasystem.repository.TicketRepository;
import com.dev.cinemasystem.repository.UserRepository;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class OrderService {
    OrderRepository orderRepository;
    OrderMapper orderMapper;
    UserRepository userRepository;
    ShowTimeRepository showTimeRepository;
    OrderComboRepository orderComboRepository;
    ShowTimeSeatRepository showTimeSeatRepository;
    PaymentRepository paymentRepository;
    TicketRepository ticketRepository;
    BookingService bookingService;
    BookingProperties bookingProperties;

    public OrderResponse createOrder(OrderCreationRequest orderCreationRequest) {
        ShowTime showTime = showTimeRepository.findById(orderCreationRequest.getShowTimeId())
                .orElseThrow(() -> new AppException(ErrorCode.MOVIE_NOT_FOUND));

        User user = null;
        if (orderCreationRequest.getUserId() != null) {
            user = userRepository.findById(orderCreationRequest.getUserId())
                    .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        }

        Order order = orderMapper.toOrder(orderCreationRequest);
        order.setUser(user);
        order.setShowTime(showTime);
        order.setTicketTotal(BigDecimal.ZERO);
        order.setComboTotal(BigDecimal.ZERO);
        order.setDiscountAmount(BigDecimal.ZERO);
        order.setTotalAmount(BigDecimal.ZERO);
        order.setNetAmount(BigDecimal.ZERO);
        order.setExpiredAt(LocalDateTime.now().plusMinutes(bookingProperties.getHoldMinutes()));
        order.setStatus(OrderStatus.PAYING);

        return orderMapper.toOrderResponse(orderRepository.save(order));
    }

    public OrderResponse updateOrder(Integer orderId, OrderUpdateRequest orderUpdateRequest) {
        if (orderUpdateRequest == null || orderUpdateRequest.getStatus() == null) {
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }

        return updateStatusOrder(orderId, orderUpdateRequest.getStatus());
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> getOrders(OrderStatus status) {
        var orders = status == null
                ? orderRepository.findAll()
                : orderRepository.findAllByStatus(status);
        return orders.stream().map(orderMapper::toOrderResponse).toList();
    }

    @Transactional(readOnly = true)
    public OrderResponse getOrderById(Integer orderId) {
        return orderMapper.toOrderResponse(orderRepository.findById(orderId)
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND)));
    }

    @Transactional(readOnly = true)
    public PagingDto<OrderResponse> filterOrders(
            String customerName,
            String email,
            String phone,
            Integer showTimeId,
            String status,
            int page,
            int size
    ) {
        validatePageAndSize(page, size);
        if (showTimeId != null && showTimeId < 1) {
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }

        OrderStatus parsedStatus = parseStatusNullable(status);
        Pageable pageable = PageRequest.of(page - 1, size, Sort.by(Sort.Direction.DESC, "createdAt"));

        Specification<Order> specification = (root, query, builder) -> {
            List<Predicate> predicates = new ArrayList<>();
            Join<Order, User> userJoin = root.join("user", JoinType.LEFT);

            if (customerName != null && !customerName.isBlank()) {
                String keyword = "%" + customerName.trim().toLowerCase(Locale.ROOT) + "%";
                predicates.add(builder.like(builder.lower(userJoin.get("fullName")), keyword));
            }

            if (email != null && !email.isBlank()) {
                String keyword = "%" + email.trim().toLowerCase(Locale.ROOT) + "%";
                predicates.add(builder.like(builder.lower(userJoin.get("email")), keyword));
            }

            if (phone != null && !phone.isBlank()) {
                String keyword = "%" + phone.trim() + "%";
                predicates.add(builder.like(userJoin.get("phoneNumber"), keyword));
            }

            if (showTimeId != null) {
                predicates.add(builder.equal(root.get("showTime").get("showTimeId"), showTimeId));
            }

            if (parsedStatus != null) {
                predicates.add(builder.equal(root.get("status"), parsedStatus));
            }

            query.orderBy(builder.desc(root.get("createdAt")), builder.desc(root.get("orderId")));
            return builder.and(predicates.toArray(new Predicate[0]));
        };

        Page<Order> orderPage = orderRepository.findAll(specification, pageable);
        List<OrderResponse> items = orderPage.getContent().stream()
                .map(orderMapper::toOrderResponse)
                .toList();

        return PagingDto.<OrderResponse>builder()
                .items(items)
                .currentPage(orderPage.getNumber() + 1)
                .pageSize(orderPage.getSize())
                .totalItems(orderPage.getTotalElements())
                .totalPages(orderPage.getTotalPages())
                .build();
    }

    @Transactional(readOnly = true)
    public List<String> getAllOrderStatuses() {
        return Arrays.stream(OrderStatus.values()).map(Enum::name).toList();
    }

    @Transactional
    public OrderResponse updateStatusOrder(Integer orderId, OrderStatus status) {
        if (status == null) {
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));

        OrderStatus currentStatus = order.getStatus();
        if (currentStatus == status) {
            return orderMapper.toOrderResponse(order);
        }

        validateStatusTransition(currentStatus, status);

        if (status == OrderStatus.CANCELLED || status == OrderStatus.REFUNDED) {
            bookingService.releaseReservedSeatsAndCancelTickets(orderId);
            cancelOrderCombos(orderId);
            cancelPendingPayments(orderId);
        }

        order.setStatus(status);
        return orderMapper.toOrderResponse(orderRepository.save(order));
    }

    @Transactional(readOnly = true)
    public OrderDetailResponse getOrderDetailById(Integer orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));

        OrderResponse orderResponse = orderMapper.toOrderResponse(order);
        List<OrderCombo> orderCombos = orderComboRepository.findAllByOrder_OrderId(orderId);
        List<ShowTimeSeat> showTimeSeats = showTimeSeatRepository.findAllByOrder_OrderId(orderId);
        List<Ticket> tickets = ticketRepository.findAllByOrder_OrderId(orderId);
        List<Payment> payments = paymentRepository.findAllByOrder_OrderIdOrderByPaymentIdDesc(orderId);

        List<OrderSeatDetailResponse> seatDetails = buildSeatDetails(tickets, showTimeSeats);
        List<OrderComboDetailResponse> comboDetails = orderCombos.stream()
                .map(orderCombo -> OrderComboDetailResponse.builder()
                        .orderComboId(orderCombo.getOrderComboId())
                        .comboId(orderCombo.getCombo().getComboId())
                        .comboName(orderCombo.getCombo().getComboName())
                        .comboImage(orderCombo.getCombo().getImage())
                        .quantity(orderCombo.getQuantity())
                        .unitPrice(orderCombo.getUnitPrice())
                        .lineTotal(orderCombo.getUnitPrice().multiply(BigDecimal.valueOf(orderCombo.getQuantity())))
                        .status(orderCombo.getStatus())
                        .build())
                .toList();

        List<OrderPaymentDetailResponse> paymentDetails = payments.stream()
                .map(this::toOrderPaymentDetailResponse)
                .toList();

        Payment paidPayment = payments.stream()
                .filter(payment -> payment.getStatus() == PaymentStatus.SUCCESS)
                .findFirst()
                .orElse(null);

        return OrderDetailResponse.builder()
                .orderId(orderResponse.getOrderId())
                .userId(orderResponse.getUserId())
                .user(orderResponse.getUser())
                .status(orderResponse.getStatus())
                .ticketTotal(orderResponse.getTicketTotal())
                .comboTotal(orderResponse.getComboTotal())
                .discountAmount(orderResponse.getDiscountAmount())
                .totalAmount(orderResponse.getTotalAmount())
                .netAmount(orderResponse.getNetAmount())
                .expiredAt(orderResponse.getExpiredAt())
                .createdAt(orderResponse.getCreatedAt())
                .updatedAt(orderResponse.getUpdatedAt())
                .showTime(toOrderShowTimeDetail(order.getShowTime()))
                .seats(seatDetails)
                .combos(comboDetails)
                .payments(paymentDetails)
                .paidAt(paidPayment != null ? paidPayment.getPaidAt() : null)
                .vnpayTransactionId(paidPayment != null ? paidPayment.getTransactionId() : null)
                .bankTransactionNo(paidPayment != null ? paidPayment.getBankTransactionNo() : null)
                .bankCode(paidPayment != null ? paidPayment.getBankCode() : null)
                .build();
    }

    private void validateStatusTransition(OrderStatus currentStatus, OrderStatus targetStatus) {
        if (currentStatus == OrderStatus.PAID
                && (targetStatus == OrderStatus.CANCELLED || targetStatus == OrderStatus.REFUNDED)) {
            return;
        }

        if (currentStatus == OrderStatus.CANCELLED && targetStatus == OrderStatus.REFUNDED) {
            return;
        }

        throw new AppException(ErrorCode.ORDER_STATUS_INVALID);
    }

    private void cancelOrderCombos(Integer orderId) {
        List<OrderCombo> orderCombos = orderComboRepository.findAllByOrder_OrderId(orderId);
        if (orderCombos.isEmpty()) {
            return;
        }

        boolean changed = false;
        for (OrderCombo orderCombo : orderCombos) {
            if (orderCombo.getStatus() == OrderComboStatus.ACTIVE) {
                orderCombo.setStatus(OrderComboStatus.CANCELLED);
                changed = true;
            }
        }

        if (changed) {
            orderComboRepository.saveAll(orderCombos);
        }
    }

    private void cancelPendingPayments(Integer orderId) {
        List<Payment> pendingPayments = paymentRepository.findAllByOrder_OrderIdAndStatus(
                orderId,
                PaymentStatus.PENDING
        );
        if (pendingPayments.isEmpty()) {
            return;
        }

        for (Payment payment : pendingPayments) {
            payment.setStatus(PaymentStatus.CANCELLED);
        }
        paymentRepository.saveAll(pendingPayments);
    }

    private List<OrderSeatDetailResponse> buildSeatDetails(
            List<Ticket> tickets,
            List<ShowTimeSeat> showTimeSeats
    ) {
        if (!tickets.isEmpty()) {
            Map<Integer, ShowTimeSeat> showTimeSeatBySeatId = showTimeSeats.stream()
                    .collect(Collectors.toMap(
                            seat -> seat.getSeat().getSeatId(),
                            Function.identity(),
                            (first, second) -> first
                    ));

            return tickets.stream()
                    .sorted(Comparator
                            .comparing((Ticket ticket) -> ticket.getSeat().getSeatRow())
                            .thenComparing(ticket -> ticket.getSeat().getSeatColumn()))
                    .map(ticket -> {
                        Seat seat = ticket.getSeat();
                        ShowTimeSeat showTimeSeat = showTimeSeatBySeatId.get(seat.getSeatId());
                        return OrderSeatDetailResponse.builder()
                                .seatId(seat.getSeatId())
                                .seatRow(seat.getSeatRow())
                                .seatColumn(seat.getSeatColumn())
                                .seatLabel(seat.getSeatRow() + seat.getSeatColumn())
                                .seatTypeId(seat.getSeatType().getSeatTypeId())
                                .seatTypeName(seat.getSeatType().getSeatTypeName())
                                .showTimeSeatStatus(showTimeSeat != null ? showTimeSeat.getStatus() : null)
                                .ticketStatus(ticket.getStatus())
                                .unitPrice(ticket.getUnitPrice())
                                .build();
                    })
                    .toList();
        }

        return showTimeSeats.stream()
                .sorted(Comparator
                        .comparing((ShowTimeSeat item) -> item.getSeat().getSeatRow())
                        .thenComparing(item -> item.getSeat().getSeatColumn()))
                .map(showTimeSeat -> {
                    Seat seat = showTimeSeat.getSeat();
                    return OrderSeatDetailResponse.builder()
                            .seatId(seat.getSeatId())
                            .seatRow(seat.getSeatRow())
                            .seatColumn(seat.getSeatColumn())
                            .seatLabel(seat.getSeatRow() + seat.getSeatColumn())
                            .seatTypeId(seat.getSeatType().getSeatTypeId())
                            .seatTypeName(seat.getSeatType().getSeatTypeName())
                            .showTimeSeatStatus(showTimeSeat.getStatus())
                            .ticketStatus(null)
                            .unitPrice(null)
                            .build();
                })
                .toList();
    }

    private OrderShowTimeDetailResponse toOrderShowTimeDetail(ShowTime showTime) {
        return OrderShowTimeDetailResponse.builder()
                .showTimeId(showTime.getShowTimeId())
                .releaseDate(showTime.getReleaseDate())
                .startTime(showTime.getStartTime())
                .endTime(showTime.getEndTime())
                .movieId(showTime.getMovie().getMovieId())
                .movieName(showTime.getMovie().getMovieName())
                .roomId(showTime.getRoom().getRoomId())
                .roomName(showTime.getRoom().getRoomName())
                .cinemaId(showTime.getRoom().getCinema().getCinemaId())
                .cinemaName(showTime.getRoom().getCinema().getCinemaName())
                .provinceId(showTime.getRoom().getCinema().getProvince().getProvinceId())
                .provinceName(showTime.getRoom().getCinema().getProvince().getProvinceName())
                .build();
    }

    private OrderPaymentDetailResponse toOrderPaymentDetailResponse(Payment payment) {
        return OrderPaymentDetailResponse.builder()
                .paymentId(payment.getPaymentId())
                .amount(payment.getAmount())
                .method(payment.getMethod())
                .bankCode(payment.getBankCode())
                .bankTransactionNo(payment.getBankTransactionNo())
                .transactionId(payment.getTransactionId())
                .infoTransaction(payment.getInfoTransaction())
                .paidAt(payment.getPaidAt())
                .createdAt(payment.getCreatedAt())
                .updatedAt(payment.getUpdatedAt())
                .status(payment.getStatus())
                .build();
    }

    private OrderStatus parseStatusNullable(String status) {
        if (status == null || status.isBlank()) {
            return null;
        }

        try {
            return OrderStatus.valueOf(status.trim().toUpperCase(Locale.ROOT));
        } catch (Exception ex) {
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }
    }

    private void validatePageAndSize(int page, int size) {
        if (page < 1) {
            throw new AppException(ErrorCode.INVALID_PAGE_NUMBER);
        }
        if (size < 1 || size > 100) {
            throw new AppException(ErrorCode.INVALID_PAGE_SIZE);
        }
    }
}
