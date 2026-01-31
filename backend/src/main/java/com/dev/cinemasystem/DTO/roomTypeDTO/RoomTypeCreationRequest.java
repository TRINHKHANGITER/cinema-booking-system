package com.dev.cinemasystem.dto.roomTypeDTO;

import jakarta.validation.constraints.NotBlank;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class RoomTypeCreationRequest {

    @NotBlank(message = "ROOM_TYPE_NAME_BLANK")
    String roomTypeName;

    @NotBlank(message = "DESCRIPTION_BLANK")
    String description;

}
