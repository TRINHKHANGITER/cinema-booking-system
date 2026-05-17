package com.dev.cinemasystem.mapper;

import com.dev.cinemasystem.dto.orderDTO.OrderComboDetailResponse;
import com.dev.cinemasystem.dto.orderDTO.OrderPaymentDetailResponse;
import com.dev.cinemasystem.dto.orderDTO.OrderSeatDetailResponse;
import com.dev.cinemasystem.dto.orderDTO.OrderShowTimeDetailResponse;
import com.dev.cinemasystem.entity.OrderCombo;
import com.dev.cinemasystem.entity.Payment;
import com.dev.cinemasystem.entity.ShowTime;
import com.dev.cinemasystem.entity.ShowTimeSeat;
import com.dev.cinemasystem.entity.Ticket;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.math.BigDecimal;

@Mapper(componentModel = "spring")
public interface OrderDetailMapper {

    @Mapping(target = "showTimeId", source = "showTime.showTimeId")
    @Mapping(target = "releaseDate", source = "showTime.releaseDate")
    @Mapping(target = "startTime", source = "showTime.startTime")
    @Mapping(target = "endTime", source = "showTime.endTime")
    @Mapping(target = "movieId", source = "showTime.movie.movieId")
    @Mapping(target = "movieName", source = "showTime.movie.movieName")
    @Mapping(target = "roomId", source = "showTime.room.roomId")
    @Mapping(target = "roomName", source = "showTime.room.roomName")
    @Mapping(target = "cinemaId", source = "showTime.room.cinema.cinemaId")
    @Mapping(target = "cinemaName", source = "showTime.room.cinema.cinemaName")
    @Mapping(target = "provinceId", source = "showTime.room.cinema.province.provinceId")
    @Mapping(target = "provinceName", source = "showTime.room.cinema.province.provinceName")
    OrderShowTimeDetailResponse mapShowTimeDetail(ShowTime showTime);

    @Mapping(target = "ticketId", source = "ticket.ticketId")
    @Mapping(target = "seatId", source = "showTimeSeat.seat.seatId")
    @Mapping(target = "seatRow", source = "showTimeSeat.seat.seatRow")
    @Mapping(target = "seatColumn", source = "showTimeSeat.seat.seatColumn")
    @Mapping(target = "seatLabel", expression = "java(buildSeatLabel(showTimeSeat))")
    @Mapping(target = "seatTypeId", source = "showTimeSeat.seat.seatType.seatTypeId")
    @Mapping(target = "seatTypeName", source = "showTimeSeat.seat.seatType.seatTypeName")
    @Mapping(target = "showTimeSeatStatus", source = "showTimeSeat.status")
    @Mapping(target = "unitPrice", source = "seatPrice")
    @Mapping(target = "ticketStatus", source = "ticket.status")
    OrderSeatDetailResponse mapSeatDetail(ShowTimeSeat showTimeSeat, Ticket ticket, BigDecimal seatPrice);

    @Mapping(target = "orderComboId", source = "orderComboId")
    @Mapping(target = "comboId", source = "combo.comboId")
    @Mapping(target = "comboName", source = "combo.comboName")
    @Mapping(target = "comboImage", source = "combo.image")
    @Mapping(target = "quantity", source = "quantity")
    @Mapping(target = "unitPrice", source = "unitPrice")
    @Mapping(target = "lineTotal", expression = "java(resolveLineTotal(orderCombo))")
    @Mapping(target = "status", source = "status")
    OrderComboDetailResponse mapComboDetail(OrderCombo orderCombo);

    OrderPaymentDetailResponse mapPaymentDetail(Payment payment);

    default String buildSeatLabel(ShowTimeSeat showTimeSeat) {
        if (showTimeSeat == null || showTimeSeat.getSeat() == null) {
            return null;
        }
        return showTimeSeat.getSeat().getSeatRow() + showTimeSeat.getSeat().getSeatColumn();
    }

    default BigDecimal resolveLineTotal(OrderCombo orderCombo) {
        if (orderCombo == null) {
            return null;
        }
        if (orderCombo.getUnitPrice() == null || orderCombo.getQuantity() == null) {
            return orderCombo.getNetAmount();
        }
        return orderCombo.getUnitPrice().multiply(BigDecimal.valueOf(orderCombo.getQuantity()));
    }
}
