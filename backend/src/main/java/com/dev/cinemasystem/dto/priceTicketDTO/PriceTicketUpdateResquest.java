package com.dev.cinemasystem.dto.priceTicketDTO;


import jakarta.validation.constraints.Min;
import lombok.*;
import lombok.experimental.FieldDefaults;


@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PriceTicketUpdateResquest {

    @Min(value = 0, message = "PRICE_INVALID")
    Integer price;

    @Min(value = 1, message = "ROOM_TYPE_ID_INVALID")
    Integer roomTypeId;

    @Min(value = 1, message = "SEAT_TYPE_ID_INVALID")
    Integer seatTypeId;
}
