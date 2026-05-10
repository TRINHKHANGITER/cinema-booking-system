package com.dev.cinemasystem.controller;


import com.dev.cinemasystem.service.RoomService;
import com.dev.cinemasystem.dto.apiDTO.ApiResponse;
import com.dev.cinemasystem.dto.apiDTO.ItemListDto;
import com.dev.cinemasystem.dto.apiDTO.PagingDto;
import com.dev.cinemasystem.dto.roomDTO.RoomCreationResquest;
import com.dev.cinemasystem.dto.roomDTO.RoomResponse;
import com.dev.cinemasystem.dto.roomDTO.RoomUpdateResquest;
import com.dev.cinemasystem.enums.RoomStatus;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;


import java.util.List;

@RestController
@RequestMapping("/room")
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class RoomController {
    RoomService roomService;

    @GetMapping
    public ApiResponse<ItemListDto<RoomResponse>> getRoomsAsItemList(
            @RequestParam(required = false) Integer cinemaId,
            @RequestParam(required = false) RoomStatus status
    ) {
        return ApiResponse.<ItemListDto<RoomResponse>>builder()
                .message("Láº¥y danh sÃ¡ch phÃ²ng thÃ nh cÃ´ng")
                .result(ItemListDto.<RoomResponse>builder()
                        .items(roomService.getRooms(cinemaId, status))
                        .build())
                .build();
    }

    @GetMapping("/{roomId}")
    public ApiResponse<RoomResponse> getRoomById(@PathVariable Integer roomId    ) {
        return ApiResponse.<RoomResponse>builder()
                .message("Láº¥y thÃ´ng tin phÃ²ng thÃ nh cÃ´ng")
                .result(roomService.getRoomById(roomId))
                .build();
    }

    @PostMapping
    public ApiResponse<RoomResponse> createRoom(@RequestBody @Valid RoomCreationResquest request) {
        return ApiResponse.<RoomResponse>builder()
                .message("Táº¡o phÃ²ng thÃ nh cÃ´ng")
                .result(roomService.createRoom(request))
                .build();
    }

    @GetMapping("/filter")
    public ApiResponse<PagingDto<RoomResponse>> filterRooms(
            @RequestParam(required = false) Integer roomId,
            @RequestParam(required = false) Integer provinceId,
            @RequestParam(required = false) Integer cinemaId,
            @RequestParam(required = false) Integer roomTypeId,
            @RequestParam(required = false, name = "roomType") Integer roomType,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) RoomStatus status,
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer size
    ) {
        Integer resolvedRoomTypeId = roomTypeId != null ? roomTypeId : roomType;
        return ApiResponse.<PagingDto<RoomResponse>>builder()
                .message("Láº¥y danh sÃ¡ch phÃ²ng thÃ nh cÃ´ng")
                .result(roomService.filterRooms(roomId, provinceId, cinemaId, resolvedRoomTypeId, name, status, page, size))
                .build();
    }

    @GetMapping("/statuses")
    public ApiResponse<ItemListDto<String>> getAllRoomStatuses() {
        List<String> statuses = roomService.getAllRoomStatuses();
        return ApiResponse.<ItemListDto<String>>builder()
                .message("Láº¥y danh sÃ¡ch tráº¡ng thÃ¡i phÃ²ng thÃ nh cÃ´ng")
                .result(ItemListDto.<String>builder().items(statuses).build())
                .build();
    }

    @PatchMapping("/{roomId}")
    public ApiResponse<RoomResponse> updateRoom(@PathVariable Integer roomId, @RequestBody @Valid RoomUpdateResquest request) {
        return ApiResponse.<RoomResponse>builder()
                .message("Cáº­p nháº­t phÃ²ng thÃ nh cÃ´ng")
                .result(roomService.updateRoom(roomId, request))
                .build();
    }




    @DeleteMapping("/{roomId}")
    public ApiResponse<Boolean> deleteRoom(@PathVariable Integer roomId) {
        return ApiResponse.<Boolean>builder()
                .result(roomService.deleteRoom(roomId))
                .message("XÃ³a phÃ²ng thÃ nh cÃ´ng")
                .build();
    }

}


