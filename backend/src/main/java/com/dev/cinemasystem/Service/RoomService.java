package com.dev.cinemasystem.Service;


import com.dev.cinemasystem.Entity.Room;
import com.dev.cinemasystem.Exception.AppException;
import com.dev.cinemasystem.Exception.ErrorCode;
import com.dev.cinemasystem.Mapper.RoomMapper;
import com.dev.cinemasystem.Repository.CinemaRepository;
import com.dev.cinemasystem.Repository.RoomRepository;
import com.dev.cinemasystem.Repository.RoomTypeRepository;
import com.dev.cinemasystem.dto.apiDTO.PagingDto;
import com.dev.cinemasystem.dto.roomDTO.RoomCreationResquest;
import com.dev.cinemasystem.dto.roomDTO.RoomResponse;
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
public class RoomService {

    RoomRepository roomRepository;
    RoomMapper roomMapper;
    CinemaRepository cinemaRepository;
    RoomTypeRepository roomTypeRepository;




    public RoomResponse getRoomById(Integer roomId){
        var room = roomRepository.findById(roomId)
                .orElseThrow(() -> {
                    log.error("Room with id {} not found", roomId);
                    return new AppException(ErrorCode.ROOM_NOT_FOUND);
                });
        log.info("Retrieving room with id: {}", roomId);
        return roomMapper.toRoomResponse(room);
    }

    public  RoomResponse createRoom(RoomCreationResquest request){
        if(request == null){
            log.error("Room creation request is null");
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }
        var cinema = cinemaRepository.findById(request.getCinemaId()).orElseThrow(() -> {
            log.error("Cinema with id {} not found", request.getCinemaId());
            return new AppException(ErrorCode.CINEMA_NOT_FOUND);
        });
        var roomType = roomTypeRepository.findById(request.getRoomTypeId()).orElseThrow(() -> {
            log.error("Room type with id {} not found", request.getRoomTypeId());
            return new AppException(ErrorCode.ROOM_TYPE_NOT_FOUND);
        });

        var room = roomMapper.toRoomFromRoomCreationRequest(request);
        room.setCinema(cinema);
        room.setRoomType(roomType);
        room.setStatus(Status.active);
        roomRepository.save(room);
        log.info("Creating room with name: {}", room.getRoomName());
        return roomMapper.toRoomResponse(roomRepository.save(room));
    }

    public PagingDto<RoomResponse> getAllrooms(Integer cinemaId, Integer roomTypeId, Status status, Integer page, Integer size){
        if (page < 1) {
            log.error("Invalid page number: {}", page);
            throw new AppException(ErrorCode.INVALID_PAGE_NUMBER);
        }
        if (size < 1 ) {
            log.error("Invalid page size: {}", size);
            throw new AppException(ErrorCode.INVALID_PAGE_SIZE);
        }
        Pageable pageable = PageRequest.of(page - 1, size);
        Page<Room> roomPage ;
        if (cinemaId != null && roomTypeId != null) {
            roomPage = roomRepository.findAllByCinema_CinemaIdAndRoomType_RoomTypeIdAndStatus(cinemaId, roomTypeId, status, pageable);
        } else if (cinemaId != null) {
            roomPage = roomRepository.findAllByCinema_CinemaIdAndStatus(cinemaId, status, pageable);
        } else if (roomTypeId != null) {
            roomPage = roomRepository.findAllByRoomType_RoomTypeIdAndStatus(roomTypeId, status, pageable);
        } else {
            roomPage = roomRepository.findAllByStatus( status, pageable);
        }

        log.info("Fetching rooms - page: {}, size: {}", page, size);
        List<RoomResponse> roomResponses = roomMapper.toRoomResponseList(roomPage.getContent());
        return  PagingDto.<RoomResponse>builder()
                .items(roomResponses)
                .currentPage(page)
                .pageSize(size)
                .totalItems(roomPage.getTotalElements())
                .totalPages(roomPage.getTotalPages())
                .build();
    }

    public RoomResponse  updateRoom(Integer roomId, RoomCreationResquest request){
        var room = roomRepository.findById(roomId)
                .orElseThrow(() -> {
                    log.error("Room with id {} not found", roomId);
                    return new AppException(ErrorCode.ROOM_NOT_FOUND);
                });
        var cinema = cinemaRepository.findById(request.getCinemaId()).orElseThrow(() -> {
            log.error("Cinema with id {} not found", request.getCinemaId());
            return new AppException(ErrorCode.CINEMA_NOT_FOUND);
        });
        var roomType = roomTypeRepository.findById(request.getRoomTypeId()).orElseThrow(() -> {
            log.error("Room type with id {} not found", request.getRoomTypeId());
            return new AppException(ErrorCode.ROOM_TYPE_NOT_FOUND);
        });
        room.setRoomName(request.getRoomName());
        room.setCinema(cinema);
        room.setRoomType(roomType);
        room.setCapacity(request.getCapacity());
        log.info("Updating room with id: {}", roomId);
        return roomMapper.toRoomResponse(roomRepository.save(room));
    }

    public boolean deleteRoom(Integer roomId){
        var room = roomRepository.findById(roomId)
                .orElseThrow(() -> {
                    log.error("Room with id {} not found", roomId);
                    return new AppException(ErrorCode.ROOM_NOT_FOUND);
                });
        room.setStatus(Status.deleted);
        roomRepository.save(room);
        log.info("Deleted room with id: {}", roomId);
        return true;
    }


}
