package com.dev.cinemasystem.dto.ticketTypeDTO;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class TicketTypeUpdateRequest {

    String ticketTypeName;

    String description;

}
