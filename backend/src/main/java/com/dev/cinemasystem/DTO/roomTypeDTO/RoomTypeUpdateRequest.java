package com.dev.cinemasystem.dto.roomTypeDTO;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class RoomTypeUpdateRequest {

    String roomTypeName;

    String description;

}
