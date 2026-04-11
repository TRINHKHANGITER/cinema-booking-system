package com.dev.cinemasystem.Entity;

import com.dev.cinemasystem.enums.OrderComboStatus;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;

@Entity
@Table(name = "order_combo")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class OrderCombo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Integer orderComboId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    Orders order;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "combo_id", nullable = false)
    Combo combo;

    @Column(nullable = false)
    Integer quantity;

    @Column(nullable = false, precision = 12, scale = 2)
    BigDecimal unitPrice;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    OrderComboStatus status;
}


