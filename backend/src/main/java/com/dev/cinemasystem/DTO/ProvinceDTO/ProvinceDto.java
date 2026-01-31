package com.dev.cinemasystem.dto.ProvinceDTO;


import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ProvinceDto {
    private Integer code;
    private String name;
}
