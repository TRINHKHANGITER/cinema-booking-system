package com.dev.cinemasystem.Entity;

import com.dev.cinemasystem.enums.Status;
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
public class Orders {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Integer orderId;

    @Column(nullable = false, unique = true, length = 50)
    String orderCode;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    User user;

    @Column(nullable = false, precision = 12, scale = 2)
    BigDecimal ticketTotal;

    @Column(nullable = false, precision = 12, scale = 2)
    BigDecimal comboTotal;

    @Column(nullable = false, precision = 12, scale = 2)
    BigDecimal discountAmount;

    @Column(nullable = false, precision = 12, scale = 2)
    BigDecimal totalAmount;

    LocalDateTime holdExpiresAt;

    @Column(length = 500)
    String note;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    LocalDateTime updatedAt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    Status status;
}
