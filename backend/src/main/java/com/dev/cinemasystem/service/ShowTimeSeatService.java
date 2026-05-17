package com.dev.cinemasystem.service;

import com.dev.cinemasystem.entity.ShowTimeSeat;
import com.dev.cinemasystem.enums.ShowTimeSeatStatus;
import com.dev.cinemasystem.repository.ShowTimeSeatRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ShowTimeSeatService {
    ShowTimeSeatRepository showTimeSeatRepository;

    public List<ShowTimeSeat> findSeatMapByShowTimeId(Integer showTimeId) {
        return showTimeSeatRepository.findSeatMapByShowTimeId(showTimeId);
    }

    public List<ShowTimeSeat> findAllForUpdate(Integer showTimeId, List<Integer> seatIds) {
        return showTimeSeatRepository.findAllForUpdate(showTimeId, seatIds);
    }

    public List<ShowTimeSeat> findAllByOrderIdAndStatus(Integer orderId, ShowTimeSeatStatus status) {
        return showTimeSeatRepository.findAllByOrder_OrderIdAndStatus(orderId, status);
    }

    public List<ShowTimeSeat> findAllByOrderId(Integer orderId) {
        return showTimeSeatRepository.findAllByOrder_OrderId(orderId);
    }

    public List<ShowTimeSeat> findAllByOrderIdAndStatusForUpdate(Integer orderId, ShowTimeSeatStatus status) {
        return showTimeSeatRepository.findAllByOrderIdAndStatusForUpdate(orderId, status);
    }

    public List<ShowTimeSeat> findAllExpiredForUpdate(ShowTimeSeatStatus status, LocalDateTime expiredAt) {
        return showTimeSeatRepository.findAllExpiredForUpdate(status, expiredAt);
    }

    public boolean existsBySeatIdAndStatusAndHoldExpiresAtAfter(
            Integer seatId,
            ShowTimeSeatStatus status,
            LocalDateTime holdExpiresAt
    ) {
        return showTimeSeatRepository.existsBySeat_SeatIdAndStatusAndHoldExpiresAtAfter(seatId, status, holdExpiresAt);
    }

    public List<ShowTimeSeat> findAllByShowTimeIdAndStatus(Integer showTimeId, ShowTimeSeatStatus status) {
        return showTimeSeatRepository.findAllByShowTimeIdAndStatus(showTimeId, status);
    }

    public Optional<ShowTimeSeat> findByShowTimeIdAndSeatIdForUpdate(Integer showTimeId, Integer seatId) {
        return showTimeSeatRepository.findByShowTimeIdAndSeatIdForUpdate(showTimeId, seatId);
    }

    public List<ShowTimeSeat> findAllBySeatIdAndRoomId(Integer seatId, Integer roomId) {
        return showTimeSeatRepository.findAllBySeat_SeatIdAndShowTime_Room_RoomId(seatId, roomId);
    }

    public void deleteByShowTimeId(Integer showTimeId) {
        showTimeSeatRepository.deleteByShowTime_ShowTimeId(showTimeId);
    }

    public List<ShowTimeSeat> saveAll(List<ShowTimeSeat> showTimeSeats) {
        return showTimeSeatRepository.saveAll(showTimeSeats);
    }
}
