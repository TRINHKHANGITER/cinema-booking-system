package com.dev.cinemasystem.dto.orderDTO;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class OrderCreationRequest {
    Integer userId;

//    List<TicketCreationRequest> tickets;
//
//    List<OrderComboCreationRequest> combos;
}
