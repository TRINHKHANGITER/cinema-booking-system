package com.dev.cinemasystem.Entity;

import com.dev.cinemasystem.enums.ProductTypeStatus;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Entity
@Table(name = "product_type")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ProductType {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "product_type_id")
    Integer productTypeId;

    @Column(nullable = false, unique = true, length = 100)
    String productTypeName;

    @Column(columnDefinition = "TEXT")
    String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    ProductTypeStatus status;
}


