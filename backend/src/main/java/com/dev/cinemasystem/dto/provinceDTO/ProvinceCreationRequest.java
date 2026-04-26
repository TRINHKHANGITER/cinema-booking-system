package com.dev.cinemasystem.dto.provinceDTO;

import com.dev.cinemasystem.enums.ProvinceStatus;
import jakarta.validation.constraints.NotBlank;
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
public class ProvinceCreationRequest {

    @NotBlank(message = "PROVINCE_NAME_BLANK")
    String provinceName;

    ProvinceStatus status;
}
