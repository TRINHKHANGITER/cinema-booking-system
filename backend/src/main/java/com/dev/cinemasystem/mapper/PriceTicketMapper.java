package com.dev.cinemasystem.mapper;




import com.dev.cinemasystem.entity.PriceTicket;
import com.dev.cinemasystem.dto.priceTicketDTO.PriceTicketCreationResquest;
import com.dev.cinemasystem.dto.priceTicketDTO.PriceTicketResponse;
import com.dev.cinemasystem.dto.priceTicketDTO.PriceTicketUpdateResquest;
import org.mapstruct.*;

import java.util.List;

@Mapper(componentModel = "spring", uses = {RoomTypeMapper.class, SeatTypeMapper.class})
public interface PriceTicketMapper {

    @Mapping(target = "roomTypeId", source = "roomType.roomTypeId")
    @Mapping(target = "seatTypeId", source = "seatType.seatTypeId")
    PriceTicketResponse toPriceTicketResponse(PriceTicket priceTicket);


    @Mapping(target = "roomType.roomTypeId", source = "roomTypeId")
    @Mapping(target = "seatType.seatTypeId", source = "seatTypeId")
    PriceTicket toPriceTicketFromPriceTicketCreationRequest(PriceTicketCreationResquest request);

    List<PriceTicketResponse> toPriceTicketResponseList(List<PriceTicket> priceTickets);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updatePriceTicketInfo(@MappingTarget PriceTicket priceTicket, PriceTicketUpdateResquest request);

}
