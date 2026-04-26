import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Slider from "react-slick";
import Arrow from "../components/icon/arrow";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { provinceService } from "../services/province.service";
import { showTimeService } from "../services/showtimeService";
import type { Province } from "../types/province";
import type { ShowTimeResponse } from "../types/showtime";
import { formatTime } from "../utils/utils";

type OpenDropdown = "" | "province" | "movie" | "cinema" | "date" | "time";

type MovieOption = {
    movieId: number;
    movieName: string;
    slug: string;
};

type CinemaOption = {
    cinemaId: number;
    cinemaName: string;
};

const getDateValue = (value: string) => {
    if (!value) return "";
    return value.length >= 10 ? value.slice(0, 10) : value;
};

const formatDateLabel = (value: string) => {
    const normalized = getDateValue(value);
    const [year, month, day] = normalized.split("-");
    if (!year || !month || !day) return normalized;
    return `${day}/${month}/${year}`;
};

const getMovieOptions = (showtimes: ShowTimeResponse[]): MovieOption[] => {
    const movieMap = new Map<number, MovieOption>();

    showtimes.forEach((showtime) => {
        const movie = showtime.movie;
        if (!movie || movieMap.has(movie.movieId)) return;

        const normalizedSlug =
            typeof movie.slug === "string" && movie.slug.trim().length > 0
                ? movie.slug.trim()
                : String(movie.movieId);

        movieMap.set(movie.movieId, {
            movieId: movie.movieId,
            movieName: movie.movieName,
            slug: normalizedSlug,
        });
    });

    return Array.from(movieMap.values());
};

const getCinemaOptions = (showtimes: ShowTimeResponse[]): CinemaOption[] => {
    const cinemaMap = new Map<number, CinemaOption>();

    showtimes.forEach((showtime) => {
        const cinema = showtime.room?.cinema;
        if (!cinema || cinemaMap.has(cinema.cinemaId)) return;

        cinemaMap.set(cinema.cinemaId, {
            cinemaId: cinema.cinemaId,
            cinemaName: cinema.cinemaName,
        });
    });

    return Array.from(cinemaMap.values());
};

const getDateOptions = (showtimes: ShowTimeResponse[]): string[] => {
    const dateSet = new Set<string>();

    showtimes.forEach((showtime) => {
        const date = getDateValue(showtime.releaseDate);
        if (!date) return;
        dateSet.add(date);
    });

    return Array.from(dateSet).sort((first, second) => first.localeCompare(second));
};

