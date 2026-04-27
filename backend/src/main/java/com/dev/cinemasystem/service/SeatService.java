package com.dev.cinemasystem.service;


import com.dev.cinemasystem.entity.Seat;
import com.dev.cinemasystem.enums.ShowTimeSeatStatus;
import com.dev.cinemasystem.exception.AppException;
import com.dev.cinemasystem.exception.ErrorCode;
import com.dev.cinemasystem.mapper.SeatMapper;
import com.dev.cinemasystem.repository.ShowTimeSeatRepository;
import com.dev.cinemasystem.repository.TicketRepository;
import com.dev.cinemasystem.repository.RoomRepository;
import com.dev.cinemasystem.repository.SeatRepository;
import com.dev.cinemasystem.repository.SeatTypeRepository;
import com.dev.cinemasystem.dto.apiDTO.PagingDto;
import com.dev.cinemasystem.dto.seatDTO.SeatCreationResquest;
import com.dev.cinemasystem.dto.seatDTO.SeatResponse;
import com.dev.cinemasystem.enums.SeatStatus;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class SeatService {

    SeatRepository seatRepository;
    SeatMapper seatMapper;
    RoomRepository roomRepository;
    SeatTypeRepository seatTypeRepository;
    TicketRepository ticketRepository;
    ShowTimeSeatRepository showTimeSeatRepository;




    public SeatResponse getSeatById(Integer seatId){
        var seat = seatRepository.findById(seatId)
                .orElseThrow(() -> {
                    log.error("Seat with id {} not found", seatId);
                    return new AppException(ErrorCode.SEAT_NOT_FOUND);
                });
        log.info("Retrieving seat with id: {}", seatId);
        return seatMapper.toSeatResponse(seat);
    }

    public  SeatResponse createSeat(SeatCreationResquest request){
        if(request == null){
            log.error("Seat creation request is null");
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }
        String normalizedSeatRow = normalizeSeatRow(request.getSeatRow());
        Integer seatColumn = request.getSeatColumn();

        var room = roomRepository.findById(request.getRoomId()).orElseThrow(() -> {
            log.error("Room with id {} not found", request.getRoomId());
            return new AppException(ErrorCode.ROOM_NOT_FOUND);
        });
        var seatType = seatTypeRepository.findById(request.getSeatTypeId()).orElseThrow(() -> {
            log.error("Seat type with id {} not found", request.getSeatTypeId());
            return new AppException(ErrorCode.SEAT_TYPE_NOT_FOUND);
        });

        var existingSeat = seatRepository.findBySeatRowAndSeatColumnAndRoom_RoomId(
                normalizedSeatRow,
                seatColumn,
                request.getRoomId()
        );
        if (existingSeat.isPresent()) {
            var seat = existingSeat.get();
            if (seat.getStatus() == SeatStatus.ACTIVE) {
                log.error("Seat at seatRow {} and seatColumn {} already exists in room id {}", normalizedSeatRow, seatColumn, request.getRoomId());
                throw new AppException(ErrorCode.SEAT_ALREADY_EXISTS_IN_ROOM);
            }

            seat.setSeatRow(normalizedSeatRow);
            seat.setSeatColumn(seatColumn);
            seat.setRoom(room);
            seat.setSeatType(seatType);
            seat.setStatus(request.getStatus() != null ? request.getStatus() : SeatStatus.ACTIVE);
            log.info("Reactivating seat {}{} in room id {}", normalizedSeatRow, seatColumn, room.getRoomId());
            return seatMapper.toSeatResponse(seatRepository.save(seat));
        }

        var seat = seatMapper.toSeatFromSeatCreationRequest(request);
        seat.setSeatRow(normalizedSeatRow);
        seat.setSeatColumn(seatColumn);
        seat.setRoom(room);
        seat.setSeatType(seatType);
        seat.setStatus(request.getStatus() != null ? request.getStatus() : SeatStatus.ACTIVE);
        log.info("Creating seat in room id: {} with seat type id: {}", room.getRoomId(), seatType.getSeatTypeId());
        return seatMapper.toSeatResponse(seatRepository.save(seat));
    }

    public List<SeatResponse> getSeatsByRoom(Integer roomId, SeatStatus status) {
        if (roomId == null) {
            log.error("Room id is required");
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }

        roomRepository.findById(roomId).orElseThrow(() -> {
            log.error("Room with id {} not found", roomId);
            return new AppException(ErrorCode.ROOM_NOT_FOUND);
        });

        List<Seat> seats = status == null
                ? seatRepository.findAllByRoom_RoomIdOrderBySeatRowAscSeatColumnAsc(roomId)
                : seatRepository.findAllByRoom_RoomIdAndStatusOrderBySeatRowAscSeatColumnAsc(roomId, status);

        log.info("Retrieved {} seats by roomId={} and status={}", seats.size(), roomId, status);
        return seatMapper.toSeatResponseList(seats);
    }

    public PagingDto<SeatResponse> getAllseats(Integer roomId, Integer seatTypeId, SeatStatus status, Integer page, Integer size){
        if (page < 1) {
            log.error("Invalid page number: {}", page);
            throw new AppException(ErrorCode.INVALID_PAGE_NUMBER);
        }
        if (size < 1 ) {
            log.error("Invalid page size: {}", size);
            throw new AppException(ErrorCode.INVALID_PAGE_SIZE);
        }
        Pageable pageable = PageRequest.of(page - 1, size);
        Page<Seat> seatPage ;
        if (roomId != null && seatTypeId != null) {
            seatPage = seatRepository.findAllByRoom_RoomIdAndSeatType_SeatTypeIdAndStatus(roomId, seatTypeId, status, pageable);
        } else if (roomId != null) {
            seatPage = seatRepository.findAllByRoom_RoomIdAndStatus(roomId, status, pageable);
        } else if (seatTypeId != null) {
            seatPage = seatRepository.findAllBySeatType_SeatTypeIdAndStatus(seatTypeId, status, pageable);
        } else {
            seatPage = seatRepository.findAllByStatus( status, pageable);
        }

        log.info("Fetching seats - page: {}, size: {}", page, size);
        List<SeatResponse> seatResponses = seatMapper.toSeatResponseList(seatPage.getContent());
        return  PagingDto.<SeatResponse>builder()
                .items(seatResponses)
                .currentPage(page)
                .pageSize(size)
                .totalItems(seatPage.getTotalElements())
                .totalPages(seatPage.getTotalPages())
                .build();
    }

    public SeatResponse  updateSeat(Integer seatId, SeatCreationResquest request){
        String normalizedSeatRow = normalizeSeatRow(request.getSeatRow());
        request.setSeatRow(normalizedSeatRow);

        var seat = seatRepository.findById(seatId)
                .orElseThrow(() -> {
                    log.error("Seat with id {} not found", seatId);
                    return new AppException(ErrorCode.SEAT_NOT_FOUND);
                });
        var room = roomRepository.findById(request.getRoomId()).orElseThrow(() -> {
            log.error("Room with id {} not found", request.getRoomId());
            return new AppException(ErrorCode.ROOM_NOT_FOUND);
        });
        var seatType = seatTypeRepository.findById(request.getSeatTypeId()).orElseThrow(() -> {
            log.error("Seat type with id {} not found", request.getSeatTypeId());
            return new AppException(ErrorCode.SEAT_TYPE_NOT_FOUND);
        });

        var existingSeat = seatRepository.findBySeatRowAndSeatColumnAndRoom_RoomId(
                normalizedSeatRow, request.getSeatColumn(), request.getRoomId());
        if(existingSeat.isPresent() && !existingSeat.get().getSeatId().equals(seatId)){
            log.error("Seat at seatRow {} and seatColumn {} already exists in room id {}", normalizedSeatRow, request.getSeatColumn(), request.getRoomId());
            throw new AppException(ErrorCode.SEAT_ALREADY_EXISTS_IN_ROOM);
        }

        seatMapper.updateSeatInfo( seat, request);
        seat.setRoom(room);
        seat.setSeatType(seatType);
        log.info("Updating seat with id: {}", seatId);
        return seatMapper.toSeatResponse(seatRepository.save(seat));
    }

    public boolean deleteSeat(Integer seatId){
        var seat = seatRepository.findById(seatId)
                .orElseThrow(() -> {
                    log.error("Seat with id {} not found", seatId);
                    return new AppException(ErrorCode.SEAT_NOT_FOUND);
                });

        boolean hasActiveTickets = ticketRepository.existsBySeat_SeatId(seatId);
        boolean hasActiveHolds = showTimeSeatRepository.existsBySeat_SeatIdAndStatusAndHoldExpiresAtAfter(
                seatId,
                ShowTimeSeatStatus.HELD,
                LocalDateTime.now()
        );
        if (hasActiveTickets || hasActiveHolds) {
            throw new AppException(ErrorCode.SEAT_HAS_ACTIVE_TICKETS_OR_HOLDS);
        }

        seat.setStatus(SeatStatus.BLOCKED);
        seatRepository.save(seat);
        log.info("Deleted seat with id: {}", seatId);
        return true;
    }

    public List<String> getAllSeatStatuses() {
        return Arrays.stream(SeatStatus.values())
                .map(Enum::name)
                .toList();
    }

    private String normalizeSeatRow(String seatRow) {
        if (seatRow == null) {
            return null;
        }
        return seatRow.trim().toUpperCase();
    }


}

