package com.dev.cinemasystem.service;

import com.dev.cinemasystem.dto.orderCombo.OrderComboCreationRequest;
import com.dev.cinemasystem.dto.orderCombo.OrderComboResponse;
import com.dev.cinemasystem.entity.Combo;
import com.dev.cinemasystem.entity.Order;
import com.dev.cinemasystem.entity.OrderCombo;
import com.dev.cinemasystem.entity.User;
import com.dev.cinemasystem.enums.ComboDetailStatus;
import com.dev.cinemasystem.enums.ComboStatus;
import com.dev.cinemasystem.enums.OrderStatus;
import com.dev.cinemasystem.enums.Role;
import com.dev.cinemasystem.exception.AppException;
import com.dev.cinemasystem.exception.ErrorCode;
import com.dev.cinemasystem.mapper.OrderComboMapper;
import com.dev.cinemasystem.repository.ComboRepository;
import com.dev.cinemasystem.repository.OrderComboRepository;
import com.dev.cinemasystem.repository.OrderRepository;
import com.dev.cinemasystem.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class OrderComboService {
    OrderComboRepository orderComboRepository;
    OrderComboMapper orderComboMapper;
    OrderRepository orderRepository;
    ComboRepository comboRepository;
    UserRepository userRepository;
    BookingService bookingService;

    public OrderComboResponse createOrderCombo(OrderComboCreationRequest orderComboCreationRequest) {
        Order order = orderRepository.findById(orderComboCreationRequest.getOrderId())
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));

        Combo combo = comboRepository.findById(orderComboCreationRequest.getComboId())
                .orElseThrow(() -> new AppException(ErrorCode.COMBO_NOT_FOUND));
        if (combo.getStatus() != ComboStatus.AVAILABLE) {
            throw new AppException(ErrorCode.COMBO_NOT_FOUND);
        }

        OrderCombo orderCombo = orderComboMapper.toOrderCombo(orderComboCreationRequest);
        orderCombo.setOrder(order);
        orderCombo.setCombo(combo);
        orderCombo.setUnitPrice(combo.getPrice());
        orderCombo.setNetAmount(combo.getPrice());
        orderCombo.setStatus(ComboDetailStatus.ACTIVE);

        return orderComboMapper.toComboResponse(orderComboRepository.save(orderCombo));
    }

    public OrderComboResponse getOderComboById(int orderComboId) {
        OrderCombo orderCombo = orderComboRepository.findById(orderComboId)
                .orElseThrow(() -> new AppException(ErrorCode.INVALID_REQUEST));

        return orderComboMapper.toComboResponse(orderCombo);
    }

    public List<OrderComboResponse> getOrdersCombo() {
        return orderComboRepository.findAll().stream().map(orderComboMapper::toComboResponse).toList();
    }

    @Transactional
    public OrderComboResponse updateOrderComboStatus(Integer orderComboId, ComboDetailStatus status) {
        ensureCurrentUserIsAdmin();

        if (status == null) {
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }

        OrderCombo orderCombo = orderComboRepository.findById(orderComboId)
                .orElseThrow(() -> new AppException(ErrorCode.INVALID_REQUEST));

        Order order = orderCombo.getOrder();
        if (order == null || order.getStatus() != OrderStatus.PAID) {
            throw new AppException(ErrorCode.ORDER_STATUS_INVALID);
        }

        if (bookingService.isShowTimeStarted(order.getShowTime())) {
            throw new AppException(ErrorCode.ORDER_STATUS_INVALID);
        }

        ComboDetailStatus currentStatus = orderCombo.getStatus() == null
                ? ComboDetailStatus.ACTIVE
                : orderCombo.getStatus();
        if (currentStatus == status) {
            return orderComboMapper.toComboResponse(orderCombo);
        }

        if (status != ComboDetailStatus.CANCELLED && status != ComboDetailStatus.ACTIVE) {
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }

        orderCombo.setStatus(status);
        OrderCombo savedOrderCombo = orderComboRepository.save(orderCombo);
        bookingService.recalculateOrderTotalsForOrder(order.getOrderId());
        return orderComboMapper.toComboResponse(savedOrderCombo);
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
}
