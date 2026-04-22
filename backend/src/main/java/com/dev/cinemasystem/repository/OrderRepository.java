package com.dev.cinemasystem.repository;

import com.dev.cinemasystem.entity.Order;
import com.dev.cinemasystem.enums.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Integer> {
    List<Order> findAllByStatus(OrderStatus status);

    Optional<Order> findTopByUser_UserIdAndShowTime_ShowTimeIdAndStatusOrderByOrderIdDesc(
            Integer userId,
            Integer showTimeId,
            OrderStatus status
    );

    List<Order> findAllByStatusAndExpiredAtBefore(OrderStatus status, LocalDateTime expiredAt);
}
