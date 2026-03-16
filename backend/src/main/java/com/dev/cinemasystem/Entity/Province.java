package com.dev.cinemasystem.Entity;

import com.dev.cinemasystem.enums.GioiTinh;
import com.dev.cinemasystem.enums.Role;
import com.dev.cinemasystem.enums.Status;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;

@Entity
@Table(name = "province")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Province {

    @Id
    Integer code;
    @Column(nullable = false)
    String name;
}
