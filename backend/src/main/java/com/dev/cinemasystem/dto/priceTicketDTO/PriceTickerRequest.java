package com.dev.cinemasystem.dto.priceTicketDTO;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PriceTickerRequest {
    int roomTypeId;

    int seatTypeId;
}
