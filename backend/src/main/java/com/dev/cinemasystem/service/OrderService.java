package com.dev.cinemasystem.service;

import com.dev.cinemasystem.configuration.booking.BookingProperties;
import com.dev.cinemasystem.dto.apiDTO.PagingDto;
import com.dev.cinemasystem.dto.dashboardDTO.CinemaRevenueResponse;
import com.dev.cinemasystem.dto.dashboardDTO.ComboRevenueResponse;
import com.dev.cinemasystem.dto.dashboardDTO.MovieRevenueResponse;
import com.dev.cinemasystem.dto.dashboardDTO.MovieTypeRevenueResponse;
import com.dev.cinemasystem.dto.dashboardDTO.OrderStatisticItemResponse;
import com.dev.cinemasystem.dto.orderDTO.OrderComboDetailResponse;
import com.dev.cinemasystem.dto.orderDTO.OrderCreationRequest;
import com.dev.cinemasystem.dto.orderDTO.OrderDetailResponse;
import com.dev.cinemasystem.dto.orderDTO.OrderPaymentDetailResponse;
import com.dev.cinemasystem.dto.orderDTO.OrderResponse;
import com.dev.cinemasystem.dto.orderDTO.OrderSeatDetailResponse;
import com.dev.cinemasystem.dto.orderDTO.OrderStatusUpdateRequest;
import com.dev.cinemasystem.dto.orderDTO.OrderUpdateRequest;
import com.dev.cinemasystem.entity.Order;
import com.dev.cinemasystem.entity.Payment;
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
import com.dev.cinemasystem.mapper.OrderDetailMapper;
import com.dev.cinemasystem.mapper.OrderMapper;
import com.dev.cinemasystem.mapper.UserMapper;
import com.dev.cinemasystem.repository.OrderRepository;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.beans.factory.ObjectProvider;
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
import java.util.Optional;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class OrderService {
    OrderRepository orderRepository;
    ShowTimeService showTimeService;
    UserService userService;
    ShowTimeSeatService showTimeSeatService;
    TicketService ticketService;
    OrderComboService orderComboService;
    ObjectProvider<PaymentService> paymentServiceProvider;
    PriceTicketService priceTicketService;
    OrderMapper orderMapper;
    OrderDetailMapper orderDetailMapper;
    UserMapper userMapper;
    BookingProperties bookingProperties;
    ObjectProvider<SeatInventoryService> seatInventoryServiceProvider;

    @Transactional
    public OrderResponse createOrder(OrderCreationRequest request) {
        if (request == null) {
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }

        ShowTime showTime = showTimeService.getShowTimeEntityById(request.getShowTimeId());
        User user = request.getUserId() != null ? userService.getUserEntityById(request.getUserId()) : null;

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

        Order order = getOrderEntityByIdForUpdate(orderId);

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
            seatInventoryServiceProvider.getObject().cancelOrder(orderId);
            return orderMapper.toOrderResponse(seatInventoryServiceProvider.getObject().getOrder(orderId));
        }
        if (targetStatus == OrderStatus.PAID) {
            seatInventoryServiceProvider.getObject().confirmSold(orderId);
            return orderMapper.toOrderResponse(seatInventoryServiceProvider.getObject().getOrder(orderId));
        }

        Order order = getOrderEntityByIdForUpdate(orderId);
        order.setStatus(targetStatus);
        return orderMapper.toOrderResponse(orderRepository.save(order));
    }

    public OrderResponse getOrderById(Integer orderId) {
        return orderMapper.toOrderResponse(getOrderEntityById(orderId));
    }

    public List<OrderResponse> getOrders(OrderStatus status) {
        List<Order> orders = status == null ? orderRepository.findAll() : orderRepository.findAllByStatus(status);
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
        Order order = getOrderEntityById(orderId);

        Map<Integer, Ticket> ticketBySeatId = new HashMap<>();
        for (Ticket ticket : ticketService.findAllByOrderId(orderId)) {
            ticketBySeatId.put(ticket.getSeat().getSeatId(), ticket);
        }

        List<ShowTimeSeat> orderSeats = showTimeSeatService.findAllByOrderId(orderId).stream()
                .filter(seat -> seat.getStatus() == ShowTimeSeatStatus.HELD || seat.getStatus() == ShowTimeSeatStatus.SOLD)
                .sorted(Comparator
                        .comparing((ShowTimeSeat seat) -> seat.getSeat().getSeatRow())
                        .thenComparing(seat -> seat.getSeat().getSeatColumn()))
                .toList();

        List<OrderSeatDetailResponse> seatDetails = orderSeats.stream()
                .map(seat -> {
                    Ticket ticket = ticketBySeatId.get(seat.getSeat().getSeatId());
                    BigDecimal seatPrice = ticket != null
                            ? ticket.getUnitPrice()
                            : resolveSeatPrice(order.getShowTime(), seat.getSeat().getSeatType().getSeatTypeId());
                    return orderDetailMapper.mapSeatDetail(seat, ticket, seatPrice);
                })
                .toList();

        List<OrderComboDetailResponse> comboDetails = orderComboService.findAllByOrderId(orderId).stream()
                .map(orderDetailMapper::mapComboDetail)
                .toList();

        List<Payment> payments = paymentServiceProvider.getObject().getPaymentsByOrderIdDesc(orderId);
        List<OrderPaymentDetailResponse> paymentDetails = payments.stream()
                .map(orderDetailMapper::mapPaymentDetail)
                .toList();

        Payment latestSuccessPayment = payments.stream()
                .filter(payment -> payment.getStatus() == PaymentStatus.SUCCESS)
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
                .showTime(orderDetailMapper.mapShowTimeDetail(order.getShowTime()))
                .seats(seatDetails)
                .combos(comboDetails)
                .payments(paymentDetails)
                .paidAt(latestSuccessPayment != null ? latestSuccessPayment.getPaidAt() : null)
                .vnpayTransactionId(latestSuccessPayment != null ? latestSuccessPayment.getTransactionId() : null)
                .bankTransactionNo(latestSuccessPayment != null ? latestSuccessPayment.getBankTransactionNo() : null)
                .bankCode(latestSuccessPayment != null ? latestSuccessPayment.getBankCode() : null)
                .build();
    }

    public Order getOrderEntityById(Integer orderId) {
        return orderRepository.findById(orderId)
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));
    }

    public Order getOrderEntityByIdForUpdate(Integer orderId) {
        return orderRepository.findByIdForUpdate(orderId)
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));
    }

    public Order saveOrder(Order order) {
        return orderRepository.save(order);
    }

    public Optional<Order> findLatestPayingOrder(Integer userId, Integer showTimeId) {
        return orderRepository.findTopByUser_UserIdAndShowTime_ShowTimeIdAndStatusOrderByOrderIdDesc(
                userId,
                showTimeId,
                OrderStatus.PAYING
        );
    }

    public BigDecimal sumPaidTotalAmountByCreatedAtRange(OrderStatus status, LocalDateTime startAt, LocalDateTime endAt) {
        return orderRepository.sumPaidTotalAmountByCreatedAtRange(status, startAt, endAt);
    }

    public Long countOrdersByCreatedAtRange(LocalDateTime startAt, LocalDateTime endAt) {
        return orderRepository.countOrdersByCreatedAtRange(startAt, endAt);
    }

    public List<CinemaRevenueResponse> findRevenueByCinema(
            OrderStatus status,
            LocalDateTime startAt,
            LocalDateTime endAt,
            Integer provinceId,
            Integer cinemaId
    ) {
        return orderRepository.findRevenueByCinema(status, startAt, endAt, provinceId, cinemaId);
    }

    public List<MovieRevenueResponse> findRevenueByMovie(
            OrderStatus status,
            LocalDateTime startAt,
            LocalDateTime endAt,
            Integer movieId
    ) {
        return orderRepository.findRevenueByMovie(status, startAt, endAt, movieId);
    }

    public List<MovieTypeRevenueResponse> findRevenueByMovieType(
            OrderStatus status,
            LocalDateTime startAt,
            LocalDateTime endAt,
            Integer categoryId
    ) {
        return orderRepository.findRevenueByMovieType(status, startAt, endAt, categoryId);
    }

    public List<ComboRevenueResponse> findRevenueByCombo(
            OrderStatus orderStatus,
            ComboDetailStatus comboDetailStatus,
            LocalDateTime startAt,
            LocalDateTime endAt,
            Integer comboId
    ) {
        return orderRepository.findRevenueByCombo(orderStatus, comboDetailStatus, startAt, endAt, comboId);
    }

    public Page<OrderStatisticItemResponse> findOrderStatistics(
            LocalDateTime startAt,
            LocalDateTime endAt,
            OrderStatus status,
            TicketStatus ticketStatus,
            Pageable pageable
    ) {
        return orderRepository.findOrderStatistics(startAt, endAt, status, ticketStatus, pageable);
    }

    public BigDecimal sumTotalAmountByCreatedAtRangeAndStatus(
            LocalDateTime startAt,
            LocalDateTime endAt,
            OrderStatus status
    ) {
        return orderRepository.sumTotalAmountByCreatedAtRangeAndStatus(startAt, endAt, status);
    }

    private BigDecimal resolveSeatPrice(ShowTime showTime, Integer seatTypeId) {
        PriceTicket priceTicket = priceTicketService.findByRoomTypeIdAndSeatTypeId(
                showTime.getRoom().getRoomType().getRoomTypeId(),
                seatTypeId
        );
        return priceTicket != null ? priceTicket.getPrice() : null;
    }
}
