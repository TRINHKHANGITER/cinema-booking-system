package com.dev.cinemasystem.Mapper;




import com.dev.cinemasystem.Entity.PriceTicket;
import com.dev.cinemasystem.dto.priceTicketDTO.PriceTicketCreationResquest;
import com.dev.cinemasystem.dto.priceTicketDTO.PriceTicketResponse;
import org.mapstruct.*;

import java.util.List;

@Mapper(componentModel = "spring")
public interface PriceTicketMapper {

    @Mapping(target = "roomTypeId", source = "roomType.roomTypeId")
    @Mapping(target = "seatTypeId", source = "seatType.seatTypeId")
    @Mapping(target = "ticketTypeId", source = "ticketType.ticketTypeId")
    PriceTicketResponse toPriceTicketResponse(PriceTicket priceTicket);


    @Mapping(target = "roomType.roomTypeId", source = "roomTypeId")
    @Mapping(target = "seatType.seatTypeId", source = "seatTypeId")
    @Mapping(target = "ticketType.ticketTypeId", source = "ticketTypeId")
    PriceTicket toPriceTicketFromPriceTicketCreationRequest(PriceTicketCreationResquest request);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updatePriceTicketInfo(@MappingTarget PriceTicket priceTicket, PriceTicketCreationResquest request);

}
