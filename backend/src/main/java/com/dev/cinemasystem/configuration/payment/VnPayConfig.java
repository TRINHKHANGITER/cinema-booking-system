package com.dev.cinemasystem.configuration.payment;

import lombok.AccessLevel;
import lombok.Getter;
import lombok.Setter;
import lombok.experimental.FieldDefaults;
import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "vnpay")
@Getter
@Setter
@FieldDefaults(level = AccessLevel.PRIVATE)
public class VnPayConfig {
    String tmnCode;
    String hashSecret;
    String payUrl;
    String returnUrl;
    String ipnUrl; // webhook
    String version;
    String command;
    String currCode;
    String locale;
    String orderType;
}
