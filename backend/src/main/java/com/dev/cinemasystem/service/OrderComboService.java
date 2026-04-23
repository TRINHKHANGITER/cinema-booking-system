package com.dev.cinemasystem.service;

import com.dev.cinemasystem.dto.orderCombo.OrderComboCreationRequest;
import com.dev.cinemasystem.dto.orderCombo.OrderComboResponse;
import com.dev.cinemasystem.entity.Combo;
import com.dev.cinemasystem.entity.Order;
import com.dev.cinemasystem.entity.OrderCombo;
import com.dev.cinemasystem.enums.ComboStatus;
import com.dev.cinemasystem.enums.OrderComboStatus;
import com.dev.cinemasystem.exception.AppException;
import com.dev.cinemasystem.exception.ErrorCode;
import com.dev.cinemasystem.mapper.OrderComboMapper;
import com.dev.cinemasystem.repository.ComboRepository;
import com.dev.cinemasystem.repository.OrderComboRepository;
import com.dev.cinemasystem.repository.OrderRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
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
        orderCombo.setStatus(OrderComboStatus.ACTIVE);

        return orderComboMapper.toComboResponse(orderComboRepository.save(orderCombo));
    }

    public OrderComboResponse getOderComboById(int orderComboId) {
        OrderCombo orderCombo = orderComboRepository.findById(orderComboId)
                .orElseThrow(() -> new AppException(ErrorCode.INVALID_REQUEST));

        return orderComboMapper.toComboResponse(orderCombo);
    }

    public List<OrderComboResponse> getOrdersCombo(OrderComboStatus status) {
        var ordersCombo = status == null
                ? orderComboRepository.findAll()
                : orderComboRepository.findAllByStatus(status);

        return ordersCombo.stream().map(orderComboMapper::toComboResponse).toList();
    }
}
