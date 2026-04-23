package com.dev.cinemasystem.dto.showTimeSeatDTO;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ReleaseSeatRequest {
    @NotNull(message = "INVALID_REQUEST")
    Integer orderId;

    @NotEmpty(message = "INVALID_REQUEST")
    List<Integer> seatIds;
}
