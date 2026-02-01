package com.dev.cinemasystem.Mapper;

import com.dev.cinemasystem.Entity.SeatType;
import com.dev.cinemasystem.Entity.SeatType;
import com.dev.cinemasystem.dto.seatTypeDTO.SeatTypeCreationRequest;
import com.dev.cinemasystem.dto.seatTypeDTO.SeatTypeResponse;
import com.dev.cinemasystem.dto.seatTypeDTO.SeatTypeUpdateRequest;
import com.dev.cinemasystem.dto.seatTypeDTO.SeatTypeCreationRequest;
import com.dev.cinemasystem.dto.seatTypeDTO.SeatTypeResponse;
import com.dev.cinemasystem.dto.seatTypeDTO.SeatTypeUpdateRequest;
import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;

import java.util.List;

@Mapper(componentModel = "spring")
public interface SeatTypeMapper {
    SeatTypeResponse toSeatTypeResponse(SeatType seatType);

    SeatType toSeatTypeFromSeatCreationRequest(SeatTypeCreationRequest request);

    List<SeatTypeResponse> toSeatTypeResponseList(List<SeatType> seatTypes);

    @BeanMapping(nullValuePropertyMappingStrategy = org.mapstruct.NullValuePropertyMappingStrategy.IGNORE)
    void updateSeatTypeInfo(@MappingTarget SeatType seatType, SeatTypeUpdateRequest request);
}

