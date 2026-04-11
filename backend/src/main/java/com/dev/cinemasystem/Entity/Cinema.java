package com.dev.cinemasystem.Entity;

import com.dev.cinemasystem.enums.Status;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Entity
@Table(name = "cinema")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Cinema {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Integer cinemaId;


    @Column(unique = true)
    String cinemaName;

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "address_id", referencedColumnName = "addressId")
    Address address;

    @Column(length = 100)
    String province;

    @Column(name = "address", length = 300)
    String addressText;


    @Column(length = 1000)
    String description;


    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    Status status;
}
