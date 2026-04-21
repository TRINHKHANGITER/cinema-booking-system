package com.dev.cinemasystem.service;


import com.dev.cinemasystem.dto.orderCombo.OrderComboCreationRequest;
import com.dev.cinemasystem.dto.orderCombo.OrderComboResponse;
import com.dev.cinemasystem.entity.OrderCombo;
import com.dev.cinemasystem.mapper.OrderComboMapper;
import com.dev.cinemasystem.repository.OrderComboRepository;
import com.dev.cinemasystem.enums.OrderComboStatus;
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

    public OrderComboResponse createOrderCombo(OrderComboCreationRequest orderComboCreationRequest) {
        OrderCombo orderCombo = orderComboMapper.toOrderCombo(orderComboCreationRequest);

        return orderComboMapper.toComboResponse(orderCombo);
    }

    public OrderComboResponse getOderComboById(int orderComboId) {
        OrderCombo orderCombo = orderComboRepository.findById(orderComboId)
                .orElseThrow(() -> new RuntimeException("orderCombo not exists!"));

        return orderComboMapper.toComboResponse(orderCombo);
    }

    public List<OrderComboResponse> getOrdersCombo(OrderComboStatus status) {
        var ordersCombo = status == null
                ? orderComboRepository.findAll()
                : orderComboRepository.findAllByStatus(status);

        return ordersCombo.stream().map(combo -> orderComboMapper.toComboResponse(combo)).toList();
    }

}
