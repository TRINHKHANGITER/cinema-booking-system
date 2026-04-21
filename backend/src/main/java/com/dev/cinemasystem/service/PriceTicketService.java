package com.dev.cinemasystem.service;


import com.dev.cinemasystem.entity.PriceTicket;
import com.dev.cinemasystem.exception.AppException;
import com.dev.cinemasystem.exception.ErrorCode;
import com.dev.cinemasystem.mapper.PriceTicketMapper;
import com.dev.cinemasystem.repository.*;
import com.dev.cinemasystem.dto.priceTicketDTO.PriceTicketCreationResquest;
import com.dev.cinemasystem.dto.priceTicketDTO.PriceTicketResponse;
import com.dev.cinemasystem.enums.PriceTicketStatus;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import javax.print.DocFlavor;
import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class PriceTicketService {

    PriceTicketRepository priceTicketRepository;
    RoomTypeRepository roomTypeRepository;
    SeatTypeRepository seatTypeRepository;
    TicketTypeRepository ticketTypeRepository;
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

        var ticketType = ticketTypeRepository.findById(request.getTicketTypeId()).orElseThrow(() -> {
            log.error("ticket type with id {} not found", request.getTicketTypeId());
            return new AppException(ErrorCode.TICKET_TYPE_NOT_FOUND);
        });

        if(priceTicketRepository.findByRoomType_RoomTypeIdAndSeatType_SeatTypeIdAndTicketType_TicketTypeId(
                request.getRoomTypeId(),
                request.getSeatTypeId(),
                request.getTicketTypeId()
        ) != null){
            log.error("PriceTicket with RoomTypeId {}, SeatTypeId {} and TicketTypeId {} already exists",
                    request.getRoomTypeId(),
                    request.getSeatTypeId(),
                    request.getTicketTypeId()
            );
            throw new AppException(ErrorCode.PRICE_TICKET_EXISTS);
        }
        var priceTicketType = priceTicketMapper.toPriceTicketFromPriceTicketCreationRequest(request);
        priceTicketType.setStatus(PriceTicketStatus.ACTIVE);
        priceTicketType.setRoomType(roomType);
        priceTicketType.setSeatType(seatType);
        priceTicketType.setTicketType(ticketType);
        log.info("Creating priceTicket with RoomTypeId {}, SeatTypeId {} and TicketTypeId {}",
                request.getRoomTypeId(),
                request.getSeatTypeId(),
                request.getTicketTypeId());
        return priceTicketMapper.toPriceTicketResponse(priceTicketRepository.save(priceTicketType));
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

        var ticketType = ticketTypeRepository.findById(request.getTicketTypeId()).orElseThrow(() -> {
            log.error("ticket type with id {} not found", request.getTicketTypeId());
            return new AppException(ErrorCode.TICKET_TYPE_NOT_FOUND);
        });

        var existingPriceTicket = priceTicketRepository.findByRoomType_RoomTypeIdAndSeatType_SeatTypeIdAndTicketType_TicketTypeId(
                request.getRoomTypeId(),
                request.getSeatTypeId(),
                request.getTicketTypeId()
        );
        if( existingPriceTicket!= null && existingPriceTicket.getPriceTicketId() != priceTicketId){
            log.error("PriceTicket with RoomTypeId {}, SeatTypeId {} and TicketTypeId {} already exists",
                    request.getRoomTypeId(),
                    request.getSeatTypeId(),
                    request.getTicketTypeId()
            );
            throw new AppException(ErrorCode.PRICE_TICKET_EXISTS);

        }
        priceTicket.setPrice(request.getPrice());
        priceTicket.setRoomType(roomType);
        priceTicket.setSeatType(seatType);
        priceTicket.setTicketType(ticketType);
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

    public BigDecimal getPriceByRoomTypeIdAndSeatTypeIdAndTicketTypeId(int roomTypeId, int seatTypeId, int ticketTypeId) {
        PriceTicket ticket = priceTicketRepository.findByRoomType_RoomTypeIdAndSeatType_SeatTypeIdAndTicketType_TicketTypeId(roomTypeId, seatTypeId, ticketTypeId);
        return BigDecimal.valueOf(ticket.getPrice());
    }


}

