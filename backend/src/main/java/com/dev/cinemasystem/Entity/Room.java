package com.dev.cinemasystem.Entity;


import com.dev.cinemasystem.enums.RoomStatus;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Entity
@Table(name = "room")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Room {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
            Integer roomId;

            String roomName;

            Integer capacity;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    RoomStatus status;


    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "room_type_id",nullable = false)
    RoomType roomType;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "cinema_id",nullable = false)
    Cinema cinema;




}


