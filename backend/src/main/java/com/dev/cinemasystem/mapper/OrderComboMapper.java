package com.dev.cinemasystem.mapper;

import com.dev.cinemasystem.dto.orderCombo.OrderComboCreationRequest;
import com.dev.cinemasystem.dto.orderCombo.OrderComboResponse;
import com.dev.cinemasystem.entity.OrderCombo;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface OrderComboMapper {

    @Mapping(target = "orderComboId", ignore = true)
    @Mapping(target = "order", ignore = true)
    @Mapping(target = "combo", ignore = true)
    @Mapping(target = "unitPrice", ignore = true)
    @Mapping(target = "status", ignore = true)
    OrderCombo toOrderCombo(OrderComboCreationRequest orderComboCreationRequest);

    @Mapping(target = "orderId", source = "order.orderId")
    @Mapping(target = "comboId", source = "combo.comboId")
    OrderComboResponse toComboResponse(OrderCombo combo);
}
