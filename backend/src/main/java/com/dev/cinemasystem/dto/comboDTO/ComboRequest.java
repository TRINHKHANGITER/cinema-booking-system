package com.dev.cinemasystem.dto.comboDTO;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ComboRequest {
    Integer comboId;
    Integer quantity;
}
