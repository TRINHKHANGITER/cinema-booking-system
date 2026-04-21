package com.dev.cinemasystem.mapper;

import com.dev.cinemasystem.dto.orderCombo.OrderComboCreationRequest;
import com.dev.cinemasystem.dto.orderCombo.OrderComboResponse;
import com.dev.cinemasystem.entity.OrderCombo;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface OrderComboMapper {
    OrderCombo toOrderCombo(OrderComboCreationRequest orderComboCreationRequest);

    OrderComboResponse toComboResponse(OrderCombo combo);
}
