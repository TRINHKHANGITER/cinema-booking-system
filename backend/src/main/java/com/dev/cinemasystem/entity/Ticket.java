package com.dev.cinemasystem.entity;

import com.dev.cinemasystem.enums.TicketStatus;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(
        name = "ticket",
        uniqueConstraints = @UniqueConstraint(
                name = "uq_ticket_show_seat",
                columnNames = {"show_id", "seat_id"}
        )
)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Ticket {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Integer ticketId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    Order order;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "show_id", nullable = false)
    ShowTime show;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "seat_id", nullable = false)
    Seat seat;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "price_ticket_id")
    PriceTicket priceTicket;

    @Column(nullable = false, precision = 12, scale = 2)
    BigDecimal unitPrice;

    @Column(length = 255)
    String qrCode;

    LocalDateTime checkedInAt;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    LocalDateTime updatedAt;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    TicketStatus status = TicketStatus.ACTIVE;
}
