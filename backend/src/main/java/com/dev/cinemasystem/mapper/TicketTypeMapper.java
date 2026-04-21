package com.dev.cinemasystem.mapper;

import com.dev.cinemasystem.entity.TicketType;
import com.dev.cinemasystem.dto.ticketTypeDTO.TicketTypeCreationRequest;
import com.dev.cinemasystem.dto.ticketTypeDTO.TicketTypeResponse;
import com.dev.cinemasystem.dto.ticketTypeDTO.TicketTypeUpdateRequest;
import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;

import java.util.List;


@Mapper(componentModel = "spring")
public interface TicketTypeMapper {
    TicketTypeResponse toTicketTypeResponse(TicketType ticketType);

    TicketType toTicketTypeFromTicketCreationRequest(TicketTypeCreationRequest request);

    List<TicketTypeResponse> toTicketTypeResponseList(List<TicketType> ticketTypes);

    @BeanMapping(nullValuePropertyMappingStrategy = org.mapstruct.NullValuePropertyMappingStrategy.IGNORE)
    void updateTicketTypeInfo(@MappingTarget TicketType ticketType, TicketTypeUpdateRequest request);
}

