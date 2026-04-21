package com.dev.cinemasystem.dto.ticketTypeDTO;

import jakarta.validation.constraints.NotBlank;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class TicketTypeCreationRequest {

    @NotBlank(message = "TICKET_TYPE_NAME_BLANK")
    String ticketTypeName;

    @NotBlank(message = "DESCRIPTION_BLANK")
    String description;

}
