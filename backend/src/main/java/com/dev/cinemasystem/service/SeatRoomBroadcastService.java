package com.dev.cinemasystem.service;

import com.dev.cinemasystem.dto.showTimeSeatDTO.ShowTimeSeatResponse;
import com.dev.cinemasystem.dto.websocketDTO.SeatRoomEvent;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
 
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class SeatRoomBroadcastService {
    SimpMessagingTemplate messagingTemplate;

    public void broadcastSeatMap(Integer showTimeId, String type, List<ShowTimeSeatResponse> seats) {
        SeatRoomEvent payload = SeatRoomEvent.builder()
                .type(type)
                .showTimeId(showTimeId)
                .happenedAt(LocalDateTime.now())
                .seats(seats)
                .build();

        messagingTemplate.convertAndSend(
                "/topic/showtime/" + showTimeId + "/seats",
                payload
        );
    }
}
