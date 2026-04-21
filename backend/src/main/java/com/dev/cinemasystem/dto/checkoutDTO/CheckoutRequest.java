package com.dev.cinemasystem.dto.checkoutDTO;

import com.dev.cinemasystem.dto.orderCombo.OrderComboCreationRequest;
import com.dev.cinemasystem.dto.ticket.TicketCreationRequest;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CheckoutRequest {
    Integer userId;

    List<TicketCreationRequest> tickets;

    List<OrderComboCreationRequest> combos;
}
