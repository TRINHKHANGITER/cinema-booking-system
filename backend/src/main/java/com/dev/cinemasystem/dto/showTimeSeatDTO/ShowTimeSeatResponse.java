package com.dev.cinemasystem.dto.showTimeSeatDTO;

import com.dev.cinemasystem.enums.ShowTimeSeatStatus;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ShowTimeSeatResponse {
    Integer showTimeSeatId;
    Integer showTimeId;
    Integer seatId;
    String seatRow;
    Integer seatColumn;
    Integer seatTypeId;
    String seatTypeName;
    ShowTimeSeatStatus status;
    LocalDateTime holdExpiresAt;
    Integer orderId;
}
