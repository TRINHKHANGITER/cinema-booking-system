package com.dev.cinemasystem.dto.priceTicketDTO;


import com.dev.cinemasystem.enums.PriceTicketStatus;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;


@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PriceTicketUpdateResquest {

    @DecimalMin(value = "0", message = "PRICE_INVALID")
    BigDecimal price;

    @Min(value = 1, message = "ROOM_TYPE_ID_INVALID")
    Integer roomTypeId;

    @Min(value = 1, message = "SEAT_TYPE_ID_INVALID")
    Integer seatTypeId;

    PriceTicketStatus status;
}
