package com.dev.cinemasystem.configuration.gemini;

import lombok.AccessLevel;
import lombok.Getter;
import lombok.Setter;
import lombok.experimental.FieldDefaults;
import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "gemini.api")
@Getter
@Setter
@FieldDefaults(level = AccessLevel.PRIVATE)
public class GeminiApiProperties {
    String key;
    String url;
}
