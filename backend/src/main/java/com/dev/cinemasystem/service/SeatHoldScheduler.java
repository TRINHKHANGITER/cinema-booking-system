package com.dev.cinemasystem.service;

import com.dev.cinemasystem.dto.showTimeSeatDTO.ShowTimeSeatResponse;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class SeatHoldScheduler {
    SeatInventoryService seatInventoryService;
    SeatRoomBroadcastService seatRoomBroadcastService;

    @Scheduled(fixedDelayString = "${app.booking.hold-expire-scan-ms:15000}")
    public void expireHoldsAndBroadcast() {
        List<Integer> showTimeIds = seatInventoryService.expireHolds();
        for (Integer showTimeId : showTimeIds) {
            List<ShowTimeSeatResponse> seatMap = seatInventoryService.getSeatMap(showTimeId);
            seatRoomBroadcastService.broadcastSeatMap(showTimeId, "EXPIRED", seatMap);
        }
    }
}
