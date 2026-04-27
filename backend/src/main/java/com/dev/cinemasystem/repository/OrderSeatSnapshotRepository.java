package com.dev.cinemasystem.repository;

import com.dev.cinemasystem.entity.OrderSeatSnapshot;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OrderSeatSnapshotRepository extends JpaRepository<OrderSeatSnapshot, Integer> {
    List<OrderSeatSnapshot> findAllByOrder_OrderIdOrderBySeatRowAscSeatColumnAsc(Integer orderId);

    void deleteByOrder_OrderId(Integer orderId);
}

