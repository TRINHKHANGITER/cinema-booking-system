package com.dev.cinemasystem.configuration.security;

import com.dev.cinemasystem.utils.StoragePathResolver;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Slf4j
@Configuration
public class StaticResourceConfig implements WebMvcConfigurer {
    private static final String LEGACY_IMAGE_COMBO_PATTERN = "/data/image/combo/**";
    private static final String LEGACY_IMAGE_MOVIE_LANDSCAPE_PATTERN = "/data/image/movie/imageLandscape/**";
    private static final String LEGACY_IMAGE_MOVIE_PORTRAIT_PATTERN = "/data/image/movie/imagePortrait/**";

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

        // Legacy paths kept for backward compatibility with older frontend env values.
        register(registry, LEGACY_IMAGE_COMBO_PATTERN, imageComboDir);
        register(registry, LEGACY_IMAGE_MOVIE_LANDSCAPE_PATTERN, imageMovieLandscapeDir);
        register(registry, LEGACY_IMAGE_MOVIE_PORTRAIT_PATTERN, imageMoviePortraitDir);
    }

    private void register(ResourceHandlerRegistry registry, String handlerPattern, String dir) {
        String location = toFileLocation(dir);
        log.info("Configuring static resource: {} -> {}", handlerPattern, location);
        registry.addResourceHandler(handlerPattern).addResourceLocations(location);
    }

    private String toFileLocation(String dir) {
        String location = StoragePathResolver.resolveToAbsolutePath(dir).toUri().toString();
        return location.endsWith("/") ? location : location + "/";
    }
}
