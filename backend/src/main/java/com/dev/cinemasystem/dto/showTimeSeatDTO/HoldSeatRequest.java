package com.dev.cinemasystem.dto.showTimeSeatDTO;

import jakarta.validation.constraints.Min;
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
public class HoldSeatRequest {
    Integer userId;

    @NotNull(message = "INVALID_REQUEST")
    @Min(value = 1, message = "INVALID_REQUEST")
    Integer showTimeId;

    Integer orderId;

    @NotEmpty(message = "INVALID_REQUEST")
    List<Integer> seatIds;
}
