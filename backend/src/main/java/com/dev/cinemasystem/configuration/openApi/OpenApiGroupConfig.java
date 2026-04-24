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
                .pathsToMatch("/room-type/**", "/roomType/**")
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
    public GroupedOpenApi showTimeGroup() {
        return GroupedOpenApi.builder()
                .group("show-time")
                .pathsToMatch("/show-time/**")
                .build();
    }


    @Bean
    public GroupedOpenApi authGroup() {
        return GroupedOpenApi.builder()
                .group("auth")
                .pathsToMatch("/auth/**")
                .build();
    }


    @Bean
    public GroupedOpenApi orderGroup() {
        return GroupedOpenApi.builder()
                .group("order")
                .pathsToMatch("/order/**")
                .build();
    }

    
    @Bean
    public GroupedOpenApi paymentGroup() {
        return GroupedOpenApi.builder()
                .group("payment")
                .pathsToMatch("/payment/**")
                .build();
    }

    
    @Bean
    public GroupedOpenApi checkoutVnpayGroup() {
        return GroupedOpenApi.builder()
                .group("checkout-vnpay")
                .pathsToMatch("/checkout/vnpay/**")
                .build();
    }
}

