package com.dev.cinemasystem.dto.cinemaDTO;


import com.dev.cinemasystem.dto.addressDTO.AddressCreationDto;
import com.dev.cinemasystem.enums.Status;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CinemaCreationRequest {
    String cinemaName;
    AddressCreationDto address;
    String description;

}
