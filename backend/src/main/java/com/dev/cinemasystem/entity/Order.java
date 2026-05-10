package com.dev.cinemasystem.entity;

import com.dev.cinemasystem.enums.OrderStatus;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "orders")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Order {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Integer orderId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "show_time_id", nullable = false)
    ShowTime showTime;

    @Column(nullable = false, precision = 12, scale = 2)
    BigDecimal ticketTotal;

    @Column(nullable = false, precision = 12, scale = 2)
    BigDecimal comboTotal;

    @Column(nullable = false, precision = 12, scale = 2)
    BigDecimal totalAmount;

    @Column(nullable = false, precision = 12, scale = 2)
    BigDecimal discountAmount;

    @Column(nullable = false, precision = 12, scale = 2)
    BigDecimal netAmount;

    @Column(nullable = false)
    LocalDateTime expiredAt;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    LocalDateTime updatedAt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    OrderStatus status;
}
