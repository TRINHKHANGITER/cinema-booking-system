package com.dev.cinemasystem.dto.bookingDTO;

import jakarta.validation.constraints.NotNull;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UpdateOrderCombosRequest {
    @NotNull(message = "INVALID_REQUEST")
    List<OrderComboItemRequest> combos;
}
