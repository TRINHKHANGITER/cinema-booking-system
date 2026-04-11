package com.dev.cinemasystem.Entity;


import com.dev.cinemasystem.enums.SeatTypeStatus;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Entity
@Table(name = "seat_type")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class SeatType {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "seat_type_id")
    Integer seatTypeId;

    @Column(nullable = false, unique = true)
    String seatTypeName;

    String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    SeatTypeStatus status;

}


