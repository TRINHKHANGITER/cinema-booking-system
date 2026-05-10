import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Slider from "react-slick";
import Arrow from "../components/icon/arrow";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { provinceService } from "../services/province.service";
import { showTimeService } from "../services/showtimeService";
import type { Province } from "../types/province";
import type { FullShowtimeMovieResponse, ShowTimeResponse } from "../types/showtime";
import { formatTime, resolveMovieLandscapeImage } from "../utils/utils";

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

type HeroSlide = {
    movieId: number;
    slug: string;
    movieName: string;
    imageLandscape: string | null;
};

const getDateValue = (value: string) => {
    if (!value) return "";
    return value.length >= 10 ? value.slice(0, 10) : value;
};

const getTodayAsLocalDate = () => {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
};

const getCurrentLocalTime = () => {
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, "0");
    const mm = String(now.getMinutes()).padStart(2, "0");
    const ss = String(now.getSeconds()).padStart(2, "0");
    return `${hh}:${mm}:${ss}`;
};

const formatDateLabel = (value: string) => {
    const normalized = getDateValue(value);
    const [year, month, day] = normalized.split("-");
    if (!year || !month || !day) return normalized;
    return `${day}/${month}/${year}`;
};

const getMovieOptions = (groupedShowtimes: FullShowtimeMovieResponse[]): MovieOption[] => {
    const movieMap = new Map<number, MovieOption>();

    groupedShowtimes.forEach((groupedShowtime) => {
        const movie = groupedShowtime.movie;
        if (movieMap.has(movie.movieId)) return;

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
    const [heroSlides, setHeroSlides] = useState<HeroSlide[]>([]);
    const [isHeroLoading, setIsHeroLoading] = useState(true);

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

        const fetchHeroSlides = async () => {
            setIsHeroLoading(true);
            try {
                const today = getTodayAsLocalDate();
                const response = await showTimeService.getGroupedShowTimesByFilters({
                    releaseFromDate: today,
                    startTime: getCurrentLocalTime(),
                    status: "SELLING",
                    page: 1,
                    size: 10,
                    sortBy: "showtime",
                    direction: "ASC",
                });

                if (isUnmounted) return;
                if (response.code !== "SUCCESS") {
                    setHeroSlides([]);
                    return;
                }

                const items = response.result?.items ?? [];
                const mappedSlides = items.map((item) => {
                    const normalizedSlug =
                        typeof item.movie.slug === "string" && item.movie.slug.trim().length > 0
                            ? item.movie.slug.trim()
                            : String(item.movie.movieId);

                    return {
                        movieId: item.movie.movieId,
                        slug: normalizedSlug,
                        movieName: item.movie.movieName,
                        imageLandscape: item.movie.imageLandscape,
                    };
                });

                setHeroSlides(mappedSlides);
            } catch {
                if (!isUnmounted) {
                    setHeroSlides([]);
                }
            } finally {
                if (!isUnmounted) {
                    setIsHeroLoading(false);
                }
            }
        };

        void fetchHeroSlides();

        return () => {
            isUnmounted = true;
        };
    }, []);

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
                const today = getTodayAsLocalDate();
                const response = await showTimeService.getGroupedShowTimesByFilters({
                    provinceId: selectedProvinceId,
                    releaseFromDate: today,
                    startTime: getCurrentLocalTime(),
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
                const today = getTodayAsLocalDate();
                const response = await showTimeService.getShowTimesByFilters({
                    provinceId: selectedProvinceId,
                    movieId: selectedMovieId,
                    releaseFromDate: today,
                    startTime: getCurrentLocalTime(),
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
                const today = getTodayAsLocalDate();
                const response = await showTimeService.getShowTimesByFilters({
                    provinceId: selectedProvinceId,
                    cinemaId: selectedCinemaId,
                    movieId: selectedMovieId,
                    releaseFromDate: today,
                    startTime: getCurrentLocalTime(),
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
                const today = getTodayAsLocalDate();
                const startTimeFilter = selectedDate === today ? getCurrentLocalTime() : undefined;
                const response = await showTimeService.getShowTimesByFilters({
                    provinceId: selectedProvinceId,
                    cinemaId: selectedCinemaId,
                    movieId: selectedMovieId,
                    releaseFromDate: selectedDate,
                    releaseToDate: selectedDate,
                    startTime: startTimeFilter,
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
                {heroSlides.length > 0
                    ? heroSlides.map((slide) => (
                          <div key={slide.movieId} className="xl:px-6 lg:px-0">
                              <img
                                  src={resolveMovieLandscapeImage(slide.imageLandscape)}
                                  alt={slide.movieName}
                                  className="w-full h-[260px] sm:h-[320px] md:h-[420px] xl:h-[480px] object-cover"
                                  onClick={() => navigate(`/xuat-chieu/${slide.slug}`)}
                              />
                          </div>
                      ))
                    : slides.map((img, index) => (
                          <div key={index} className="xl:px-6 lg:px-0">
                              <img
                                  src={img}
                                  className="w-full h-[260px] sm:h-[320px] md:h-[420px] xl:h-[480px] object-cover"
                              />
                          </div>
                      ))}
                {isHeroLoading && (
                    <div className="xl:px-6 lg:px-0">
                        <div className="w-full h-[260px] sm:h-[320px] md:h-[420px] xl:h-[480px] bg-gray-100" />
                    </div>
                )}
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
                            (isProvinceLoading ? "Đang tải khu vực..." : "Chọn khu vực")}
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
                                <div className="px-3 py-2 text-sm text-gray-400">Không có khu vực</div>
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
                            (isMovieLoading ? "Đang tải phim..." : "Chọn phim")}
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
                                <div className="px-3 py-2 text-sm text-gray-400">Không có phim</div>
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
                            (isCinemaLoading ? "Đang tải rạp..." : "Chọn rạp")}
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
                                <div className="px-3 py-2 text-sm text-gray-400">Không có rạp</div>
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
                            ? "Đang tải ngày..."
                            : "Chọn ngày"}
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
                                    Không có ngày chiếu
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
                            ? "Đang tải giờ..."
                            : "Chọn giờ"}
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
                                    Không có suất chiếu
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
                        Mua vé nhanh
                    </button>
                </div>
            </div>
        </div>
    );
};

export default HeroSlider;
