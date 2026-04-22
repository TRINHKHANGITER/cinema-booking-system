package com.dev.cinemasystem.repository;

import com.dev.cinemasystem.entity.OrderCombo;
import com.dev.cinemasystem.enums.OrderComboStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrderComboRepository extends JpaRepository<OrderCombo, Integer> {
    List<OrderCombo> findAllByStatus(OrderComboStatus status);

    List<OrderCombo> findAllByOrder_OrderId(Integer orderId);

    Optional<OrderCombo> findByOrder_OrderIdAndCombo_ComboId(Integer orderId, Integer comboId);
}
