package com.dev.cinemasystem.entity;

import com.dev.cinemasystem.enums.ShowTimeSeatStatus;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "show_time_seat",
        uniqueConstraints = @UniqueConstraint(
                name = "uq_show_time_seat",
                columnNames = {"show_time_id", "seat_id"}
        )
)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ShowTimeSeat {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Integer showTimeSeatId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "show_time_id", nullable = false)
    ShowTime showTime;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "seat_id", nullable = false)
    Seat seat;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    ShowTimeSeatStatus status;

    LocalDateTime holdExpiresAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id")
    Order order;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    LocalDateTime updatedAt;
}
