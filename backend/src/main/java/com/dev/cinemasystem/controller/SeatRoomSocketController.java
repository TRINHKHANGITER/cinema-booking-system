package com.dev.cinemasystem.controller;

import com.dev.cinemasystem.dto.apiDTO.ApiResponse;
import com.dev.cinemasystem.dto.showTimeSeatDTO.HoldSeatRequest;
import com.dev.cinemasystem.dto.showTimeSeatDTO.HoldSeatResponse;
import com.dev.cinemasystem.dto.showTimeSeatDTO.ReleaseSeatRequest;
import com.dev.cinemasystem.dto.showTimeSeatDTO.ShowTimeSeatResponse;
import com.dev.cinemasystem.service.SeatInventoryService;
import com.dev.cinemasystem.service.SeatRoomBroadcastService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.annotation.SendToUser;
import org.springframework.stereotype.Controller;

import java.util.List;

@Controller
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class SeatRoomSocketController {
    SeatInventoryService seatInventoryService;
    SeatRoomBroadcastService seatRoomBroadcastService;

    @MessageMapping("/showtime/{showTimeId}/sync")
    public void syncSeatMap(@DestinationVariable Integer showTimeId) {
        List<ShowTimeSeatResponse> seatMap = seatInventoryService.getSeatMap(showTimeId);
        seatRoomBroadcastService.broadcastSeatMap(showTimeId, "SYNC", seatMap);
    }

    @MessageMapping("/showtime/hold")
    @SendToUser("/queue/seat-hold")
    public ApiResponse<HoldSeatResponse> holdBySocket(HoldSeatRequest request) {
        HoldSeatResponse result = seatInventoryService.holdSeats(request);
        broadcastSeatMap(result.getShowTimeId(), "HELD");
        return ApiResponse.<HoldSeatResponse>builder()
                .result(result)
                .build();
    }

    @MessageMapping("/showtime/release")
    @SendToUser("/queue/seat-hold")
    public ApiResponse<HoldSeatResponse> releaseBySocket(ReleaseSeatRequest request) {
        HoldSeatResponse result = seatInventoryService.releaseSeats(request);
        broadcastSeatMap(result.getShowTimeId(), "RELEASED");
        return ApiResponse.<HoldSeatResponse>builder()
                .result(result)
                .build();
    }

    private void broadcastSeatMap(Integer showTimeId, String type) {
        List<ShowTimeSeatResponse> seatMap = seatInventoryService.getSeatMap(showTimeId);
        seatRoomBroadcastService.broadcastSeatMap(showTimeId, type, seatMap);
    }
}
