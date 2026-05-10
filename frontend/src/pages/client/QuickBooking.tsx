import { useEffect, useMemo, useState } from "react";
import {
    Check,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    ChevronUp,
    Clapperboard,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import Signin from "../../layouts/signin";
import { provinceService } from "../../services/province.service";
import { showTimeService } from "../../services/showtimeService";
import { useAppSelector } from "../../stores/hooks";
import type { Movie } from "../../types/movie";
import type { Province } from "../../types/province";
import type { FullShowtimeMovieResponse, ShowTimeResponse } from "../../types/showtime";
import { formatTime, resolveMoviePortraitImage } from "../../utils/utils";

type BookingStep = {
    label: string;
};

type DayOption = {
    label: string;
    dateLabel: string;
    value: string;
};

type CinemaOption = {
    cinemaId: number;
    cinemaName: string;
};

type GroupedShowTimesByCinema = {
    key: string;
    cinemaName: string;
    roomTypes: Record<string, ShowTimeResponse[]>;
};

const STEPS: BookingStep[] = [
    { label: "Chọn phim / Rạp / Suất" },
    { label: "Chọn ghế" },
    { label: "Chọn thức ăn" },
    { label: "Thanh toán" },
    { label: "Xác nhận" },
];

const DAYS_PER_PAGE = 4;

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

const normalizeDateValue = (value?: string | null) => {
    if (!value) return "";
    return value.length >= 10 ? value.slice(0, 10) : value;
};

const formatMoney = (value: number) => `${value.toLocaleString("vi-VN")} d`;

const formatDateVi = (dateValue?: string) => {
    const normalizedDate = normalizeDateValue(dateValue);
    if (!normalizedDate) return "";

    const date = new Date(`${normalizedDate}T00:00:00`);
    if (Number.isNaN(date.getTime())) return normalizedDate;

    return date.toLocaleDateString("vi-VN", {
        weekday: "long",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    });
};

const formatDayLabel = (value: string, today: string) => {
    if (value === today) return "Hom nay";

    const date = new Date(`${value}T00:00:00`);
    if (Number.isNaN(date.getTime())) return value;

    const label = date.toLocaleDateString("vi-VN", { weekday: "long" });
    return label.charAt(0).toUpperCase() + label.slice(1);
};

const mapDayOptions = (dates: string[], today: string): DayOption[] => {
    return dates.map((value) => {
        const date = new Date(`${value}T00:00:00`);
        const dateLabel = Number.isNaN(date.getTime())
            ? value
            : date.toLocaleDateString("vi-VN", {
                  day: "2-digit",
                  month: "2-digit",
              });

        return {
            value,
            label: formatDayLabel(value, today),
            dateLabel,
        };
    });
};

const getMovieOptions = (items: FullShowtimeMovieResponse[]): Movie[] => {
    const movieMap = new Map<number, Movie>();

    items.forEach((item) => {
        if (movieMap.has(item.movie.movieId)) return;
        movieMap.set(item.movie.movieId, item.movie);
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

function SectionHeader({
    title,
    open,
    onClick,
}: {
    title: string;
    open: boolean;
    onClick: () => void;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="flex w-full items-center justify-between bg-white px-5 py-5 text-left shadow-md"
        >
            <h2 className="text-xl font-bold text-slate-950">{title}</h2>

            <span
                className={[
                    "flex h-7 w-7 items-center justify-center rounded-full transition",
                    open ? "bg-[#0055a6] text-white" : "bg-slate-100 text-[#0055a6]",
                ].join(" ")}
            >
                {open ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </span>
        </button>
    );
}

export default function QuickBookingPage() {
    const navigate = useNavigate();
    const user = useAppSelector((state) => state.auth.user);

    const [openLocation, setOpenLocation] = useState(false);
    const [openMovie, setOpenMovie] = useState(true);
    const [openShowTime, setOpenShowTime] = useState(true);
    const [openSignIn, setOpenSignIn] = useState(false);

    const [provinces, setProvinces] = useState<Province[]>([]);
    const [movies, setMovies] = useState<Movie[]>([]);
    const [movieShowTimes, setMovieShowTimes] = useState<ShowTimeResponse[]>([]);

    const [isProvinceLoading, setIsProvinceLoading] = useState(false);
    const [isMovieLoading, setIsMovieLoading] = useState(false);
    const [isShowTimeLoading, setIsShowTimeLoading] = useState(false);

    const [selectedProvinceId, setSelectedProvinceId] = useState<number | null>(null);
    const [selectedMovieId, setSelectedMovieId] = useState<number | null>(null);
    const [selectedDate, setSelectedDate] = useState("");
    const [selectedCinemaId, setSelectedCinemaId] = useState<number | "ALL">("ALL");
    const [selectedShowTimeId, setSelectedShowTimeId] = useState<number | null>(null);
    const [dayStartIndex, setDayStartIndex] = useState(0);

    const today = useMemo(() => getTodayAsLocalDate(), []);

    const selectedProvince = useMemo(
        () => provinces.find((province) => province.provinceId === selectedProvinceId) ?? null,
        [provinces, selectedProvinceId]
    );

    const selectedMovie = useMemo(
        () => movies.find((movie) => movie.movieId === selectedMovieId) ?? null,
        [movies, selectedMovieId]
    );

    const selectedShowTime = useMemo(
        () =>
            movieShowTimes.find((showtime) => showtime.showTimeId === selectedShowTimeId) ??
            null,
        [movieShowTimes, selectedShowTimeId]
    );

    useEffect(() => {
        let isUnmounted = false;

        const fetchProvinces = async () => {
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

        void fetchProvinces();

        return () => {
            isUnmounted = true;
        };
    }, []);

    useEffect(() => {
        if (provinces.length === 0) {
            setSelectedProvinceId(null);
            return;
        }

        setSelectedProvinceId((current) => {
            if (current && provinces.some((province) => province.provinceId === current)) {
                return current;
            }
            return provinces[0].provinceId;
        });
    }, [provinces]);

    useEffect(() => {
        setMovies([]);
        setSelectedMovieId(null);
        setMovieShowTimes([]);
        setSelectedDate("");
        setSelectedCinemaId("ALL");
        setSelectedShowTimeId(null);
        setDayStartIndex(0);

        if (!selectedProvinceId) {
            setIsMovieLoading(false);
            return;
        }

        let isUnmounted = false;

        const fetchMovies = async () => {
            setIsMovieLoading(true);

            try {
                const response = await showTimeService.getGroupedShowTimesByFilters({
                    provinceId: selectedProvinceId,
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
                    setMovies([]);
                    return;
                }

                setMovies(getMovieOptions(response.result?.items ?? []));
            } catch {
                if (!isUnmounted) {
                    setMovies([]);
                }
            } finally {
                if (!isUnmounted) {
                    setIsMovieLoading(false);
                }
            }
        };

        void fetchMovies();

        return () => {
            isUnmounted = true;
        };
    }, [selectedProvinceId, today]);

    useEffect(() => {
        if (movies.length === 0) {
            setSelectedMovieId(null);
            return;
        }

        setSelectedMovieId((current) => {
            if (current && movies.some((movie) => movie.movieId === current)) {
                return current;
            }
            return movies[0].movieId;
        });
    }, [movies]);

    useEffect(() => {
        setMovieShowTimes([]);
        setSelectedDate("");
        setSelectedCinemaId("ALL");
        setSelectedShowTimeId(null);
        setDayStartIndex(0);

        if (!selectedProvinceId || !selectedMovieId) {
            setIsShowTimeLoading(false);
            return;
        }

        let isUnmounted = false;

        const fetchShowTimes = async () => {
            setIsShowTimeLoading(true);

            try {
                const response = await showTimeService.getShowTimesByFilters({
                    provinceId: selectedProvinceId,
                    movieId: selectedMovieId,
                    releaseFromDate: today,
                    startTime: getCurrentLocalTime(),
                    status: "SELLING",
                    page: 1,
                    size: 500,
                    sortBy: "showtime",
                    direction: "ASC",
                });

                if (isUnmounted) return;
                if (response.code !== "SUCCESS") {
                    setMovieShowTimes([]);
                    return;
                }

                const items = [...(response.result?.items ?? [])].sort((first, second) => {
                    const firstDate = normalizeDateValue(first.releaseDate);
                    const secondDate = normalizeDateValue(second.releaseDate);
                    const dateCompare = firstDate.localeCompare(secondDate);
                    if (dateCompare !== 0) return dateCompare;
                    return first.startTime.localeCompare(second.startTime);
                });

                setMovieShowTimes(items);
            } catch {
                if (!isUnmounted) {
                    setMovieShowTimes([]);
                }
            } finally {
                if (!isUnmounted) {
                    setIsShowTimeLoading(false);
                }
            }
        };

        void fetchShowTimes();

        return () => {
            isUnmounted = true;
        };
    }, [selectedMovieId, selectedProvinceId, today]);

    const availableDates = useMemo(() => {
        const dateSet = new Set<string>();

        movieShowTimes.forEach((showtime) => {
            const normalizedDate = normalizeDateValue(showtime.releaseDate);
            if (!normalizedDate) return;
            dateSet.add(normalizedDate);
        });

        return Array.from(dateSet).sort((first, second) => first.localeCompare(second));
    }, [movieShowTimes]);

    useEffect(() => {
        if (availableDates.length === 0) {
            setSelectedDate("");
            return;
        }

        setSelectedDate((current) => {
            if (current && availableDates.includes(current)) {
                return current;
            }
            return availableDates[0];
        });
    }, [availableDates]);

    const days = useMemo(() => mapDayOptions(availableDates, today), [availableDates, today]);

    useEffect(() => {
        const maxStartIndex = Math.max(0, days.length - DAYS_PER_PAGE);
        setDayStartIndex((current) => Math.min(current, maxStartIndex));
    }, [days.length]);

    const showTimesByDate = useMemo(() => {
        if (!selectedDate) return [];

        return movieShowTimes.filter(
            (showtime) => normalizeDateValue(showtime.releaseDate) === selectedDate
        );
    }, [movieShowTimes, selectedDate]);

    const cinemas = useMemo(() => getCinemaOptions(showTimesByDate), [showTimesByDate]);

    useEffect(() => {
        setSelectedCinemaId((current) => {
            if (current === "ALL") return "ALL";
            return cinemas.some((cinema) => cinema.cinemaId === current) ? current : "ALL";
        });
    }, [cinemas]);

    const filteredShowTimes = useMemo(() => {
        const list = showTimesByDate.filter((showtime) => {
            if (selectedCinemaId === "ALL") return true;
            return showtime.room?.cinema?.cinemaId === selectedCinemaId;
        });

        return list.sort((first, second) => first.startTime.localeCompare(second.startTime));
    }, [selectedCinemaId, showTimesByDate]);

    const showTimesByCinema = useMemo<GroupedShowTimesByCinema[]>(() => {
        const groups = new Map<string, GroupedShowTimesByCinema>();

        filteredShowTimes.forEach((showtime) => {
            const cinemaId = showtime.room?.cinema?.cinemaId ?? -1;
            const cinemaName = showtime.room?.cinema?.cinemaName ?? "Rạp chưa cập nhật";
            const roomTypeName = showtime.room?.roomType?.roomTypeName ?? "Suất chiếu";
            const key = `${cinemaId}-${cinemaName}`;

            if (!groups.has(key)) {
                groups.set(key, {
                    key,
                    cinemaName,
                    roomTypes: {},
                });
            }

            const cinemaGroup = groups.get(key);
            if (!cinemaGroup) return;

            if (!cinemaGroup.roomTypes[roomTypeName]) {
                cinemaGroup.roomTypes[roomTypeName] = [];
            }

            const isDuplicate = cinemaGroup.roomTypes[roomTypeName].some(
                (item) => item.showTimeId === showtime.showTimeId
            );

            if (!isDuplicate) {
                cinemaGroup.roomTypes[roomTypeName].push(showtime);
            }
        });

        return Array.from(groups.values()).map((group) => {
            const sortedRoomTypes: Record<string, ShowTimeResponse[]> = {};

            Object.entries(group.roomTypes).forEach(([roomTypeName, shows]) => {
                sortedRoomTypes[roomTypeName] = [...shows].sort((a, b) =>
                    a.startTime.localeCompare(b.startTime)
                );
            });

            return {
                ...group,
                roomTypes: sortedRoomTypes,
            };
        });
    }, [filteredShowTimes]);

    useEffect(() => {
        if (!selectedShowTimeId) return;

        const stillAvailable = filteredShowTimes.some(
            (showtime) => showtime.showTimeId === selectedShowTimeId
        );

        if (!stillAvailable) {
            setSelectedShowTimeId(null);
        }
    }, [filteredShowTimes, selectedShowTimeId]);

    const visibleDays = useMemo(
        () => days.slice(dayStartIndex, dayStartIndex + DAYS_PER_PAGE),
        [dayStartIndex, days]
    );
    const canMoveDayLeft = dayStartIndex > 0;
    const canMoveDayRight = dayStartIndex + DAYS_PER_PAGE < days.length;

    const handleSelectMovie = (movieId: number) => {
        setSelectedMovieId(movieId);
        setOpenMovie(false);
        setOpenShowTime(true);
    };

    const handleContinue = () => {
        if (!selectedMovie) {
            toast.error("Vui lòng chọn phim");
            return;
        }

        if (!selectedShowTime) {
            toast.error("Vui lòng chọn suất chiếu");
            return;
        }

        if (!user) {
            setOpenSignIn(true);
            return;
        }

        const slug = selectedMovie.slug?.trim() || String(selectedMovie.movieId);
        navigate(`/dat-ve/${slug}/showtime/${selectedShowTime.showTimeId}`, {
            state: {
                showTimeId: selectedShowTime.showTimeId,
            },
        });
    };

    const handleBack = () => {
        navigate(-1);
    };

    return (
        <div className="min-h-screen bg-[#f7f7f7] text-slate-900">
            <Signin open={openSignIn} setOpen={setOpenSignIn} />

            <div className="sticky top-0 z-20 border-b bg-white">
                <div className="mx-auto flex max-w-5xl justify-center overflow-x-auto">
                    <ul className="flex min-w-max items-center text-sm font-semibold text-slate-300 md:text-base">
                        {STEPS.map((step, index) => {
                            const active = index === 0;

                            return (
                                <li key={step.label} className="pt-4">
                                    <button
                                        type="button"
                                        className={[
                                            "mx-3 whitespace-nowrap pb-4",
                                            active ? "text-[#0055a6]" : "text-slate-300",
                                        ].join(" ")}
                                    >
                                        {step.label}
                                    </button>

                                    <div className="h-[2px] bg-slate-200">
                                        <div
                                            className={[
                                                "h-[2px]",
                                                active ? "w-full bg-[#0055a6]" : "w-0",
                                            ].join(" ")}
                                        />
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            </div>

            <main className="mx-auto grid max-w-[1220px] grid-cols-1 gap-6 px-4 py-8 xl:grid-cols-[1fr_360px]">
                <section className="space-y-7">
                    <div className="overflow-hidden rounded-sm">
                        <SectionHeader
                            title={
                                selectedProvince
                                    ? `Chọn vị trí - ${selectedProvince.provinceName}`
                                    : "Chọn vị trí"
                            }
                            open={openLocation}
                            onClick={() => setOpenLocation((value) => !value)}
                        />

                        {openLocation && (
                            <div className="bg-white px-5 pb-5 shadow-md">
                                {isProvinceLoading ? (
                                    <div className="py-4 text-sm text-slate-500">
                                        Đang tải khu vực...
                                    </div>
                                ) : provinces.length === 0 ? (
                                    <div className="py-4 text-sm text-slate-500">
                                        Không có khu vực đang hoạt động.
                                    </div>
                                ) : (
                                    <div className="flex flex-wrap gap-2">
                                        {provinces.map((province) => {
                                            const active =
                                                province.provinceId === selectedProvinceId;

                                            return (
                                                <button
                                                    key={province.provinceId}
                                                    type="button"
                                                    onClick={() => {
                                                        setSelectedProvinceId(province.provinceId);
                                                        setOpenLocation(false);
                                                    }}
                                                    className={[
                                                        "rounded border px-4 py-2 text-sm transition",
                                                        active
                                                            ? "border-[#0055a6] bg-[#0055a6] text-white"
                                                            : "border-slate-200 bg-white text-slate-800 hover:border-[#0055a6] hover:bg-[#0055a6] hover:text-white",
                                                    ].join(" ")}
                                                >
                                                    {province.provinceName}
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="overflow-hidden rounded-sm">
                        <SectionHeader
                            title={
                                selectedMovie
                                    ? `Chọn phim - ${selectedMovie.movieName}`
                                    : "Chọn phim"
                            }
                            open={openMovie}
                            onClick={() => setOpenMovie((value) => !value)}
                        />

                        {openMovie && (
                            <div className="bg-white px-5 pb-6 shadow-md">
                                {isMovieLoading ? (
                                    <div className="py-4 text-sm text-slate-500">
                                        Đang tải danh sách phim...
                                    </div>
                                ) : movies.length === 0 ? (
                                    <div className="py-4 text-sm text-slate-500">
                                        Chưa có phim theo khu vực đã chọn.
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 gap-4 pt-4 sm:grid-cols-3 lg:grid-cols-4">
                                        {movies.map((movie) => {
                                            const active = selectedMovieId === movie.movieId;

                                            return (
                                                <button
                                                    key={movie.movieId}
                                                    type="button"
                                                    onClick={() => handleSelectMovie(movie.movieId)}
                                                    className="group text-left"
                                                >
                                                    <div className="relative overflow-hidden rounded">
                                                        <img
                                                            src={resolveMoviePortraitImage(
                                                                movie.imagePortrait
                                                            )}
                                                            alt={movie.movieName}
                                                            className={[
                                                                "h-[280px] w-full rounded object-cover transition duration-300 md:h-[330px]",
                                                                active
                                                                    ? "brightness-[0.55]"
                                                                    : "group-hover:brightness-75",
                                                            ].join(" ")}
                                                        />

                                                        {active && (
                                                            <div className="absolute inset-0 flex items-center justify-center">
                                                                <div className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-orange-500 bg-black/20 text-white">
                                                                    <Check
                                                                        size={40}
                                                                        strokeWidth={4}
                                                                    />
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>

                                                    <h3 className="mt-2 line-clamp-2 text-base font-bold text-slate-700">
                                                        {movie.movieName}
                                                    </h3>
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="overflow-hidden rounded-sm">
                        <SectionHeader
                            title="Chọn suất"
                            open={openShowTime}
                            onClick={() => setOpenShowTime((value) => !value)}
                        />

                        {openShowTime && (
                            <div className="bg-white px-5 pb-6 shadow-md">
                                {!selectedMovie ? (
                                    <div className="py-4 text-sm text-slate-500">
                                        Vui lòng chọn phim để xem suất chiếu.
                                    </div>
                                ) : isShowTimeLoading ? (
                                    <div className="py-4 text-sm text-slate-500">
                                        Đang tải suất chiếu...
                                    </div>
                                ) : days.length === 0 ? (
                                    <div className="py-4 text-sm text-slate-500">
                                        Chưa có suất chiếu đang mở bán.
                                    </div>
                                ) : (
                                    <>
                                        <div className="grid grid-cols-1 gap-4 py-4 md:grid-cols-[1fr_340px] md:items-center">
                                            <div className="flex items-center gap-3 overflow-x-auto">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        if (!canMoveDayLeft) return;
                                                        setDayStartIndex((value) =>
                                                            Math.max(0, value - 1)
                                                        );
                                                    }}
                                                    className={[
                                                        "shrink-0",
                                                        canMoveDayLeft
                                                            ? "text-slate-700"
                                                            : "cursor-not-allowed text-slate-300",
                                                    ].join(" ")}
                                                >
                                                    <ChevronLeft size={24} />
                                                </button>

                                                {visibleDays.map((day) => {
                                                    const active = selectedDate === day.value;

                                                    return (
                                                        <button
                                                            key={day.value}
                                                            type="button"
                                                            onClick={() => {
                                                                setSelectedDate(day.value);
                                                                setSelectedShowTimeId(null);
                                                            }}
                                                            className={[
                                                                "flex h-[70px] w-[90px] shrink-0 flex-col items-center justify-center rounded text-sm transition",
                                                                active
                                                                    ? "bg-[#0055a6] text-white"
                                                                    : "bg-white text-slate-700 hover:bg-slate-100",
                                                            ].join(" ")}
                                                        >
                                                            <span>{day.label}</span>
                                                            <span className="mt-1 font-semibold">
                                                                {day.dateLabel}
                                                            </span>
                                                        </button>
                                                    );
                                                })}

                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        if (!canMoveDayRight) return;
                                                        setDayStartIndex((value) => value + 1);
                                                    }}
                                                    className={[
                                                        "shrink-0",
                                                        canMoveDayRight
                                                            ? "text-slate-700"
                                                            : "cursor-not-allowed text-slate-300",
                                                    ].join(" ")}
                                                >
                                                    <ChevronRight size={24} />
                                                </button>
                                            </div>

                                            <select
                                                value={selectedCinemaId}
                                                onChange={(event) => {
                                                    const value = event.target.value;
                                                    setSelectedCinemaId(
                                                        value === "ALL" ? "ALL" : Number(value)
                                                    );
                                                    setSelectedShowTimeId(null);
                                                }}
                                                className="h-11 w-full border border-slate-300 bg-white px-3 text-base outline-none"
                                            >
                                                <option value="ALL">Tất cả các rạp</option>
                                                {cinemas.map((cinema) => (
                                                    <option
                                                        key={cinema.cinemaId}
                                                        value={cinema.cinemaId}
                                                    >
                                                        {cinema.cinemaName}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="space-y-5">
                                            {showTimesByCinema.length === 0 && (
                                                <div className="rounded border border-dashed p-5 text-center text-slate-500">
                                                    Không có suất chiếu cho bộ lọc hiện tại.
                                                </div>
                                            )}

                                            {showTimesByCinema.map((cinemaGroup) => (
                                                <div
                                                    key={cinemaGroup.key}
                                                    className="border-b border-slate-200 pb-5 last:border-b-0"
                                                >
                                                    <h3 className="mb-4 text-base font-bold">
                                                        {cinemaGroup.cinemaName}
                                                    </h3>

                                                    <div className="space-y-4">
                                                        {Object.entries(
                                                            cinemaGroup.roomTypes
                                                        ).map(([roomTypeName, items]) => (
                                                            <div
                                                                key={`${cinemaGroup.key}-${roomTypeName}`}
                                                                className="grid grid-cols-1 gap-3 md:grid-cols-[150px_1fr]"
                                                            >
                                                                <p className="text-sm text-slate-700">
                                                                    {roomTypeName}
                                                                </p>

                                                                <div className="flex flex-wrap gap-2">
                                                                    {items.map((showtime) => {
                                                                        const active =
                                                                            selectedShowTimeId ===
                                                                            showtime.showTimeId;

                                                                        return (
                                                                            <button
                                                                                key={
                                                                                    showtime.showTimeId
                                                                                }
                                                                                type="button"
                                                                                onClick={() =>
                                                                                    setSelectedShowTimeId(
                                                                                        showtime.showTimeId
                                                                                    )
                                                                                }
                                                                                className={[
                                                                                    "min-w-[82px] rounded border px-4 py-2 text-sm transition",
                                                                                    active
                                                                                        ? "border-[#0055a6] bg-[#0055a6] text-white"
                                                                                        : "border-slate-200 bg-white text-slate-800 hover:border-[#0055a6] hover:bg-[#0055a6] hover:text-white",
                                                                                ].join(" ")}
                                                                            >
                                                                                {formatTime(
                                                                                    showtime.startTime
                                                                                )}
                                                                            </button>
                                                                        );
                                                                    })}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </section>

                <aside className="xl:sticky xl:top-24 xl:self-start">
                    <div className="overflow-hidden rounded bg-white">
                        <div className="h-[6px] rounded-t bg-[#f58220]" />

                        <div className="p-5">
                            {selectedMovie ? (
                                <div className="grid grid-cols-[110px_1fr] gap-4">
                                    <img
                                        src={resolveMoviePortraitImage(selectedMovie.imagePortrait)}
                                        alt={selectedMovie.movieName}
                                        className="h-[160px] w-[110px] rounded object-cover"
                                    />

                                    <div>
                                        <h3 className="text-base font-bold text-slate-700">
                                            {selectedMovie.movieName}
                                        </h3>

                                        <div className="mt-4 text-sm text-slate-700">
                                            <span>
                                                {selectedShowTime?.room?.roomType?.roomTypeName ??
                                                    "Đang cập nhật"}
                                            </span>
                                            {(selectedMovie.minimumAge ?? 0) > 0 && (
                                                <>
                                                    <span> - </span>
                                                    <span className="inline-flex h-7 items-center justify-center rounded bg-[#f58220] px-2 font-bold text-white">
                                                        T{selectedMovie.minimumAge}
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="grid grid-cols-[110px_1fr] gap-4">
                                    <div className="flex h-[160px] w-[110px] items-center justify-center rounded bg-slate-100 text-slate-400">
                                        <Clapperboard size={54} />
                                    </div>
                                    <div className="text-slate-500">-</div>
                                </div>
                            )}

                            {selectedShowTime && (
                                <div className="mt-5 text-sm text-slate-700">
                                    <p>
                                        <strong>
                                            {selectedShowTime.room?.cinema?.cinemaName ??
                                                "Rạp chưa cập nhật"}
                                        </strong>
                                        <span> - </span>
                                        <span>
                                            {selectedShowTime.room?.roomName ??
                                                "Phòng chiếu chưa cập nhật"}
                                        </span>
                                    </p>

                                    <p className="mt-2">
                                        <span>Suất: </span>
                                        <strong>{formatTime(selectedShowTime.startTime)}</strong>
                                        <span> - </span>
                                        <span>{formatDateVi(selectedShowTime.releaseDate)}</span>
                                    </p>
                                </div>
                            )}

                            <div className="my-5 border-t border-dashed border-slate-300" />

                            <div className="flex items-center justify-between">
                                <strong className="text-base text-slate-700">Tổng cộng</strong>
                                <span className="font-bold text-[#f58220]">
                                    {formatMoney(0)}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 hidden grid-cols-2 gap-4 xl:grid">
                        <button
                            type="button"
                            onClick={handleBack}
                            className="rounded px-4 py-3 text-[#f58220] transition hover:bg-orange-50"
                        >
                            Quay lại
                        </button>

                        <button
                            type="button"
                            onClick={handleContinue}
                            className="rounded bg-[#f58220] px-4 py-3 font-semibold text-white transition hover:bg-[#e46f0d]"
                        >
                            Tiếp tục
                        </button>
                    </div>
                </aside>
            </main>

            <div className="fixed bottom-0 left-0 right-0 z-30 border-t bg-white px-4 py-3 shadow xl:hidden">
                <div className="flex items-center justify-between gap-3">
                    <div>
                        <span className="text-sm text-slate-500">Tổng cộng: </span>
                        <strong className="text-[#f58220]">{formatMoney(0)}</strong>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={handleBack}
                            className="h-10 rounded px-3 text-sm text-[#f58220]"
                        >
                            Quay lại
                        </button>

                        <button
                            type="button"
                            onClick={handleContinue}
                            className="h-10 rounded bg-[#f58220] px-4 text-sm font-semibold text-white"
                        >
                            Tiếp tục
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
