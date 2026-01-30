package com.dev.cinemasystem.dto.cinemaDTO;


import com.dev.cinemasystem.Entity.Address;
import com.dev.cinemasystem.dto.addressDTO.AddressDto;
import com.dev.cinemasystem.enums.Status;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CinemaResponse {
    Integer cinemaId;
    String cinemaName;
    AddressDto address;
    String description;
    Status status;

}
