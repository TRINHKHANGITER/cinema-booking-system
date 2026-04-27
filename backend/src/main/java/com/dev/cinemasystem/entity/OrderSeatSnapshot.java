package com.dev.cinemasystem.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(
        name = "order_seat_snapshot",
        uniqueConstraints = @UniqueConstraint(
                name = "uq_order_seat_snapshot",
                columnNames = {"order_id", "seat_id"}
        )
)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class OrderSeatSnapshot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Integer orderSeatSnapshotId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    Order order;

    @Column(nullable = false)
    Integer seatId;

    @Column(nullable = false)
    String seatRow;

    @Column(nullable = false)
    Integer seatColumn;

    @Column(nullable = false)
    String seatLabel;

    @Column(nullable = false)
    Integer seatTypeId;

    @Column(nullable = false)
    String seatTypeName;

    @Column(precision = 12, scale = 2)
    BigDecimal unitPrice;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    LocalDateTime updatedAt;
}

