package com.dev.cinemasystem.Mapper;

import com.dev.cinemasystem.Entity.RoomType;
import com.dev.cinemasystem.dto.roomTypeDTO.RoomTypeCreationRequest;
import com.dev.cinemasystem.dto.roomTypeDTO.RoomTypeResponse;
import com.dev.cinemasystem.dto.roomTypeDTO.RoomTypeUpdateRequest;
import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;

import java.util.List;

@Mapper(componentModel = "spring")
public interface RoomTypeMapper {
    RoomTypeResponse toRoomTypeResponse(RoomType roomType);

    RoomType toRoomTypeFromRoomCreationRequest(RoomTypeCreationRequest request);

    List<RoomTypeResponse> toRoomTypeResponseList(List<RoomType> roomTypes);

    @BeanMapping(nullValuePropertyMappingStrategy = org.mapstruct.NullValuePropertyMappingStrategy.IGNORE)
    void updateRoomTypeInfo(@MappingTarget RoomType roomType, RoomTypeUpdateRequest request);
}

