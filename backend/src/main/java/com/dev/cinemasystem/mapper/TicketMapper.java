package com.dev.cinemasystem.mapper;

import com.dev.cinemasystem.dto.ticket.TicketCreationRequest;
import com.dev.cinemasystem.dto.ticket.TicketResponse;
import com.dev.cinemasystem.entity.Ticket;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface TicketMapper {

    @Mapping(target = "ticketId", ignore = true)
    @Mapping(target = "order", ignore = true)
    @Mapping(target = "show", ignore = true)
    @Mapping(target = "seat", ignore = true)
    @Mapping(target = "priceTicket", ignore = true)
    @Mapping(target = "unitPrice", ignore = true)
    @Mapping(target = "qrCode", ignore = true)
    @Mapping(target = "checkedInAt", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "status", ignore = true)
    Ticket toTicket(TicketCreationRequest ticketCreationRequest);

    @Mapping(target = "orderId", source = "order.orderId")
    @Mapping(target = "showTimeId", source = "show.showTimeId")
    @Mapping(target = "seatId", source = "seat.seatId")
    @Mapping(target = "priceTicketId", source = "priceTicket.priceTicketId")
    TicketResponse toTicketResponse(Ticket ticket);
}
