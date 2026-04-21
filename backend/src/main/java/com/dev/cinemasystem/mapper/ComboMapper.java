package com.dev.cinemasystem.mapper;

import com.dev.cinemasystem.dto.comboDTO.ComboResponse;
import com.dev.cinemasystem.entity.Combo;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface ComboMapper {
    ComboResponse toComboResponse(Combo combo);
}
