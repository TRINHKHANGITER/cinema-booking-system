package com.dev.cinemasystem.dto.orderCombo;

import com.dev.cinemasystem.enums.ComboDetailStatus;
import jakarta.validation.constraints.NotNull;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class OrderComboStatusUpdateRequest {
    @NotNull(message = "INVALID_REQUEST")
    ComboDetailStatus status;
}
