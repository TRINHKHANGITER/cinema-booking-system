package com.dev.cinemasystem.dto.bookingDTO;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class OrderComboItemRequest {
    @NotNull(message = "INVALID_REQUEST")
    @Min(value = 1, message = "INVALID_REQUEST")
    Integer comboId;

    @NotNull(message = "INVALID_REQUEST")
    @Min(value = 0, message = "INVALID_REQUEST")
    Integer quantity;
}
