package com.dev.cinemasystem.dto.showTimeSeatDTO;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class HoldSeatResponse {
    Integer orderId;
    Integer showTimeId;
    LocalDateTime expiredAt;
    BigDecimal ticketTotal;
    BigDecimal comboTotal;
    BigDecimal discountAmount;
    BigDecimal totalAmount;
    BigDecimal netAmount;
    List<ShowTimeSeatResponse> heldSeats;
}
