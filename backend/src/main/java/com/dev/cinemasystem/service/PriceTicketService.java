package com.dev.cinemasystem.service;


import com.dev.cinemasystem.entity.PriceTicket;
import com.dev.cinemasystem.dto.priceTicketDTO.PriceTicketCreationResquest;
import com.dev.cinemasystem.dto.priceTicketDTO.PriceTicketResponse;
import com.dev.cinemasystem.exception.AppException;
import com.dev.cinemasystem.exception.ErrorCode;
import com.dev.cinemasystem.mapper.PriceTicketMapper;
import com.dev.cinemasystem.repository.PriceTicketRepository;
import com.dev.cinemasystem.repository.RoomTypeRepository;
import com.dev.cinemasystem.repository.SeatTypeRepository;
import com.dev.cinemasystem.enums.PriceTicketStatus;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class PriceTicketService {

    PriceTicketRepository priceTicketRepository;
    RoomTypeRepository roomTypeRepository;
    SeatTypeRepository seatTypeRepository;
    PriceTicketMapper priceTicketMapper;

    public PriceTicketResponse getPriceTicketById(Integer priceTicketId){
        var priceTicket = priceTicketRepository.findById(priceTicketId)
                .orElseThrow(() -> {
                    log.error("PriceTicket with id {} not found", priceTicketId);
                    return new AppException(ErrorCode.PRICE_TICKET_NOT_FOUND);
                });
        log.info("Retrieving priceTicket with id: {}", priceTicketId);
        return priceTicketMapper.toPriceTicketResponse(priceTicket);
    }

    public  PriceTicketResponse createPriceTicket(PriceTicketCreationResquest request){
        if(request == null){
            log.error("PriceTicket creation request is null");
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }

        var roomType = roomTypeRepository.findById(request.getRoomTypeId()).orElseThrow(() -> {
            log.error("Room type with id {} not found", request.getRoomTypeId());
            return new AppException(ErrorCode.ROOM_TYPE_NOT_FOUND);
        });

        var seatType = seatTypeRepository.findById(request.getSeatTypeId()).orElseThrow(() -> {
            log.error("Seat type with id {} not found", request.getSeatTypeId());
            return new AppException(ErrorCode.SEAT_TYPE_NOT_FOUND);
        });

        if(priceTicketRepository.findByRoomType_RoomTypeIdAndSeatType_SeatTypeId(
                request.getRoomTypeId(),
                request.getSeatTypeId()
        ) != null){
            log.error("PriceTicket with RoomTypeId {} and SeatTypeId {} already exists",
                    request.getRoomTypeId(),
                    request.getSeatTypeId()
            );
            throw new AppException(ErrorCode.PRICE_TICKET_EXISTS);
        }
        var priceTicket = priceTicketMapper.toPriceTicketFromPriceTicketCreationRequest(request);
        priceTicket.setStatus(PriceTicketStatus.ACTIVE);
        priceTicket.setRoomType(roomType);
        priceTicket.setSeatType(seatType);
        log.info("Creating priceTicket with RoomTypeId {} and SeatTypeId {}",
                request.getRoomTypeId(),
                request.getSeatTypeId());
        return priceTicketMapper.toPriceTicketResponse(priceTicketRepository.save(priceTicket));
    }


    public PriceTicketResponse  updatePriceTicket(Integer priceTicketId, PriceTicketCreationResquest request){

        if(request == null){
            log.error("PriceTicket update request is null");
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }

        var priceTicket = priceTicketRepository.findById(priceTicketId)
                .orElseThrow(() -> {
                    log.error("PriceTicket with id {} not found", priceTicketId);
                    return new AppException(ErrorCode.MOVIE_NOT_FOUND);
                });
        var roomType = roomTypeRepository.findById(request.getRoomTypeId()).orElseThrow(() -> {
            log.error("Room type with id {} not found", request.getRoomTypeId());
            return new AppException(ErrorCode.ROOM_TYPE_NOT_FOUND);
        });
        var seatType = seatTypeRepository.findById(request.getSeatTypeId()).orElseThrow(() -> {
            log.error("Seat type with id {} not found", request.getSeatTypeId());
            return new AppException(ErrorCode.SEAT_TYPE_NOT_FOUND);
        });

        var existingPriceTicket = priceTicketRepository.findByRoomType_RoomTypeIdAndSeatType_SeatTypeId(
                request.getRoomTypeId(),
                request.getSeatTypeId()
        );
        if( existingPriceTicket!= null && existingPriceTicket.getPriceTicketId() != priceTicketId){
            log.error("PriceTicket with RoomTypeId {} and SeatTypeId {} already exists",
                    request.getRoomTypeId(),
                    request.getSeatTypeId()
            );
            throw new AppException(ErrorCode.PRICE_TICKET_EXISTS);

        }
        priceTicket.setPrice(request.getPrice());
        priceTicket.setRoomType(roomType);
        priceTicket.setSeatType(seatType);
        log.info("Updating priceTicket with id: {}", priceTicketId);
        return priceTicketMapper.toPriceTicketResponse(priceTicketRepository.save(priceTicket));
    }

    public boolean deletePriceTicket(Integer priceTicketId){
        var priceTicket = priceTicketRepository.findById(priceTicketId)
                .orElseThrow(() -> {
                    log.error("PriceTicket with id {} not found", priceTicketId);
                    return new AppException(ErrorCode.MOVIE_NOT_FOUND);
                });
        priceTicket.setStatus(PriceTicketStatus.INACTIVE);
        priceTicketRepository.save(priceTicket);
        log.info("Deleted priceTicket with id: {}", priceTicketId);
        return true;
    }

    public BigDecimal getPriceByRoomTypeIdAndSeatTypeId(int roomTypeId, int seatTypeId) {
        PriceTicket ticket = priceTicketRepository.findByRoomType_RoomTypeIdAndSeatType_SeatTypeId(roomTypeId, seatTypeId);
        if (ticket == null) {
            throw new AppException(ErrorCode.PRICE_TICKET_NOT_FOUND);
        }
        return ticket.getPrice();
    }


}

