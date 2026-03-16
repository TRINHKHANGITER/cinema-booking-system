package com.dev.cinemasystem.dto.addressDTO;

import com.dev.cinemasystem.dto.ProvinceDTO.ProvinceDto;
import com.dev.cinemasystem.dto.wardDTO.WardDTO;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AddressDto {
    Integer addressId;
    String addressDetail;
    ProvinceDto province;
    WardDTO ward;
}
