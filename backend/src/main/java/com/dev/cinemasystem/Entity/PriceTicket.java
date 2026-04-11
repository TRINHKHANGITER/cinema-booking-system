package com.dev.cinemasystem.Entity;


import com.dev.cinemasystem.enums.PriceTicketStatus;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Entity
@Table(name = "price_ticket")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PriceTicket {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Integer priceTicketId;

    @Column(nullable = false)
    Integer price;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    PriceTicketStatus status;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_type_id",nullable = false)
    RoomType roomType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "seat_type_id",nullable = false)
    SeatType seatType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ticket_type_id",nullable = false)
    TicketType ticketType;

}


