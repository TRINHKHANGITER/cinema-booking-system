package com.dev.cinemasystem.configuration.booking;

import lombok.AccessLevel;
import lombok.Getter;
import lombok.Setter;
import lombok.experimental.FieldDefaults;
import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.booking")
@Getter
@Setter
@FieldDefaults(level = AccessLevel.PRIVATE)
public class BookingProperties {
    long holdMinutes = 5;
}
