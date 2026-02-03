package com.dev.cinemasystem.dto.priceTicketDTO;

import com.dev.cinemasystem.enums.Status;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import lombok.experimental.FieldDefaults;


@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PriceTicketResponse {

    Integer priceTicketId;
    Integer price;
    Integer roomTypeId;
    Integer seatTypeId;
    Integer ticketTypeId;
    Status status;

}
