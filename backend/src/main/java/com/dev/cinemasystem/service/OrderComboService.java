package com.dev.cinemasystem.service;

import com.dev.cinemasystem.entity.OrderCombo;
import com.dev.cinemasystem.enums.ComboDetailStatus;
import com.dev.cinemasystem.repository.OrderComboRepository;
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

    public List<OrderCombo> findAllByOrderId(Integer orderId) {
        return orderComboRepository.findAllByOrder_OrderId(orderId);
    }

    public List<OrderCombo> findAllByOrderIdAndStatus(Integer orderId, ComboDetailStatus status) {
        return orderComboRepository.findAllByOrder_OrderIdAndStatus(orderId, status);
    }

    public boolean existsByComboId(Integer comboId) {
        return orderComboRepository.existsByCombo_ComboId(comboId);
    }

    public List<OrderCombo> saveAll(List<OrderCombo> orderCombos) {
        return orderComboRepository.saveAll(orderCombos);
    }

    public void deleteAllByOrderId(Integer orderId) {
        orderComboRepository.deleteAllByOrder_OrderId(orderId);
    }
}
