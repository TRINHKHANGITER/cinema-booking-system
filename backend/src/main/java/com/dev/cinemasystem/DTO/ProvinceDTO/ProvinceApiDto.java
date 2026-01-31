package com.dev.cinemasystem.dto.ProvinceDTO;


import com.dev.cinemasystem.dto.wardDTO.WardDto;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ProvinceApiDto {
    Integer code;
    String name;
    List<WardDto> wards;
}
