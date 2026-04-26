package com.dev.cinemasystem.dto.comboDTO;

import com.dev.cinemasystem.enums.ComboStatus;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ComboResponse {
    Integer comboId;

    String comboName;

    String image;

    String description;

    BigDecimal price;

    ComboStatus status;
}
