package com.dev.cinemasystem.dto.provinceDTO;

import com.dev.cinemasystem.enums.ProvinceStatus;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ProvinceResponse {
    Integer provinceId;
    String provinceName;
    ProvinceStatus status;
}
