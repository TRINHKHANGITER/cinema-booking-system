package com.dev.cinemasystem.entity;

import com.dev.cinemasystem.enums.ComboStatus;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;

@Entity
@Table(name = "combo")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Combo {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Integer comboId;

    @Column(nullable = false, length = 200)
    String comboName;

    @Column(length = 500)
    String image;

    @Column(columnDefinition = "TEXT")
    String description;

    @Column(nullable = false, precision = 12, scale = 2)
    BigDecimal price;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    ComboStatus status;
}


