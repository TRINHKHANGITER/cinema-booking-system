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
import com.dev.cinemasystem.dto.orderDTO.OrderStatusUpdateRequest;
import com.dev.cinemasystem.dto.orderDTO.OrderUpdateRequest;
import com.dev.cinemasystem.entity.Order;
import com.dev.cinemasystem.entity.OrderCombo;
import com.dev.cinemasystem.entity.Payment;
import com.dev.cinemasystem.entity.PriceTicket;
import com.dev.cinemasystem.entity.ShowTime;
import com.dev.cinemasystem.entity.ShowTimeSeat;
import com.dev.cinemasystem.entity.Ticket;
import com.dev.cinemasystem.entity.User;
import com.dev.cinemasystem.enums.OrderStatus;
import com.dev.cinemasystem.enums.ShowTimeSeatStatus;
import com.dev.cinemasystem.exception.AppException;
import com.dev.cinemasystem.exception.ErrorCode;
import com.dev.cinemasystem.mapper.OrderMapper;
import com.dev.cinemasystem.mapper.UserMapper;
import com.dev.cinemasystem.repository.OrderComboRepository;
import com.dev.cinemasystem.repository.OrderRepository;
import com.dev.cinemasystem.repository.PaymentRepository;
import com.dev.cinemasystem.repository.PriceTicketRepository;
import com.dev.cinemasystem.repository.ShowTimeRepository;
import com.dev.cinemasystem.repository.ShowTimeSeatRepository;
import com.dev.cinemasystem.repository.TicketRepository;
import com.dev.cinemasystem.repository.UserRepository;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class OrderService {
    OrderRepository orderRepository;
    ShowTimeRepository showTimeRepository;
    UserRepository userRepository;
    ShowTimeSeatRepository showTimeSeatRepository;
    TicketRepository ticketRepository;
    OrderComboRepository orderComboRepository;
    PaymentRepository paymentRepository;
    PriceTicketRepository priceTicketRepository;
    OrderMapper orderMapper;
    UserMapper userMapper;
    BookingProperties bookingProperties;
    SeatInventoryService seatInventoryService;

    @Transactional
    public OrderResponse createOrder(OrderCreationRequest request) {
        if (request == null) {
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }

        ShowTime showTime = showTimeRepository.findById(request.getShowTimeId())
                .orElseThrow(() -> new AppException(ErrorCode.SHOWTIME_NOT_FOUND));
        User user = null;
        if (request.getUserId() != null) {
            user = userRepository.findById(request.getUserId())
                    .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        }

        LocalDateTime now = LocalDateTime.now();
        Order order = Order.builder()
                .user(user)
                .showTime(showTime)
                .ticketTotal(BigDecimal.ZERO)
                .comboTotal(BigDecimal.ZERO)
                .discountAmount(BigDecimal.ZERO)
                .totalAmount(BigDecimal.ZERO)
                .netAmount(BigDecimal.ZERO)
                .expiredAt(now.plusMinutes(bookingProperties.getHoldMinutes()))
                .status(OrderStatus.PAYING)
                .build();

        return orderMapper.toOrderResponse(orderRepository.save(order));
    }

    @Transactional
    public OrderResponse updateOrder(Integer orderId, OrderUpdateRequest request) {
        if (request == null) {
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }

        Order order = orderRepository.findByIdForUpdate(orderId)
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));

        if (request.getTicketTotal() != null) {
            order.setTicketTotal(request.getTicketTotal());
        }
        if (request.getComboTotal() != null) {
            order.setComboTotal(request.getComboTotal());
        }
        if (request.getDiscountAmount() != null) {
            order.setDiscountAmount(request.getDiscountAmount());
        }
        if (request.getTotalAmount() != null) {
            order.setTotalAmount(request.getTotalAmount());
        }
        if (request.getNetAmount() != null) {
            order.setNetAmount(request.getNetAmount());
        }
        if (request.getExpiredAt() != null) {
            order.setExpiredAt(request.getExpiredAt());
        }
        if (request.getStatus() != null) {
            order.setStatus(request.getStatus());
        }

        return orderMapper.toOrderResponse(orderRepository.save(order));
    }

    @Transactional
    public OrderResponse updateOrderStatus(Integer orderId, OrderStatusUpdateRequest request) {
        if (request == null || request.getStatus() == null) {
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }

        OrderStatus targetStatus = request.getStatus();
        if (targetStatus == OrderStatus.CANCELLED) {
            seatInventoryService.cancelOrder(orderId);
            return orderMapper.toOrderResponse(seatInventoryService.getOrder(orderId));
        }
        if (targetStatus == OrderStatus.PAID) {
            seatInventoryService.confirmSold(orderId);
            return orderMapper.toOrderResponse(seatInventoryService.getOrder(orderId));
        }

        Order order = orderRepository.findByIdForUpdate(orderId)
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));
        order.setStatus(targetStatus);
        return orderMapper.toOrderResponse(orderRepository.save(order));
    }

    public OrderResponse getOrderById(Integer orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));
        return orderMapper.toOrderResponse(order);
    }

    public List<OrderResponse> getOrders(OrderStatus status) {
        List<Order> orders = status == null
                ? orderRepository.findAll()
                : orderRepository.findAllByStatus(status);
        return orders.stream()
                .map(orderMapper::toOrderResponse)
                .toList();
    }

    public PagingDto<OrderResponse> filterOrders(
            Integer orderId,
            String customerName,
            String email,
            String phone,
            Integer showTimeId,
            OrderStatus status,
            int page,
            int size
    ) {
        if (page < 1) {
            throw new AppException(ErrorCode.INVALID_PAGE_NUMBER);
        }
        if (size < 1) {
            throw new AppException(ErrorCode.INVALID_PAGE_SIZE);
        }

        Pageable pageable = PageRequest.of(page - 1, size);
        Specification<Order> spec = (root, query, builder) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (orderId != null) {
                predicates.add(builder.equal(root.get("orderId"), orderId));
            }
            if (showTimeId != null) {
                predicates.add(builder.equal(root.get("showTime").get("showTimeId"), showTimeId));
            }
            if (status != null) {
                predicates.add(builder.equal(root.get("status"), status));
            }
            if (customerName != null && !customerName.isBlank()) {
                predicates.add(
                        builder.like(
                                builder.lower(root.join("user", JoinType.LEFT).get("fullName")),
                                "%" + customerName.trim().toLowerCase() + "%"
                        )
                );
            }
            if (email != null && !email.isBlank()) {
                predicates.add(
                        builder.like(
                                builder.lower(root.join("user", JoinType.LEFT).get("email")),
                                "%" + email.trim().toLowerCase() + "%"
                        )
                );
            }
            if (phone != null && !phone.isBlank()) {
                predicates.add(
                        builder.like(
                                builder.lower(root.join("user", JoinType.LEFT).get("phoneNumber")),
                                "%" + phone.trim().toLowerCase() + "%"
                        )
                );
            }

            return builder.and(predicates.toArray(new Predicate[0]));
        };

        Page<Order> result = orderRepository.findAll(spec, pageable);
        List<OrderResponse> items = result.getContent().stream()
                .map(orderMapper::toOrderResponse)
                .toList();

        return PagingDto.<OrderResponse>builder()
                .items(items)
                .totalItems(result.getTotalElements())
                .currentPage(result.getNumber() + 1)
                .pageSize(result.getSize())
                .totalPages(result.getTotalPages())
                .build();
    }

    public List<String> getAllOrderStatuses() {
        return List.of(
                OrderStatus.PAYING.name(),
                OrderStatus.PAID.name(),
                OrderStatus.CANCELLED.name(),
                OrderStatus.REFUNDED.name(),
                OrderStatus.EXPIRED.name()
        );
    }

    public OrderDetailResponse getOrderDetailById(Integer orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));

        Map<Integer, Ticket> ticketBySeatId = new HashMap<>();
        for (Ticket ticket : ticketRepository.findAllByOrder_OrderId(orderId)) {
            ticketBySeatId.put(ticket.getSeat().getSeatId(), ticket);
        }

        List<ShowTimeSeat> orderSeats = showTimeSeatRepository.findAllByOrder_OrderId(orderId).stream()
                .filter(seat -> seat.getStatus() == ShowTimeSeatStatus.HELD || seat.getStatus() == ShowTimeSeatStatus.SOLD)
                .sorted(Comparator
                        .comparing((ShowTimeSeat seat) -> seat.getSeat().getSeatRow())
                        .thenComparing(seat -> seat.getSeat().getSeatColumn()))
                .toList();

        List<OrderSeatDetailResponse> seatDetails = orderSeats.stream()
                .map(seat -> toOrderSeatDetailResponse(order.getShowTime(), seat, ticketBySeatId.get(seat.getSeat().getSeatId())))
                .toList();

        List<OrderComboDetailResponse> comboDetails = orderComboRepository.findAllByOrder_OrderId(orderId).stream()
                .map(this::toOrderComboDetailResponse)
                .toList();

        List<OrderPaymentDetailResponse> paymentDetails = paymentRepository.findAllByOrder_OrderIdOrderByPaymentIdDesc(orderId).stream()
                .map(this::toOrderPaymentDetailResponse)
                .toList();

        Payment latestSuccessPayment = paymentRepository.findAllByOrder_OrderIdOrderByPaymentIdDesc(orderId).stream()
                .filter(payment -> payment.getStatus() == com.dev.cinemasystem.enums.PaymentStatus.SUCCESS)
                .findFirst()
                .orElse(null);

        return OrderDetailResponse.builder()
                .orderId(order.getOrderId())
                .userId(order.getUser() != null ? order.getUser().getUserId() : null)
                .user(order.getUser() != null ? userMapper.toUserResponseFromUser(order.getUser()) : null)
                .status(order.getStatus())
                .ticketTotal(order.getTicketTotal())
                .comboTotal(order.getComboTotal())
                .discountAmount(order.getDiscountAmount())
                .totalAmount(order.getTotalAmount())
                .netAmount(order.getNetAmount())
                .expiredAt(order.getExpiredAt())
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .showTime(toOrderShowTimeDetailResponse(order.getShowTime()))
                .seats(seatDetails)
                .combos(comboDetails)
                .payments(paymentDetails)
                .paidAt(latestSuccessPayment != null ? latestSuccessPayment.getPaidAt() : null)
                .vnpayTransactionId(latestSuccessPayment != null ? latestSuccessPayment.getTransactionId() : null)
                .bankTransactionNo(latestSuccessPayment != null ? latestSuccessPayment.getBankTransactionNo() : null)
                .bankCode(latestSuccessPayment != null ? latestSuccessPayment.getBankCode() : null)
                .build();
    }

    private OrderShowTimeDetailResponse toOrderShowTimeDetailResponse(ShowTime showTime) {
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

    private OrderSeatDetailResponse toOrderSeatDetailResponse(ShowTime showTime, ShowTimeSeat seat, Ticket ticket) {
        BigDecimal seatPrice = ticket != null ? ticket.getUnitPrice() : resolveSeatPrice(showTime, seat.getSeat().getSeatType().getSeatTypeId());
        String seatLabel = seat.getSeat().getSeatRow() + seat.getSeat().getSeatColumn();

        return OrderSeatDetailResponse.builder()
                .ticketId(ticket != null ? ticket.getTicketId() : null)
                .seatId(seat.getSeat().getSeatId())
                .seatRow(seat.getSeat().getSeatRow())
                .seatColumn(seat.getSeat().getSeatColumn())
                .seatLabel(seatLabel)
                .seatTypeId(seat.getSeat().getSeatType().getSeatTypeId())
                .seatTypeName(seat.getSeat().getSeatType().getSeatTypeName())
                .showTimeSeatStatus(seat.getStatus())
                .unitPrice(seatPrice)
                .ticketStatus(ticket != null ? ticket.getStatus() : null)
                .build();
    }

    private BigDecimal resolveSeatPrice(ShowTime showTime, Integer seatTypeId) {
        PriceTicket priceTicket = priceTicketRepository.findByRoomType_RoomTypeIdAndSeatType_SeatTypeId(
                showTime.getRoom().getRoomType().getRoomTypeId(),
                seatTypeId
        );
        return priceTicket != null ? priceTicket.getPrice() : null;
    }

    private OrderComboDetailResponse toOrderComboDetailResponse(OrderCombo combo) {
        BigDecimal lineTotal = combo.getUnitPrice() != null
                ? combo.getUnitPrice().multiply(BigDecimal.valueOf(combo.getQuantity()))
                : combo.getNetAmount();

        return OrderComboDetailResponse.builder()
                .orderComboId(combo.getOrderComboId())
                .comboId(combo.getCombo().getComboId())
                .comboName(combo.getCombo().getComboName())
                .comboImage(combo.getCombo().getImage())
                .quantity(combo.getQuantity())
                .unitPrice(combo.getUnitPrice())
                .lineTotal(lineTotal)
                .status(combo.getStatus())
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
}
