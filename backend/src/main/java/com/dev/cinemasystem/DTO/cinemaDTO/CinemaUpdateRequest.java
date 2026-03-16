package com.dev.cinemasystem.dto.cinemaDTO;


import com.dev.cinemasystem.dto.addressDTO.AddressCreationDto;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CinemaUpdateRequest {
    String cinemaName;
    AddressCreationDto address;
    String description;

}
