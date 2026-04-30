package com.dev.cinemasystem.repository;

import com.dev.cinemasystem.entity.Order;
import com.dev.cinemasystem.enums.OrderStatus;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Integer>, JpaSpecificationExecutor<Order> {
    List<Order> findAllByStatus(OrderStatus status);

    Optional<Order> findTopByUser_UserIdAndShowTime_ShowTimeIdAndStatusOrderByOrderIdDesc(
            Integer userId,
            Integer showTimeId,
            OrderStatus status
    );

    List<Order> findAllByStatusAndExpiredAtBefore(OrderStatus status, LocalDateTime expiredAt);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select o from Order o where o.orderId = :orderId")
    Optional<Order> findByIdForUpdate(@Param("orderId") Integer orderId);
}
