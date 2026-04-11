package com.dev.cinemasystem.Service;


import com.dev.cinemasystem.Entity.Seat;
import com.dev.cinemasystem.Exception.AppException;
import com.dev.cinemasystem.Exception.ErrorCode;
import com.dev.cinemasystem.Mapper.SeatMapper;
import com.dev.cinemasystem.Repository.RoomRepository;
import com.dev.cinemasystem.Repository.SeatRepository;
import com.dev.cinemasystem.Repository.SeatTypeRepository;
import com.dev.cinemasystem.dto.apiDTO.PagingDto;
import com.dev.cinemasystem.dto.seatDTO.SeatCreationResquest;
import com.dev.cinemasystem.dto.seatDTO.SeatResponse;
import com.dev.cinemasystem.enums.Status;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

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




    public SeatResponse getSeatById(Integer seatId){
        var seat = seatRepository.findById(seatId)
                .orElseThrow(() -> {
                    log.error("Seat with id {} not found", seatId);
                    return new AppException(ErrorCode.ROOM_NOT_FOUND);
                });
        log.info("Retrieving seat with id: {}", seatId);
        return seatMapper.toSeatResponse(seat);
    }

    public  SeatResponse createSeat(SeatCreationResquest request){
        if(request == null){
            log.error("Seat creation request is null");
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }
        var room = roomRepository.findById(request.getRoomId()).orElseThrow(() -> {
            log.error("Room with id {} not found", request.getRoomId());
            return new AppException(ErrorCode.ROOM_NOT_FOUND);
        });
        var seatType = seatTypeRepository.findById(request.getSeatTypeId()).orElseThrow(() -> {
            log.error("Seat type with id {} not found", request.getSeatTypeId());
            return new AppException(ErrorCode.ROOM_TYPE_NOT_FOUND);
        });

        if(seatRepository.existsBySeatRowAndSeatColumnAndRoom_RoomId(request.getSeatRow(), request.getSeatColumn(), request.getRoomId())){
            log.error("Seat at seatRow {} and seatColumn {} already exists in room id {}", request.getSeatRow(), request.getSeatColumn(), request.getRoomId());
            throw new AppException(ErrorCode.SEAT_ALREADY_EXISTS_IN_ROOM);
        }

        var seat = seatMapper.toSeatFromSeatCreationRequest(request);
        seat.setRoom(room);
        seat.setSeatType(seatType);
        seat.setStatus(Status.ACTIVE);
        seatRepository.save(seat);
        log.info("Creating seat in room id: {} with seat type id: {}", room.getRoomId(), seatType.getSeatTypeId());
        return seatMapper.toSeatResponse(seatRepository.save(seat));
    }

    public PagingDto<SeatResponse> getAllseats(Integer roomId, Integer seatTypeId, Status status, Integer page, Integer size){
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
        var seat = seatRepository.findById(seatId)
                .orElseThrow(() -> {
                    log.error("Seat with id {} not found", seatId);
                    return new AppException(ErrorCode.ROOM_NOT_FOUND);
                });
        var room = roomRepository.findById(request.getRoomId()).orElseThrow(() -> {
            log.error("Room with id {} not found", request.getRoomId());
            return new AppException(ErrorCode.ROOM_NOT_FOUND);
        });
        var seatType = seatTypeRepository.findById(request.getSeatTypeId()).orElseThrow(() -> {
            log.error("Seat type with id {} not found", request.getSeatTypeId());
            return new AppException(ErrorCode.ROOM_TYPE_NOT_FOUND);
        });

        var existingSeat = seatRepository.findBySeatRowAndSeatColumnAndRoom_RoomId(
                request.getSeatRow(), request.getSeatColumn(), request.getRoomId());
        if(existingSeat.isPresent() && !existingSeat.get().getSeatId().equals(seatId)){
            log.error("Seat at seatRow {} and seatColumn {} already exists in room id {}", request.getSeatRow(), request.getSeatColumn(), request.getRoomId());
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
                    return new AppException(ErrorCode.ROOM_NOT_FOUND);
                });
        seat.setStatus(Status.BLOCKED);
        seatRepository.save(seat);
        log.info("Deleted seat with id: {}", seatId);
        return true;
    }


}
