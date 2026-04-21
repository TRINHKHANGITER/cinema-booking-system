package com.dev.cinemasystem.service;

import com.dev.cinemasystem.dto.orderDTO.OrderCreationRequest;
import com.dev.cinemasystem.dto.orderDTO.OrderResponse;
import com.dev.cinemasystem.dto.orderDTO.OrderUpdateRequest;
import com.dev.cinemasystem.entity.Order;
import com.dev.cinemasystem.entity.User;
import com.dev.cinemasystem.mapper.OrderMapper;
import com.dev.cinemasystem.repository.OrderRepository;
import com.dev.cinemasystem.configuration.payment.VnPayConfig;
import com.dev.cinemasystem.enums.OrderStatus;
import com.dev.cinemasystem.enums.PaymentStatus;
import com.dev.cinemasystem.repository.UserRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;

import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class OrderService {
    final OrderRepository orderRepository;
    final OrderMapper orderMapper;
    final UserRepository userRepository;

    public OrderResponse createOrder(OrderCreationRequest orderCreationRequest) {
        User user = userRepository.findById(orderCreationRequest.getUserId())
                .orElseThrow(() -> new RuntimeException("User not exists!"));

        Order order = orderMapper.toOrder(orderCreationRequest);
        order.setUser(user);
        return orderMapper.toOrderResponse(orderRepository.save(order));
    }

    public OrderResponse updateOrder(Integer orderId, OrderUpdateRequest orderUpdateRequest) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not exists!"));

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
                .orElseThrow(() -> new RuntimeException("Order not found!")));
    }

    public void updateStatusOrder(Integer orderId, OrderStatus status) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not exists!"));
        order.setStatus(status);
        orderRepository.save(order);
    }

}
