package com.dev.cinemasystem.dto.roomTypeDTO;

import com.dev.cinemasystem.enums.RoomTypeStatus;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class RoomTypeResponse {
    Integer roomTypeId;

    String roomTypeName;

    String description;
    RoomTypeStatus status;
}

