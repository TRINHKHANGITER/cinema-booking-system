package com.dev.cinemasystem.Mapper;

import com.dev.cinemasystem.Entity.room.Room;
import com.dev.cinemasystem.dto.roomDTO.RoomCreationResquest;
import com.dev.cinemasystem.dto.roomDTO.RoomResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface RoomMapper {
    List<RoomResponse> toRoomResponseList(List<Room> rooms);

    @Mapping(source = "roomType.roomTypeId", target = "roomTypeId")
    @Mapping(source = "cinema.cinemaId", target = "cinemaId")
    RoomResponse toRoomResponse(Room room);

    @Mapping(source = "roomTypeId", target = "roomType.roomTypeId")
    @Mapping(source = "cinemaId", target = "cinema.cinemaId")
    Room toRoomFromRoomCreationRequest(RoomCreationResquest request);

}
