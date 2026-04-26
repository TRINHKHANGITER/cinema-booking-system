package com.dev.cinemasystem.configuration.security;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Paths;

@Slf4j
@Configuration
public class StaticResourceConfig implements WebMvcConfigurer {

    @Value("${storage.image-combo-dir}")
    private String imageComboDir;

    @Value("${storage.image-combo-pattern}")
    private String imageComboPattern;

    @Value("${storage.image-movie-imageLandscape-dir}")
    private String imageMovieLandscapeDir;

    @Value("${storage.image-movie-imageLandscape-pattern}")
    private String imageMovieLandscapePattern;

    @Value("${storage.image-movie-imagePortrait-dir}")
    private String imageMoviePortraitDir;

    @Value("${storage.image-movie-imagePortrait-pattern}")
    private String imageMoviePortraitPattern;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        register(registry, imageComboPattern, imageComboDir);
        register(registry, imageMovieLandscapePattern, imageMovieLandscapeDir);
        register(registry, imageMoviePortraitPattern, imageMoviePortraitDir);
    }

    private void register(ResourceHandlerRegistry registry, String handlerPattern, String dir) {
        String location = toFileLocation(dir);
        log.info("Configuring static resource: {} -> {}", handlerPattern, location);
        registry.addResourceHandler(handlerPattern).addResourceLocations(location);
    }

    private String toFileLocation(String dir) {
        String location = Paths.get(dir).toAbsolutePath().normalize().toUri().toString();
        return location.endsWith("/") ? location : location + "/";
    }
}
