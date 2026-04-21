package com.dev.cinemasystem.dto.comboDTO;

import com.dev.cinemasystem.enums.ComboStatus;

import java.math.BigDecimal;

public class ComboResponse {
    Integer comboId;

    String comboName;

    String image;

    String description;

    BigDecimal price;

    ComboStatus status;
}
