package com.dev.cinemasystem.Entity;


import com.dev.cinemasystem.enums.Status;
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
    Status status;


    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "seat_type_id",nullable = false)
    SeatType seatType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_id",nullable = false)
    Room room;
}
