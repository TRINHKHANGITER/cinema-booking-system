package com.dev.cinemasystem.entity;


import com.dev.cinemasystem.enums.SeatStatus;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Entity
@Table(name = "seat")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Seat {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Integer seatId;

    String seatRow;
    Integer seatColumn;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    SeatStatus status;


    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "seat_type_id",nullable = false)
    SeatType seatType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_id",nullable = false)
    Room room;
}


