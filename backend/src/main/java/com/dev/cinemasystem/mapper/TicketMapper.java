package com.dev.cinemasystem.mapper;

import com.dev.cinemasystem.dto.ticket.TicketCreationRequest;
import com.dev.cinemasystem.dto.ticket.TicketResponse;
import com.dev.cinemasystem.entity.Ticket;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface TicketMapper {
    Ticket toTicket(TicketCreationRequest ticketCreationRequest);

    TicketResponse toTicketResponse(Ticket ticket);
}

