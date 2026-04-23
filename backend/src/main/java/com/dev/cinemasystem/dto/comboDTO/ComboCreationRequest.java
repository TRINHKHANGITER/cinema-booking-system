package com.dev.cinemasystem.dto.comboDTO;

import com.dev.cinemasystem.enums.ComboStatus;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
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
public class ComboCreationRequest {
    @NotBlank(message = "COMBO_NAME_BLANK")
    String comboName;

    MultipartFile image;

    @NotBlank(message = "DESCRIPTION_BLANK")
    String description;

    @NotNull(message = "PRICE_BLANK")
    @DecimalMin(value = "0", message = "PRICE_INVALID")
    BigDecimal price;

    ComboStatus status;
}

