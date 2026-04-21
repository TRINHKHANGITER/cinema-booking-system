package com.dev.cinemasystem.service;


import com.dev.cinemasystem.entity.SeatType;
import com.dev.cinemasystem.exception.AppException;
import com.dev.cinemasystem.exception.ErrorCode;
import com.dev.cinemasystem.mapper.SeatTypeMapper;
import com.dev.cinemasystem.repository.SeatTypeRepository;
import com.dev.cinemasystem.dto.apiDTO.PagingDto;
import com.dev.cinemasystem.dto.seatTypeDTO.SeatTypeCreationRequest;
import com.dev.cinemasystem.dto.seatTypeDTO.SeatTypeResponse;
import com.dev.cinemasystem.dto.seatTypeDTO.SeatTypeUpdateRequest;
import com.dev.cinemasystem.enums.SeatTypeStatus;
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
public class SeatTypeService {

    SeatTypeMapper seatTypeMapper;

    SeatTypeRepository seatTypeRepository;




    public SeatTypeResponse  getSeatTypeById(Integer seatTypeId){
        var seatType = seatTypeRepository.findById(seatTypeId)
                .orElseThrow(() -> {
                    log.error("Seat type with id {} not found", seatTypeId);
                    return new AppException(ErrorCode.SEAT_TYPE_NOT_FOUND);
                });
        log.info("Retrieving seat type with id: {}", seatTypeId);
        return seatTypeMapper.toSeatTypeResponse(seatType);
    }

    public  SeatTypeResponse createSeatType(SeatTypeCreationRequest request){
        if(request == null){
            log.error("Seat type creation request is null");
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }
        if(seatTypeRepository.findBySeatTypeName(request.getSeatTypeName()) != null){
            log.error("Seat type name {} already exists", request.getSeatTypeName());
            throw new AppException(ErrorCode.SEAT_TYPE_NAME_EXISTS);
        }
        var seatType = seatTypeMapper.toSeatTypeFromSeatCreationRequest(request);
        seatType.setStatus(SeatTypeStatus.ACTIVE);
        log.info("Creating seat type with name: {}", seatType.getSeatTypeName());
        return seatTypeMapper.toSeatTypeResponse(seatTypeRepository.save(seatType));
    }

    public PagingDto<SeatTypeResponse> getAllSeatTypes( SeatTypeStatus status, Integer page, Integer size){
        if (page < 1) {
            log.error("Invalid page number: {}", page);
            throw new AppException(ErrorCode.INVALID_PAGE_NUMBER);
        }
        if (size < 1 ) {
            log.error("Invalid page size: {}", size);
            throw new AppException(ErrorCode.INVALID_PAGE_SIZE);
        }
        Pageable pageable = PageRequest.of(page - 1, size);
        Page<SeatType> seatTypePage;
        if(status != null){
            seatTypePage = seatTypeRepository.findAllByStatus(status, pageable);
        }else{
            seatTypePage = seatTypeRepository.findAll(pageable);
        }

        log.info("Fetching seat types - page: {}, size: {}", page, size);
        List<SeatTypeResponse> seatTypeResponses = seatTypeMapper.toSeatTypeResponseList(seatTypePage.getContent());
        return  PagingDto.<SeatTypeResponse>builder()
                .items(seatTypeResponses)
                .currentPage(page)
                .pageSize(size)
                .totalItems(seatTypePage.getTotalElements())
                .totalPages(seatTypePage.getTotalPages())
                .build();
    }

    public SeatTypeResponse  updateSeatType(Integer seatTypeId, SeatTypeUpdateRequest request){
        var seatType = seatTypeRepository.findById(seatTypeId)
                .orElseThrow(() -> {
                    log.error("Seat type with id {} not found", seatTypeId);
                    return new AppException(ErrorCode.SEAT_TYPE_NOT_FOUND);
                });
        if(request == null){
            log.error("Seat type update request is null");
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }
        if(request.getSeatTypeName() != null){
            SeatType seattype2 = seatTypeRepository.findBySeatTypeName(request.getSeatTypeName());
            if( seattype2!= null && seattype2.getSeatTypeId() != seatTypeId){
                log.error("Seat type name {} already exists", request.getSeatTypeName());
                throw new AppException(ErrorCode.SEAT_TYPE_NAME_EXISTS);
            }
        }
        log.info("Updating seat type with id: {}", seatTypeId);
        seatTypeMapper.updateSeatTypeInfo(seatType, request);
        return seatTypeMapper.toSeatTypeResponse(seatTypeRepository.save(seatType));

    }

    public boolean deleteSeatType(Integer seatTypeId){
        var seat = seatTypeRepository.findById(seatTypeId)
                .orElseThrow(() -> {
                    log.error("seatTypeId with id {} not found", seatTypeId);
                    return new AppException(ErrorCode.SEAT_NOT_FOUND);
                });
        seat.setStatus(SeatTypeStatus.INACTIVE);
        seatTypeRepository.save(seat);
        log.info("Deleted seat with id: {}", seatTypeId);
        return true;
    }


}

