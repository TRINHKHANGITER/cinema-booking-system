package com.dev.cinemasystem.Controller;


import com.dev.cinemasystem.Service.RoomService;
import com.dev.cinemasystem.dto.apiDTO.ApiResponse;
import com.dev.cinemasystem.dto.apiDTO.PagingDto;
import com.dev.cinemasystem.dto.roomDTO.RoomCreationResquest;
import com.dev.cinemasystem.dto.roomDTO.RoomResponse;
import com.dev.cinemasystem.enums.Status;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/room")
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class RoomController {
    RoomService roomService;


    @GetMapping("/{roomId}")
    public ApiResponse<RoomResponse> getRoomById(@PathVariable Integer roomId    ) {
        return ApiResponse.<RoomResponse>builder()
                .message("Room retrieved successfully")
                .result(roomService.getRoomById(roomId))
                .build();
    }

    @PostMapping
    public ApiResponse<RoomResponse> createRoom(@RequestBody RoomCreationResquest request) {
        return ApiResponse.<RoomResponse>builder()
                .message("Room created successfully")
                .result(roomService.createRoom(request))
                .build();
    }

    @GetMapping("/all/{cinemaId}")
    public ApiResponse<PagingDto<RoomResponse>> getAllRooms(
            @RequestParam (required = false) Integer cinemaId,
            @RequestParam (required = false) Integer roomTypeId,
            @RequestParam (required = false)Status status,
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer size

    ) {
        return ApiResponse.<PagingDto<RoomResponse>>builder()
                .message("Rooms retrieved successfully")
                .result(roomService.getAllrooms(cinemaId, roomTypeId, status,page, size))
                .build();
    }

    @PatchMapping("/{roomId}")
    public ApiResponse<RoomResponse> updateRoom(@PathVariable Integer roomId, @RequestBody RoomCreationResquest request) {
        return ApiResponse.<RoomResponse>builder()
                .message("Room updated successfully")
                .result(roomService.updateRoom(roomId, request))
                .build();
    }




    @DeleteMapping("/{roomId}")
    public ApiResponse<Boolean> deleteRoom(@PathVariable Integer roomId) {
        return ApiResponse.<Boolean>builder()
                .result(roomService.deleteRoom(roomId))
                .message("Room deleted successfully")
                .build();
    }

}
