package com.dev.cinemasystem.entity;

import com.dev.cinemasystem.enums.CinemaStatus;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Entity
@Table(name = "cinema")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Cinema {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Integer cinemaId;


    @Column(unique = true)
    String cinemaName;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "province_id", nullable = false)
    Province province;

    @Column(name = "address", length = 300)
    String addressText;


    @Column(length = 1000)
    String description;


    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    CinemaStatus status;
}


