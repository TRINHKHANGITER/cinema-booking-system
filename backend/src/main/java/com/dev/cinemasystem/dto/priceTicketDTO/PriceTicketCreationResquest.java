package com.dev.cinemasystem.dto.priceTicketDTO;


import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import lombok.experimental.FieldDefaults;


@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PriceTicketCreationResquest {

    @NotNull(message = "PRICE_BLANK")
    @Min(value = 0, message = "PRICE_INVALID")
    Integer price;

    @Min(value = 1, message = "ROOM_TYPE_ID_INVALID")
    @NotNull(message = "ROOM_TYPE_ID_BLANK")
    Integer roomTypeId;

    @Min(value = 1, message = "SEAT_TYPE_ID_INVALID")
    @NotNull(message = "SEAT_TYPE_ID_BLANK")
    Integer seatTypeId;
}
