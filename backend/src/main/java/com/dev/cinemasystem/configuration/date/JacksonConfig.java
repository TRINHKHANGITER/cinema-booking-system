package com.dev.cinemasystem.configuration.date;

import com.fasterxml.jackson.databind.module.SimpleModule;
import com.fasterxml.jackson.datatype.jsr310.deser.LocalDateDeserializer;
import com.fasterxml.jackson.datatype.jsr310.deser.LocalDateTimeDeserializer;
import com.fasterxml.jackson.datatype.jsr310.deser.LocalTimeDeserializer;
import com.fasterxml.jackson.datatype.jsr310.ser.LocalDateSerializer;
import com.fasterxml.jackson.datatype.jsr310.ser.LocalDateTimeSerializer;
import com.fasterxml.jackson.datatype.jsr310.ser.LocalTimeSerializer;
import lombok.AccessLevel;
import lombok.experimental.FieldDefaults;
import org.springframework.boot.autoconfigure.jackson.Jackson2ObjectMapperBuilderCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;

@Configuration
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class JacksonConfig {
    static String DATE_FORMAT = "yyyy-MM-dd";
    static String TIME_FORMAT = "HH:mm:ss";
    static String DATE_TIME_FORMAT = "yyyy-MM-dd HH:mm:ss";

    @Bean
    public Jackson2ObjectMapperBuilderCustomizer jsonMapperBuilderCustomizer() {
        return jacksonObjectMapperBuilder -> {
            DateTimeFormatter dateTimeFormatter =
                    DateTimeFormatter.ofPattern(DATE_TIME_FORMAT);

            SimpleModule simpleModule = new SimpleModule();

            simpleModule.addSerializer(
                    LocalTime.class,
                    new LocalTimeSerializer(DateTimeFormatter.ofPattern(TIME_FORMAT))
            );

            simpleModule.addSerializer(
                    LocalDate.class,
                    new LocalDateSerializer(DateTimeFormatter.ofPattern(DATE_FORMAT))
            );

            simpleModule.addSerializer(
                    LocalDateTime.class,
                    new LocalDateTimeSerializer(dateTimeFormatter)
            );



            simpleModule.addDeserializer(
                    LocalTime.class,
                    new LocalTimeDeserializer(DateTimeFormatter.ofPattern(TIME_FORMAT))
            );

            simpleModule.addDeserializer(
                    LocalDate.class,
                    new LocalDateDeserializer(DateTimeFormatter.ofPattern(DATE_FORMAT))
            );

            simpleModule.addDeserializer(
                    LocalDateTime.class,
                    new LocalDateTimeDeserializer(dateTimeFormatter)
            );

            jacksonObjectMapperBuilder.modules(simpleModule);
        };
    }
}