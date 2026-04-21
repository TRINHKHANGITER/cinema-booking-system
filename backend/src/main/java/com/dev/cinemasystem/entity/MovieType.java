package com.dev.cinemasystem.entity;


import com.dev.cinemasystem.enums.MovieTypeStatus;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Entity
@Table(name = "movie_type")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class MovieType {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "movie_type_id")
    Integer movieTypeId;

    @Column(nullable = false, unique = true)
    String movieTypeName;

    String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    MovieTypeStatus status;

}


