package com.dev.cinemasystem.entity;

import com.dev.cinemasystem.enums.ProvinceStatus;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Entity
@Table(name = "province")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Province {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Integer provinceId;

    @Column(nullable = false, unique = true, length = 100)
    String provinceName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    ProvinceStatus status;
}


