package com.dev.cinemasystem.mapper;

import com.dev.cinemasystem.dto.orderDTO.OrderCreationRequest;
import com.dev.cinemasystem.dto.orderDTO.OrderResponse;
import com.dev.cinemasystem.dto.orderDTO.OrderUpdateRequest;
import com.dev.cinemasystem.dto.orderDTO.OrderUserResponse;
import com.dev.cinemasystem.entity.Order;
import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(componentModel = "spring")
public interface OrderMapper {

    @Mapping(target = "orderId", ignore = true)
    @Mapping(target = "user", ignore = true)
    @Mapping(target = "showTime", ignore = true)
    @Mapping(target = "ticketTotal", ignore = true)
    @Mapping(target = "comboTotal", ignore = true)
    @Mapping(target = "discountAmount", ignore = true)
    @Mapping(target = "totalAmount", ignore = true)
    @Mapping(target = "netAmount", ignore = true)
    @Mapping(target = "expiredAt", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    Order toOrder(OrderCreationRequest orderCreationRequest);

    @Mapping(target = "userId", source = "user.userId")
    @Mapping(target = "showTimeId", source = "showTime.showTimeId")
    OrderResponse toOrderResponse(Order order);

    @Mapping(target = "userId", source = "user.userId")
    @Mapping(target = "showTimeId", source = "showTime.showTimeId")
    OrderUserResponse tOrderUserResponse(Order order);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "orderId", ignore = true)
    @Mapping(target = "user", ignore = true)
    @Mapping(target = "showTime", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    void updateOrder(@MappingTarget Order order, OrderUpdateRequest orderUpdateRequest);
}
