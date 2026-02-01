package com.dev.cinemasystem.Service;


import com.dev.cinemasystem.Entity.RoomType;
import com.dev.cinemasystem.Exception.AppException;
import com.dev.cinemasystem.Exception.ErrorCode;
import com.dev.cinemasystem.Mapper.RoomTypeMapper;
import com.dev.cinemasystem.Repository.RoomTypeRepository;
import com.dev.cinemasystem.dto.apiDTO.PagingDto;
import com.dev.cinemasystem.dto.roomTypeDTO.RoomTypeCreationRequest;
import com.dev.cinemasystem.dto.roomTypeDTO.RoomTypeResponse;
import com.dev.cinemasystem.dto.roomTypeDTO.RoomTypeUpdateRequest;
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
public class RoomTypeService {

    RoomTypeMapper roomTypeMapper;

    RoomTypeRepository roomTypeRepository;




    public RoomTypeResponse  getRoomTypeById(Integer roomTypeId){
        var roomType = roomTypeRepository.findById(roomTypeId)
                .orElseThrow(() -> {
                    log.error("Room type with id {} not found", roomTypeId);
                    return new AppException(ErrorCode.ROOM_TYPE_NOT_FOUND);
                });
        log.info("Retrieving room type with id: {}", roomTypeId);
        return roomTypeMapper.toRoomTypeResponse(roomType);
    }

    public  RoomTypeResponse createRoomType(RoomTypeCreationRequest request){
        if(request == null){
            log.error("Room type creation request is null");
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }
        if(roomTypeRepository.findByRoomTypeName(request.getRoomTypeName()) != null){
            log.error("Room type name {} already exists", request.getRoomTypeName());
            throw new AppException(ErrorCode.ROOM_TYPE_NAME_EXISTS);
        }
        var roomType = roomTypeMapper.toRoomTypeFromRoomCreationRequest(request);
        roomType.setStatus(Status.active);
        log.info("Creating room type with name: {}", roomType.getRoomTypeName());
        return roomTypeMapper.toRoomTypeResponse(roomTypeRepository.save(roomType));
    }

    public PagingDto<RoomTypeResponse> getAllRoomTypes( Status status, Integer page, Integer size){
        if (page < 1) {
            log.error("Invalid page number: {}", page);
            throw new AppException(ErrorCode.INVALID_PAGE_NUMBER);
        }
        if (size < 1 ) {
            log.error("Invalid page size: {}", size);
            throw new AppException(ErrorCode.INVALID_PAGE_SIZE);
        }
        Pageable pageable = PageRequest.of(page - 1, size);
        Page<RoomType> roomTypePage;
        if(status != null){
            roomTypePage = roomTypeRepository.findAllByStatus(status, pageable);
        }else{
            roomTypePage = roomTypeRepository.findAll(pageable);
        }

        log.info("Fetching room types - page: {}, size: {}", page, size);
        List<RoomTypeResponse> roomTypeResponses = roomTypeMapper.toRoomTypeResponseList(roomTypePage.getContent());
        return  PagingDto.<RoomTypeResponse>builder()
                .items(roomTypeResponses)
                .currentPage(page)
                .pageSize(size)
                .totalItems(roomTypePage.getTotalElements())
                .totalPages(roomTypePage.getTotalPages())
                .build();
    }

    public RoomTypeResponse  updateRoomType(Integer roomTypeId, RoomTypeUpdateRequest request){
        var roomType = roomTypeRepository.findById(roomTypeId)
                .orElseThrow(() -> {
                    log.error("Room type with id {} not found", roomTypeId);
                    return new AppException(ErrorCode.ROOM_TYPE_NOT_FOUND);
                });
        if(request == null){
            log.error("Room type update request is null");
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }
        if(request.getRoomTypeName() != null){
            RoomType roomtype2 = roomTypeRepository.findByRoomTypeName(request.getRoomTypeName());
            if( roomtype2!= null && roomtype2.getRoomTypeId() != roomTypeId){
                log.error("Room type name {} already exists", request.getRoomTypeName());
                throw new AppException(ErrorCode.ROOM_TYPE_NAME_EXISTS);
            }
        }
        log.info("Updating room type with id: {}", roomTypeId);
        roomTypeMapper.updateRoomTypeInfo(roomType, request);
        return roomTypeMapper.toRoomTypeResponse(roomTypeRepository.save(roomType));

    }

    public boolean deleteRoomType(Integer roomTypeId){
        var room = roomTypeRepository.findById(roomTypeId)
                .orElseThrow(() -> {
                    log.error("roomTypeId with id {} not found", roomTypeId);
                    return new AppException(ErrorCode.ROOM_NOT_FOUND);
                });
        room.setStatus(Status.deleted);
        roomTypeRepository.save(room);
        log.info("Deleted room with id: {}", roomTypeId);
        return true;
    }


}
