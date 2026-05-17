package com.dev.cinemasystem.dto.websocketDTO;

import com.dev.cinemasystem.dto.showTimeSeatDTO.ShowTimeSeatResponse;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class SeatRoomEvent {
    String type;
    Integer showTimeId;
    LocalDateTime happenedAt;
    List<ShowTimeSeatResponse> seats;
}
