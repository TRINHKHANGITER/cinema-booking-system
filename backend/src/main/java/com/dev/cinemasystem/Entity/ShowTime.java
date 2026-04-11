package com.dev.cinemasystem.Entity;


import com.dev.cinemasystem.enums.ShowTimeStatus;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "show_time")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ShowTime {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Integer showTimeId;


    @Column(nullable = false)
    LocalDateTime startTime;

    @Column(nullable = false)
    LocalDateTime endTime;

    LocalDateTime sellStartTime;

    LocalDateTime sellEndTime;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    LocalDateTime updatedAt;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    ShowTimeStatus status;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "movie_id",nullable = false)
    Movie movie;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_id",nullable = false)
    Room room;

}


