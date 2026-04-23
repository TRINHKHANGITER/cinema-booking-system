package com.dev.cinemasystem.dto.comboDTO;

import com.dev.cinemasystem.enums.ComboStatus;
import jakarta.validation.constraints.DecimalMin;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ComboUpdateRequest {
    String comboName;

    MultipartFile image;

    String description;

    @DecimalMin(value = "0", message = "PRICE_INVALID")
    BigDecimal price;

    ComboStatus status;
}

