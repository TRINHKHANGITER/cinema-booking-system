package com.dev.cinemasystem.Entity;


import com.dev.cinemasystem.enums.Status;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Entity
@Table(name = "room_type")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class RoomType {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "room_type_id")
    Integer roomTypeId;

    @Column(nullable = false, unique = true)
    String roomTypeName;

    String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    Status status;

}
