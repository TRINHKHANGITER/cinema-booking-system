package com.dev.cinemasystem.configuration.openApi;


import org.springdoc.core.models.GroupedOpenApi;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiGroupConfig {
    @Bean
    public GroupedOpenApi userGroup() {
        return GroupedOpenApi.builder()
                .group("user")
                .pathsToMatch("/user/**")
                .build();
    }

    @Bean
    public GroupedOpenApi cinemaGroup() {
        return GroupedOpenApi.builder()
                .group("cinema")
                .pathsToMatch("/cinema/**")
                .build();
    }

    @Bean
    public GroupedOpenApi roomGroup() {
        return GroupedOpenApi.builder()
                .group("room")
                .pathsToMatch("/room/**")
                .build();
    }

    @Bean
    public GroupedOpenApi roomTypeGroup() {
        return GroupedOpenApi.builder()
                .group("room-type")
                .pathsToMatch("/room-type/**")
                .build();
    }

    @Bean
    public GroupedOpenApi seatGroup() {
        return GroupedOpenApi.builder()
                .group("seat")
                .pathsToMatch("/seat/**")
                .build();
    }

    @Bean
    public GroupedOpenApi seatTypeGroup() {
        return GroupedOpenApi.builder()
                .group("seat-type")
                .pathsToMatch("/seat-type/**")
                .build();
    }

    @Bean
    public GroupedOpenApi movieGroup() {
        return GroupedOpenApi.builder()
                .group("movie")
                .pathsToMatch("/movie/**")
                .build();
    }

    @Bean
    public GroupedOpenApi movieTypeGroup() {
        return GroupedOpenApi.builder()
                .group("movie-type")
                .pathsToMatch("/movie-type/**")
                .build();
    }



    @Bean
    public GroupedOpenApi priceTicketGroup() {
        return GroupedOpenApi.builder()
                .group("price-ticket")
                .pathsToMatch("/price-ticket/**")
                .build();
    }


    @Bean
    public GroupedOpenApi ticketGroup() {
        return GroupedOpenApi.builder()
                .group("ticket")
                .pathsToMatch("/ticket/**")
                .build();
    }

    @Bean
    public GroupedOpenApi ticketTypeGroup() {
        return GroupedOpenApi.builder()
                .group("ticket-type")
                .pathsToMatch("/ticket-type/**")
                .build();
    }


    @Bean
    public GroupedOpenApi showTimeGroup() {
        return GroupedOpenApi.builder()
                .group("show-time")
                .pathsToMatch("/show-time/**")
                .build();
    }
}

