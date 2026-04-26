package com.dev.cinemasystem.service.gemini;

import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;

@Component
public class GeminiToolDeclarationFactory {

    public List<Object> buildTools() {
        return List.of(
                Map.of(
                        "functionDeclarations", List.of(
                                getMovieTypes(),
                                searchMovies(),
                                getMovieDetail(),
                                getShowtimes(),
                                getCinemas()
                        )
                )
        );
    }

    private Map<String, Object> getMovieTypes() {
        return Map.of(
                "name", "get_movie_types",
                "description", "Get available movie genres/types",
                "parameters", Map.of(
                        "type", "object",
                        "properties", Map.of()
                )
        );
    }

    private Map<String, Object> searchMovies() {
        return Map.of(
                "name", "search_movies",
                "description", "Search movies by keyword or movie name. Use this when user mentions a movie by name.",
                "parameters", Map.of(
                        "type", "object",
                        "properties", Map.of(
                                "keyword", Map.of(
                                        "type", "string",
                                        "description", "Movie name keyword, for example Conan, Doraemon, Avengers"
                                )
                        ),
                        "required", List.of("keyword")
                )
        );
    }

    private Map<String, Object> getMovieDetail() {
        return Map.of(
                "name", "get_movie_detail",
                "description", "Get detailed information of a movie by movieId",
                "parameters", Map.of(
                        "type", "object",
                        "properties", Map.of(
                                "movieId", Map.of(
                                        "type", "integer",
                                        "description", "Movie ID"
                                )
                        ),
                        "required", List.of("movieId")
                )
        );
    }

    private Map<String, Object> getShowtimes() {
        return Map.of(
                "name", "get_showtimes",
                "description", "Get showtimes filtered by movieId, movieTypeId, date, provinceId, cinemaId, movieName",
                "parameters", Map.of(
                        "type", "object",
                        "properties", Map.of(
                                "movieId", Map.of("type", "integer"),
                                "movieTypeId", Map.of("type", "integer"),
                                "provinceId", Map.of("type", "integer"),
                                "cinemaId", Map.of("type", "integer"),
                                "movieName", Map.of("type", "string"),
                                "date", Map.of(
                                        "type", "string",
                                        "description", "Date in yyyy-MM-dd format"
                                )
                        )
                )
        );
    }

    private Map<String, Object> getCinemas() {
        return Map.of(
                "name", "get_cinemas",
                "description", "Get cinema list, optionally filtered by provinceId",
                "parameters", Map.of(
                        "type", "object",
                        "properties", Map.of(
                                "provinceId", Map.of("type", "integer")
                        )
                )
        );
    }
}