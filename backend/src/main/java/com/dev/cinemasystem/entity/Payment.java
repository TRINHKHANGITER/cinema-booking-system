package com.dev.cinemasystem.entity;

import com.dev.cinemasystem.enums.PaymentStatus;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "payment")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Integer paymentId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    Order order;

    @Column(nullable = false, precision = 12, scale = 2)
    BigDecimal amount;

    String method;

    String bankCode;

    String bankTransactionNo;

    @Column(length = 200, unique = true)
    String transactionId;

    String infoTransaction;

    LocalDateTime paidAt;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    LocalDateTime updatedAt;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    PaymentStatus status = PaymentStatus.PENDING;
}
