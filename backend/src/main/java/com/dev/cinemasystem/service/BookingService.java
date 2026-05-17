package com.dev.cinemasystem.service;

import com.dev.cinemasystem.dto.bookingDTO.OrderComboItemRequest;
import com.dev.cinemasystem.dto.bookingDTO.UpdateOrderCombosRequest;
import com.dev.cinemasystem.dto.orderDTO.OrderResponse;
import com.dev.cinemasystem.entity.Combo;
import com.dev.cinemasystem.entity.Order;
import com.dev.cinemasystem.entity.OrderCombo;
import com.dev.cinemasystem.enums.ComboDetailStatus;
import com.dev.cinemasystem.enums.ComboStatus;
import com.dev.cinemasystem.enums.OrderStatus;
import com.dev.cinemasystem.exception.AppException;
import com.dev.cinemasystem.exception.ErrorCode;
import com.dev.cinemasystem.mapper.OrderMapper;
import com.dev.cinemasystem.repository.ComboRepository;
import com.dev.cinemasystem.repository.OrderComboRepository;
import com.dev.cinemasystem.repository.OrderRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class BookingService {
    OrderRepository orderRepository;
    OrderComboRepository orderComboRepository;
    ComboRepository comboRepository;
    OrderMapper orderMapper;
    SeatInventoryService seatInventoryService;

    @Transactional
    public OrderResponse updateOrderCombos(Integer orderId, UpdateOrderCombosRequest request) {
        if (request == null || request.getCombos() == null) {
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }

        Order order = orderRepository.findByIdForUpdate(orderId)
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));
        ensurePayingAndNotExpired(order);

        List<OrderCombo> existing = orderComboRepository.findAllByOrder_OrderId(orderId);
        Map<Integer, OrderCombo> existingByComboId = new HashMap<>();
        for (OrderCombo orderCombo : existing) {
            existingByComboId.put(orderCombo.getCombo().getComboId(), orderCombo);
        }

        Set<Integer> requestedComboIds = new HashSet<>();
        List<OrderCombo> changed = new ArrayList<>();

        for (OrderComboItemRequest item : request.getCombos()) {
            Combo combo = comboRepository.findById(item.getComboId())
                    .orElseThrow(() -> new AppException(ErrorCode.COMBO_NOT_FOUND));

            if (item.getQuantity() > 0 && combo.getStatus() != ComboStatus.AVAILABLE) {
                throw new AppException(ErrorCode.COMBO_NOT_FOUND);
            }

            requestedComboIds.add(combo.getComboId());
            OrderCombo orderCombo = existingByComboId.get(combo.getComboId());

            if (item.getQuantity() <= 0) {
                if (orderCombo != null) {
                    orderCombo.setStatus(ComboDetailStatus.CANCELLED);
                    orderCombo.setQuantity(0);
                    orderCombo.setNetAmount(BigDecimal.ZERO);
                    changed.add(orderCombo);
                }
                continue;
            }

            if (orderCombo == null) {
                orderCombo = OrderCombo.builder()
                        .order(order)
                        .combo(combo)
                        .build();
            }

            BigDecimal lineTotal = combo.getPrice().multiply(BigDecimal.valueOf(item.getQuantity()));
            orderCombo.setQuantity(item.getQuantity());
            orderCombo.setUnitPrice(combo.getPrice());
            orderCombo.setNetAmount(lineTotal);
            orderCombo.setStatus(ComboDetailStatus.ACTIVE);
            changed.add(orderCombo);
        }

        for (OrderCombo orderCombo : existing) {
            Integer comboId = orderCombo.getCombo().getComboId();
            if (!requestedComboIds.contains(comboId) && orderCombo.getStatus() == ComboDetailStatus.ACTIVE) {
                orderCombo.setStatus(ComboDetailStatus.CANCELLED);
                orderCombo.setQuantity(0);
                orderCombo.setNetAmount(BigDecimal.ZERO);
                changed.add(orderCombo);
            }
        }

        if (!changed.isEmpty()) {
            orderComboRepository.saveAll(changed);
        }

        Order updatedOrder = seatInventoryService.recalculateOrderTotals(orderId);
        return orderMapper.toOrderResponse(updatedOrder);
    }

    @Transactional
    public OrderResponse cancelOrder(Integer orderId) {
        seatInventoryService.cancelOrder(orderId);
        Order order = seatInventoryService.getOrder(orderId);
        return orderMapper.toOrderResponse(order);
    }

    @Transactional
    public OrderResponse recalculateOrderTotal(Integer orderId) {
        Order order = seatInventoryService.recalculateOrderTotals(orderId);
        return orderMapper.toOrderResponse(order);
    }

    private void ensurePayingAndNotExpired(Order order) {
        if (order.getStatus() != OrderStatus.PAYING) {
            throw new AppException(ErrorCode.ORDER_STATUS_INVALID);
        }

        if (order.getExpiredAt() != null && !order.getExpiredAt().isAfter(LocalDateTime.now())) {
            throw new AppException(ErrorCode.ORDER_EXPIRED);
        }
    }
}
