package com.dev.cinemasystem.mapper;



import com.dev.cinemasystem.entity.Seat;
import com.dev.cinemasystem.dto.seatDTO.SeatCreationResquest;
import com.dev.cinemasystem.dto.seatDTO.SeatResponse;
import org.mapstruct.*;

import java.util.List;

@Mapper(componentModel = "spring", uses = {SeatTypeMapper.class, RoomMapper.class})
public interface SeatMapper {
    List<SeatResponse> toSeatResponseList(List<Seat> seats);

    @Mapping(source = "seatType.seatTypeId", target = "seatTypeId")
    @Mapping(source = "room.roomId", target = "roomId")
    SeatResponse toSeatResponse(Seat seat);

    @Mapping(source = "seatTypeId", target = "seatType.seatTypeId")
    @Mapping(source = "roomId", target = "room.roomId")
    Seat toSeatFromSeatCreationRequest(SeatCreationResquest request);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateSeatInfo(@MappingTarget Seat seat, SeatCreationResquest request);

}
