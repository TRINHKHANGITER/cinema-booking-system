package com.dev.cinemasystem.mapper;

import com.dev.cinemasystem.dto.comboDTO.ComboCreationRequest;
import com.dev.cinemasystem.dto.comboDTO.ComboResponse;
import com.dev.cinemasystem.dto.comboDTO.ComboUpdateRequest;
import com.dev.cinemasystem.entity.Combo;
import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import java.util.List;

@Mapper(componentModel = "spring")
public interface ComboMapper {
    ComboResponse toComboResponse(Combo combo);

    @Mapping(target = "comboId", ignore = true)
    @Mapping(target = "image", ignore = true)
    Combo toComboFromCreationRequest(ComboCreationRequest request);

    List<ComboResponse> toComboResponseList(List<Combo> combos);

    @BeanMapping(nullValuePropertyMappingStrategy = org.mapstruct.NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "image", ignore = true)
    void updateComboInfo(@MappingTarget Combo combo, ComboUpdateRequest request);
}
