package com.dev.cinemasystem.Controller;


import com.dev.cinemasystem.Service.RoomTypeService;
import com.dev.cinemasystem.dto.apiDTO.ApiResponse;
import com.dev.cinemasystem.dto.apiDTO.PagingDto;
import com.dev.cinemasystem.dto.roomDTO.RoomCreationResquest;
import com.dev.cinemasystem.dto.roomTypeDTO.RoomTypeCreationRequest;
import com.dev.cinemasystem.dto.roomTypeDTO.RoomTypeResponse;
import com.dev.cinemasystem.dto.roomTypeDTO.RoomTypeUpdateRequest;
import com.dev.cinemasystem.enums.RoomTypeStatus;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/room-type")
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class RoomTypeController {
    RoomTypeService roomTypeService;


    @GetMapping("/{roomTypeId}")
    public ApiResponse<RoomTypeResponse> getRoomTypeById(@PathVariable Integer roomTypeId    ) {
        return ApiResponse.<RoomTypeResponse>builder()
                .message("Room retrieved successfully")
                .result(roomTypeService.getRoomTypeById(roomTypeId))
                .build();
    }

    @PostMapping
    public ApiResponse<RoomTypeResponse> createRoom(@RequestBody RoomTypeCreationRequest request) {
        return ApiResponse.<RoomTypeResponse>builder()
                .message("Room created successfully")
                .result(roomTypeService.createRoomType(request))
                .build();
    }

    @GetMapping("/all")
    public ApiResponse<PagingDto<RoomTypeResponse>> getAllRooms(
            @RequestParam (required = false)RoomTypeStatus status,
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer size

    ) {
        return ApiResponse.<PagingDto<RoomTypeResponse>>builder()
                .message("Rooms retrieved successfully")
                .result(roomTypeService.getAllRoomTypes(status,page, size))
                .build();
    }

    @PatchMapping("/{roomTypeId}")
    public ApiResponse<RoomTypeResponse> updateRoom(@PathVariable Integer roomTypeId, @RequestBody RoomTypeUpdateRequest request) {
        return ApiResponse.<RoomTypeResponse>builder()
                .message("Room updated successfully")
                .result(roomTypeService.updateRoomType(roomTypeId, request))
                .build();
    }




    @DeleteMapping("/{roomTypeId}")
    public ApiResponse<Boolean> deleteRoom(@PathVariable Integer roomTypeId) {
        return ApiResponse.<Boolean>builder()
                .result(roomTypeService.deleteRoomType(roomTypeId))
                .message("Room deleted successfully")
                .build();
    }

}

