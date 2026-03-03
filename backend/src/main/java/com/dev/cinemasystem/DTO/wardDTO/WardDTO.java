package com.dev.cinemasystem.dto.wardDTO;


import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class WardDTO {
    private Integer code;
    private String name;
}
