package com.dev.cinemasystem.dto.ticketTypeDTO;

import com.dev.cinemasystem.enums.TicketTypeStatus;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class TicketTypeResponse {
    Integer ticketTypeId;

    String ticketTypeName;

    String description;
    TicketTypeStatus status;
}

