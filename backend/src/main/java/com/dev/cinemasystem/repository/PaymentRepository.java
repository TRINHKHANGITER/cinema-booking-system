package com.dev.cinemasystem.repository;

import com.dev.cinemasystem.entity.Payment;
import com.dev.cinemasystem.enums.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Integer> {
    Optional<Payment> findByOrder_OrderId(Integer orderId);

    Optional<Payment> findTopByOrder_OrderIdOrderByPaymentIdDesc(Integer orderId);

    Optional<Payment> findTopByOrder_OrderIdAndStatusOrderByPaymentIdDesc(Integer orderId, PaymentStatus status);

    boolean existsPaymentByPaymentId(Integer paymentId);

    List<Payment> findAllByStatus(PaymentStatus status);

    List<Payment> findAllByOrder_OrderIdAndStatus(Integer orderId, PaymentStatus status);

    List<Payment> findAllByOrder_OrderIdOrderByPaymentIdDesc(Integer orderId);
}
