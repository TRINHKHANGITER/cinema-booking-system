package com.dev.cinemasystem.service;

import com.dev.cinemasystem.dto.orderDTO.OrderCreationRequest;
import com.dev.cinemasystem.dto.orderDTO.OrderResponse;
import com.dev.cinemasystem.dto.orderDTO.OrderUpdateRequest;
import com.dev.cinemasystem.entity.Order;
import com.dev.cinemasystem.entity.ShowTime;
import com.dev.cinemasystem.entity.User;
import com.dev.cinemasystem.enums.OrderStatus;
import com.dev.cinemasystem.exception.AppException;
import com.dev.cinemasystem.exception.ErrorCode;
import com.dev.cinemasystem.mapper.OrderMapper;
import com.dev.cinemasystem.repository.OrderRepository;
import com.dev.cinemasystem.repository.ShowTimeRepository;
import com.dev.cinemasystem.repository.UserRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class OrderService {
    OrderRepository orderRepository;
    OrderMapper orderMapper;
    UserRepository userRepository;
    ShowTimeRepository showTimeRepository;

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
        order.setExpiredAt(LocalDateTime.now().plusMinutes(5));
        order.setStatus(OrderStatus.PAYING);

        return orderMapper.toOrderResponse(orderRepository.save(order));
    }

    public OrderResponse updateOrder(Integer orderId, OrderUpdateRequest orderUpdateRequest) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));

        orderMapper.updateOrder(order, orderUpdateRequest);

        return orderMapper.toOrderResponse(orderRepository.save(order));
    }

    public List<OrderResponse> getOrders(OrderStatus status) {
        var orders = status == null
                ? orderRepository.findAll()
                : orderRepository.findAllByStatus(status);
        return orders.stream().map(orderMapper::toOrderResponse).toList();
    }

    public OrderResponse getOrderById(Integer orderId) {
        return orderMapper.toOrderResponse(orderRepository.findById(orderId)
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND)));
    }

    public void updateStatusOrder(Integer orderId, OrderStatus status) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));
        order.setStatus(status);
        orderRepository.save(order);
    }
}
