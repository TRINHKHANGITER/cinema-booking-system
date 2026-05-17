package com.dev.cinemasystem.mapper;

import com.dev.cinemasystem.dto.showTimeSeatDTO.ShowTimeSeatResponse;
import com.dev.cinemasystem.entity.ShowTimeSeat;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface ShowTimeSeatMapper {

    @Mapping(target = "showTimeSeatId", source = "showTimeSeat.showTimeSeatId")
    @Mapping(target = "showTimeId", source = "showTimeSeat.showTime.showTimeId")
    @Mapping(target = "seatId", source = "showTimeSeat.seat.seatId")
    @Mapping(target = "seatRow", source = "showTimeSeat.seat.seatRow")
    @Mapping(target = "seatColumn", source = "showTimeSeat.seat.seatColumn")
    @Mapping(target = "seatTypeId", source = "showTimeSeat.seat.seatType.seatTypeId")
    @Mapping(target = "seatTypeName", source = "showTimeSeat.seat.seatType.seatTypeName")
    @Mapping(target = "status", source = "showTimeSeat.status")
    @Mapping(target = "holdExpiresAt", source = "showTimeSeat.holdExpiresAt")
    @Mapping(target = "orderId", source = "showTimeSeat.order.orderId")
    ShowTimeSeatResponse mapSeatResponse(ShowTimeSeat showTimeSeat);
}
