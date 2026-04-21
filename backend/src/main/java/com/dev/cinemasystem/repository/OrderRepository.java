package com.dev.cinemasystem.repository;

import com.dev.cinemasystem.entity.Order;
import com.dev.cinemasystem.enums.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Integer> {
    List<Order> findAllByStatus(OrderStatus status);

}
