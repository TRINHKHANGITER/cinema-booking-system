package com.dev.cinemasystem.mapper;

import com.dev.cinemasystem.entity.Room;
import com.dev.cinemasystem.dto.roomDTO.RoomCreationResquest;
import com.dev.cinemasystem.dto.roomDTO.RoomResponse;
import com.dev.cinemasystem.dto.roomDTO.RoomUpdateResquest;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.BeanMapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

import java.util.List;

@Mapper(componentModel = "spring", uses = {RoomTypeMapper.class, CinemaMapper.class})
public interface RoomMapper {
    List<RoomResponse> toRoomResponseList(List<Room> rooms);

    @Mapping(source = "roomType.roomTypeId", target = "roomTypeId")
    @Mapping(source = "cinema.cinemaId", target = "cinemaId")
    RoomResponse toRoomResponse(Room room);

    @Mapping(source = "roomTypeId", target = "roomType.roomTypeId")
    @Mapping(source = "cinemaId", target = "cinema.cinemaId")
    Room toRoomFromRoomCreationRequest(RoomCreationResquest request);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateRoomInfo(@MappingTarget Room room, RoomUpdateResquest request);

}
