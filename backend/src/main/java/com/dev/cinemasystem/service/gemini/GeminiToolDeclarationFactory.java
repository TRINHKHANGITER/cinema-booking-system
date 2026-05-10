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
                                getCinemas(),
                                getProvinces(),
                                getPriceTickets()
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
                "description", "Lấy lịch chiếu phim. Có thể lọc theo movieId, movieTypeId, date (yyyy-MM-dd), provinceId, provinceName (tên tỉnh/thành phố tiếng Việt), cinemaId, movieName. Nếu người dùng nhắc đến tên tỉnh/thành phố, hãy dùng provinceName thay vì provinceId.",
                "parameters", Map.of(
                        "type", "object",
                        "properties", Map.of(
                                "movieId", Map.of("type", "integer"),
                                "movieTypeId", Map.of("type", "integer"),
                                "provinceId", Map.of("type", "integer"),
                                "provinceName", Map.of(
                                        "type", "string",
                                        "description", "Tên tỉnh/thành phố, ví dụ: TP.HCM, Hà Nội, Đà Nẵng"
                                ),
                                "cinemaId", Map.of("type", "integer"),
                                "movieName", Map.of("type", "string"),
                                "date", Map.of(
                                        "type", "string",
                                        "description", "Ngày chiếu theo định dạng yyyy-MM-dd"
                                )
                        )
                )
        );
    }

    private Map<String, Object> getCinemas() {
        return Map.of(
                "name", "get_cinemas",
                "description", "Lấy danh sách rạp chiếu phim. Có thể lọc theo provinceId hoặc provinceName (tên tỉnh/thành phố). Ưu tiên dùng provinceName khi người dùng hỏi theo tên tỉnh.",
                "parameters", Map.of(
                        "type", "object",
                        "properties", Map.of(
                                "provinceId", Map.of("type", "integer"),
                                "provinceName", Map.of(
                                        "type", "string",
                                        "description", "Tên tỉnh/thành phố, ví dụ: TP.HCM, Hà Nội, Đà Nẵng"
                                )
                        )
                )
        );
    }

    private Map<String, Object> getProvinces() {
        return Map.of(
                "name", "get_provinces",
                "description", "Lấy danh sách tỉnh/thành phố đang hoạt động. Có thể tìm kiếm theo tên. Dùng tool này khi cần biết danh sách tỉnh thành hoặc cần tìm provinceId từ tên tỉnh.",
                "parameters", Map.of(
                        "type", "object",
                        "properties", Map.of(
                                "keyword", Map.of(
                                        "type", "string",
                                        "description", "Từ khóa tên tỉnh/thành phố cần tìm, ví dụ: HCM, Hà Nội"
                                )
                        )
                )
        );
    }

    private Map<String, Object> getPriceTickets() {
        return Map.of(
                "name", "get_price_tickets",
                "description", "Lấy bảng giá vé xem phim. Giá vé được tính theo loại phòng chiếu (roomType) và loại ghế (seatType). Dùng tool này khi người dùng hỏi về giá vé.",
                "parameters", Map.of(
                        "type", "object",
                        "properties", Map.of(
                                "roomTypeId", Map.of(
                                        "type", "integer",
                                        "description", "ID loại phòng chiếu (không bắt buộc)"
                                ),
                                "seatTypeId", Map.of(
                                        "type", "integer",
                                        "description", "ID loại ghế (không bắt buộc)"
                                )
                        )
                )
        );
    }
}