const HeroSlider = () => {
    const navigate = useNavigate();

    const [open, setOpen] = useState<OpenDropdown>("");

    const [provinces, setProvinces] = useState<Province[]>([]);
    const [movieOptions, setMovieOptions] = useState<MovieOption[]>([]);
    const [cinemaOptions, setCinemaOptions] = useState<CinemaOption[]>([]);
    const [dateOptions, setDateOptions] = useState<string[]>([]);
    const [showtimeOptions, setShowtimeOptions] = useState<ShowTimeResponse[]>([]);

    const [selectedProvinceId, setSelectedProvinceId] = useState<number | null>(null);
    const [selectedMovieId, setSelectedMovieId] = useState<number | null>(null);
    const [selectedCinemaId, setSelectedCinemaId] = useState<number | null>(null);
    const [selectedDate, setSelectedDate] = useState("");
    const [selectedShowTimeId, setSelectedShowTimeId] = useState<number | null>(null);

    const [isProvinceLoading, setIsProvinceLoading] = useState(false);
    const [isMovieLoading, setIsMovieLoading] = useState(false);
    const [isCinemaLoading, setIsCinemaLoading] = useState(false);
    const [isDateLoading, setIsDateLoading] = useState(false);
    const [isShowtimeLoading, setIsShowtimeLoading] = useState(false);

    const selectedProvince = useMemo(
        () =>
            provinces.find((province) => province.provinceId === selectedProvinceId) ??
            null,
        [provinces, selectedProvinceId]
    );

    const selectedMovie = useMemo(
        () =>
            movieOptions.find((movie) => movie.movieId === selectedMovieId) ??
            null,
        [movieOptions, selectedMovieId]
    );

    const selectedCinema = useMemo(
        () =>
            cinemaOptions.find((cinema) => cinema.cinemaId === selectedCinemaId) ??
            null,
        [cinemaOptions, selectedCinemaId]
    );

    const selectedShowtime = useMemo(
        () =>
            showtimeOptions.find(
                (showtime) => showtime.showTimeId === selectedShowTimeId
            ) ?? null,
        [showtimeOptions, selectedShowTimeId]
    );

    const settings = {
        dots: false,
        infinite: true,
        speed: 4500,
        slidesToShow: 1,
        centerMode: true,
        centerPadding: "190px",
        autoplay: true,
        autoplaySpeed: 800,

        responsive: [
            {
                breakpoint: 1280,
                settings: {
                    centerPadding: "100px",
                },
            },
            {
                breakpoint: 1024,
                settings: {
                    centerMode: false,
                    centerPadding: "0px",
                    slidesToShow: 1,
                },
            },
            {
                breakpoint: 768,
                settings: {
                    centerMode: false,
                    centerPadding: "0px",
                    slidesToShow: 1,
                },
            },
        ],
    };

    const slides = [
        "/images/banner/2048-tai.jpg",
        "/images/banner/cam-on-nguoi-da-thuc-cung-toi.jpg",
        "/images/banner/chuyen-kinh-di.jpg",
    ];

    useEffect(() => {
        let isUnmounted = false;

        const fetchProvinceOptions = async () => {
            setIsProvinceLoading(true);

            try {
                const response = await provinceService.getProvinceItemList("ACTIVE");
                if (isUnmounted) return;

                if (response.code === "SUCCESS") {
                    setProvinces(response.result?.items ?? []);
                    return;
                }

                const fallbackResponse = await provinceService.getProvinces("ACTIVE");
                if (isUnmounted) return;

                if (fallbackResponse.code === "SUCCESS") {
                    setProvinces(fallbackResponse.result ?? []);
                    return;
                }

                setProvinces([]);
            } catch {
                if (!isUnmounted) {
                    setProvinces([]);
                }
            } finally {
                if (!isUnmounted) {
                    setIsProvinceLoading(false);
                }
            }
        };

        void fetchProvinceOptions();

        return () => {
            isUnmounted = true;
        };
    }, []);

    useEffect(() => {
        setMovieOptions([]);
        setSelectedMovieId(null);
        setCinemaOptions([]);
        setSelectedCinemaId(null);
        setDateOptions([]);
        setSelectedDate("");
        setShowtimeOptions([]);
        setSelectedShowTimeId(null);

        if (!selectedProvinceId) {
            setIsMovieLoading(false);
            return;
        }

        let isUnmounted = false;

        const fetchMovieOptions = async () => {
            setIsMovieLoading(true);

            try {
                const response = await showTimeService.getShowTimesByFilters({
                    provinceId: selectedProvinceId,
                    status: "SELLING",
                    page: 1,
                    size: 10,
                    sortBy: "showtime",
                    direction: "ASC",
                });

                if (isUnmounted) return;

                if (response.code !== "SUCCESS") {
                    setMovieOptions([]);
                    return;
                }

                const items = response.result?.items ?? [];
                setMovieOptions(getMovieOptions(items));
            } catch {
                if (!isUnmounted) {
                    setMovieOptions([]);
                }
            } finally {
                if (!isUnmounted) {
                    setIsMovieLoading(false);
                }
            }
        };

        void fetchMovieOptions();

        return () => {
            isUnmounted = true;
        };
    }, [selectedProvinceId]);

    useEffect(() => {
        setCinemaOptions([]);
        setSelectedCinemaId(null);
        setDateOptions([]);
        setSelectedDate("");
        setShowtimeOptions([]);
        setSelectedShowTimeId(null);

        if (!selectedProvinceId || !selectedMovieId) {
            setIsCinemaLoading(false);
            return;
        }

        let isUnmounted = false;

        const fetchCinemaOptions = async () => {
            setIsCinemaLoading(true);

            try {
                const response = await showTimeService.getShowTimesByFilters({
                    provinceId: selectedProvinceId,
                    movieId: selectedMovieId,
                    status: "SELLING",
                    page: 1,
                    size: 200,
                    sortBy: "showtime",
                    direction: "ASC",
                });

                if (isUnmounted) return;

                if (response.code !== "SUCCESS") {
                    setCinemaOptions([]);
                    return;
                }

                const items = response.result?.items ?? [];
                setCinemaOptions(getCinemaOptions(items));
            } catch {
                if (!isUnmounted) {
                    setCinemaOptions([]);
                }
            } finally {
                if (!isUnmounted) {
                    setIsCinemaLoading(false);
                }
            }
        };

        void fetchCinemaOptions();

        return () => {
            isUnmounted = true;
        };
    }, [selectedMovieId, selectedProvinceId]);

    useEffect(() => {
        setDateOptions([]);
        setSelectedDate("");
        setShowtimeOptions([]);
        setSelectedShowTimeId(null);

        if (!selectedProvinceId || !selectedMovieId || !selectedCinemaId) {
            setIsDateLoading(false);
            return;
        }

        let isUnmounted = false;

        const fetchDateOptions = async () => {
            setIsDateLoading(true);

            try {
                const response = await showTimeService.getShowTimesByFilters({
                    provinceId: selectedProvinceId,
                    cinemaId: selectedCinemaId,
                    movieId: selectedMovieId,
                    status: "SELLING",
                    page: 1,
                    size: 200,
                    sortBy: "showtime",
                    direction: "ASC",
                });

                if (isUnmounted) return;

                if (response.code !== "SUCCESS") {
                    setDateOptions([]);
                    return;
                }

                const items = response.result?.items ?? [];
                setDateOptions(getDateOptions(items));
            } catch {
                if (!isUnmounted) {
                    setDateOptions([]);
                }
            } finally {
                if (!isUnmounted) {
                    setIsDateLoading(false);
                }
            }
        };

        void fetchDateOptions();

        return () => {
            isUnmounted = true;
        };
    }, [selectedCinemaId, selectedMovieId, selectedProvinceId]);

    useEffect(() => {
        setShowtimeOptions([]);
        setSelectedShowTimeId(null);

        if (
            !selectedProvinceId ||
            !selectedMovieId ||
            !selectedCinemaId ||
            !selectedDate
        ) {
            setIsShowtimeLoading(false);
            return;
        }

        let isUnmounted = false;

        const fetchShowtimeOptions = async () => {
            setIsShowtimeLoading(true);

            try {
                const response = await showTimeService.getShowTimesByFilters({
                    provinceId: selectedProvinceId,
                    cinemaId: selectedCinemaId,
                    movieId: selectedMovieId,
                    releaseDate: selectedDate,
                    releaseDateCondition: "EQ",
                    status: "SELLING",
                    page: 1,
                    size: 200,
                    sortBy: "showtime",
                    direction: "ASC",
                });

                if (isUnmounted) return;

                if (response.code !== "SUCCESS") {
                    setShowtimeOptions([]);
                    return;
                }

                const items = [...(response.result?.items ?? [])].sort(
                    (first, second) => first.startTime.localeCompare(second.startTime)
                );
                setShowtimeOptions(items);
            } catch {
                if (!isUnmounted) {
                    setShowtimeOptions([]);
                }
            } finally {
                if (!isUnmounted) {
                    setIsShowtimeLoading(false);
                }
            }
        };

        void fetchShowtimeOptions();

        return () => {
            isUnmounted = true;
        };
    }, [selectedCinemaId, selectedDate, selectedMovieId, selectedProvinceId]);

    const isMovieDisabled = !selectedProvinceId || isMovieLoading;
    const isCinemaDisabled = !selectedMovieId || isCinemaLoading;
    const isDateDisabled = !selectedCinemaId || isDateLoading;
    const isShowtimeDisabled = !selectedDate || isShowtimeLoading;
    const canQuickBook = Boolean(selectedMovie && selectedShowTimeId);

    const handleQuickBook = () => {
        if (!selectedMovie || !selectedShowTimeId) return;

        navigate(`/dat-ve/${selectedMovie.slug}/showtime/${selectedShowTimeId}`, {
            state: {
                showTimeId: selectedShowTimeId,
            },
        });
    };

    return (
        <div className="relative h-auto overflow-hidden pb-10">
            <Slider {...settings}>
                {slides.map((img, index) => (
                    <div key={index} className="xl:px-6 lg:px-0">
                        <img src={img} className="w-full object-cover" />
                    </div>
                ))}
            </Slider>

            {/* QUICK BUY */}
            <div className="quick-buy hidden xl:grid absolute z-50 grid-cols-[2fr_3fr_2fr_2fr_2fr_2fr] max-w-6xl h-14 w-full shadow-[0_8px_30px_rgba(0,0,0,0.12)] bg-white rounded left-2/4 bottom-14 translate-y-1/2 -translate-x-2/4">
                {/* PROVINCE */}
                <div
                    className={`flex items-center gap-2 relative ${
                        isProvinceLoading ? "opacity-60 cursor-wait" : "cursor-pointer"
                    }`}
                    onClick={() => {
                        if (isProvinceLoading) return;
                        setOpen(open === "province" ? "" : "province");
                    }}
                >
                    <span className="bg-[#f58020] text-[10px] text-white px-1.5 py-0.5 rounded-full ml-2">
                        1
                    </span>

                    <div className="text-sm truncate">
                        {selectedProvince?.provinceName ||
                            (isProvinceLoading ? "Dang tai khu vuc..." : "Chon khu vuc")}
                    </div>

                    <div className="ml-auto pr-2">
                        <Arrow />
                    </div>

                    {open === "province" && (
                        <div className="absolute bottom-full left-0 w-full bg-white shadow-lg max-h-56 overflow-y-auto">
                            {provinces.length > 0 ? (
                                provinces.map((province) => (
                                    <div
                                        key={province.provinceId}
                                        className="px-3 py-2 text-sm hover:bg-gray-100"
                                        onClick={(event) => {
                                            event.stopPropagation();
                                            setSelectedProvinceId(province.provinceId);
                                            setOpen("");
                                        }}
                                    >
                                        {province.provinceName}
                                    </div>
                                ))
                            ) : (
                                <div className="px-3 py-2 text-sm text-gray-400">Khong co khu vuc</div>
                            )}
                        </div>
                    )}
                </div>

                {/* MOVIE */}
                <div
                    className={`flex items-center gap-2 relative ${
                        isMovieDisabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                    }`}
                    onClick={() => {
                        if (isMovieDisabled) return;
                        setOpen(open === "movie" ? "" : "movie");
                    }}
                >
                    <span className="bg-[#f58020] text-[10px] text-white px-1.5 py-0.5 rounded-full ml-2">
                        2
                    </span>

                    <div className="text-sm truncate">
                        {selectedMovie?.movieName ||
                            (isMovieLoading ? "Dang tai phim..." : "Chon phim")}
                    </div>

                    <div className="ml-auto pr-2">
                        <Arrow />
                    </div>

                    {open === "movie" && (
                        <div className="absolute bottom-full left-0 w-full bg-white shadow-lg max-h-56 overflow-y-auto">
                            {movieOptions.length > 0 ? (
                                movieOptions.map((movie) => (
                                    <div
                                        key={movie.movieId}
                                        className="px-3 py-2 text-sm hover:bg-gray-100"
                                        onClick={(event) => {
                                            event.stopPropagation();
                                            setSelectedMovieId(movie.movieId);
                                            setOpen("");
                                        }}
                                    >
                                        {movie.movieName}
                                    </div>
                                ))
                            ) : (
                                <div className="px-3 py-2 text-sm text-gray-400">Khong co phim</div>
                            )}
                        </div>
                    )}
                </div>

                {/* CINEMA */}
                <div
                    className={`flex items-center gap-2 relative ${
                        isCinemaDisabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                    }`}
                    onClick={() => {
                        if (isCinemaDisabled) return;
                        setOpen(open === "cinema" ? "" : "cinema");
                    }}
                >
                    <span className="bg-[#f58020] text-[10px] text-white px-1.5 py-0.5 rounded-full ml-2">
                        3
                    </span>

                    <div className="text-sm truncate">
                        {selectedCinema?.cinemaName ||
                            (isCinemaLoading ? "Dang tai rap..." : "Chon rap")}
                    </div>

                    <Arrow />

                    {open === "cinema" && (
                        <div className="absolute bottom-full left-0 w-full bg-white shadow-lg max-h-56 overflow-y-auto">
                            {cinemaOptions.length > 0 ? (
                                cinemaOptions.map((cinema) => (
                                    <div
                                        key={cinema.cinemaId}
                                        className="px-3 py-2 text-sm hover:bg-gray-100"
                                        onClick={(event) => {
                                            event.stopPropagation();
                                            setSelectedCinemaId(cinema.cinemaId);
                                            setOpen("");
                                        }}
                                    >
                                        {cinema.cinemaName}
                                    </div>
                                ))
                            ) : (
                                <div className="px-3 py-2 text-sm text-gray-400">Khong co rap</div>
                            )}
                        </div>
                    )}
                </div>

                {/* DATE */}
                <div
                    className={`flex items-center gap-2 relative ${
                        isDateDisabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                    }`}
                    onClick={() => {
                        if (isDateDisabled) return;
                        setOpen(open === "date" ? "" : "date");
                    }}
                >
                    <span className="bg-[#f58020] text-[10px] text-white px-1.5 py-0.5 rounded-full ml-2">
                        4
                    </span>

                    <div className="text-sm truncate">
                        {selectedDate
                            ? formatDateLabel(selectedDate)
                            : isDateLoading
                            ? "Dang tai ngay..."
                            : "Chon ngay"}
                    </div>

                    <Arrow />

                    {open === "date" && (
                        <div className="absolute bottom-full left-0 w-full bg-white shadow-lg max-h-56 overflow-y-auto">
                            {dateOptions.length > 0 ? (
                                dateOptions.map((date) => (
                                    <div
                                        key={date}
                                        className="px-3 py-2 text-sm hover:bg-gray-100"
                                        onClick={(event) => {
                                            event.stopPropagation();
                                            setSelectedDate(date);
                                            setOpen("");
                                        }}
                                    >
                                        {formatDateLabel(date)}
                                    </div>
                                ))
                            ) : (
                                <div className="px-3 py-2 text-sm text-gray-400">
                                    Khong co ngay chieu
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* SHOWTIME */}
                <div
                    className={`flex items-center gap-2 relative ${
                        isShowtimeDisabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                    }`}
                    onClick={() => {
                        if (isShowtimeDisabled) return;
                        setOpen(open === "time" ? "" : "time");
                    }}
                >
                    <span className="bg-[#f58020] text-[10px] text-white px-1.5 py-0.5 rounded-full ml-2">
                        5
                    </span>

                    <div className="text-sm truncate">
                        {selectedShowtime
                            ? formatTime(selectedShowtime.startTime)
                            : isShowtimeLoading
                            ? "Dang tai gio..."
                            : "Chon gio"}
                    </div>

                    <Arrow />

                    {open === "time" && (
                        <div className="absolute bottom-full left-0 w-full bg-white shadow-lg max-h-56 overflow-y-auto">
                            {showtimeOptions.length > 0 ? (
                                showtimeOptions.map((showtime) => (
                                    <div
                                        key={showtime.showTimeId}
                                        className="px-3 py-2 text-sm hover:bg-gray-100"
                                        onClick={(event) => {
                                            event.stopPropagation();
                                            setSelectedShowTimeId(showtime.showTimeId);
                                            setOpen("");
                                        }}
                                    >
                                        {formatTime(showtime.startTime)}
                                    </div>
                                ))
                            ) : (
                                <div className="px-3 py-2 text-sm text-gray-400">
                                    Khong co suat chieu
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* BUTTON */}
                <div>
                    <button
                        disabled={!canQuickBook}
                        onClick={handleQuickBook}
                        className={`w-full h-full rounded-sm ${
                            canQuickBook
                                ? "bg-[rgb(245,128,32)] cursor-pointer"
                                : "bg-orange-300 cursor-not-allowed"
                        }`}
                    >
                        Mua ve nhanh
                    </button>
                </div>
            </div>
        </div>
    );
};

export default HeroSlider;
