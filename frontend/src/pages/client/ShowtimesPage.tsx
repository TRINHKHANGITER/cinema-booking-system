import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import ArrowRight from "../../components/icon/arrowRight";
import Calendar from "../../components/icon/calendar";
import Clock from "../../components/icon/clock";
import Vote from "../../components/icon/vote";
import Card from "../../components/ui/Card";
import Signin from "../../layouts/signin";
import { provinceService } from "../../services/province.service";
import { showTimeService } from "../../services/showtimeService";
import { useAppDispatch, useAppSelector } from "../../stores/hooks";
import { fetchCinemasThunk } from "../../stores/slices/cinemaSlice";
import { fetchMovieByIdThunk, fetchMoviesThunk } from "../../stores/slices/movieSlice";
import type { Movie } from "../../types/movie";
import type { Province } from "../../types/province";
import type { ShowTimeResponse } from "../../types/showtime";
import {
    formatTime,
    parseActors,
    resolveMovieLandscapeImage,
    resolveMoviePortraitImage,
} from "../../utils/utils";

type ShowtimesPageProps = {
    slug: string;
    province?: string;
    day?: string;
};

type ProvinceFilterValue = "all" | number;

type GroupedCinemaShowtimes = {
    key: string;
    cinemaName: string;
    provinceName: string;
    roomTypes: Record<string, ShowTimeResponse[]>;
};

const getTodayAsLocalDate = () => {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
};

const isValidDayParam = (value?: string) => {
    if (!value) return false;
    return /^\d{4}-\d{2}-\d{2}$/.test(value);
};

type ShowtimesLocationState = {
    movieId?: number | string;
    movie?: Movie;
};

const ShowtimesPage = ({ slug, province, day }: ShowtimesPageProps) => {
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useAppDispatch();

    const user = useAppSelector((state) => state.auth.user);
    const cinemas = useAppSelector((state) => state.cinema.cinemas);
    const movies = useAppSelector((state) => state.movie.movies);
    const currentMovie = useAppSelector((state) => state.movie.currentMovie);

    const [provinces, setProvinces] = useState<Province[]>([]);
    const [showtimes, setShowtimes] = useState<ShowTimeResponse[]>([]);
    const [isShowtimeLoading, setIsShowtimeLoading] = useState(false);
    const [openSignIn, setOpenSignIn] = useState(false);
    const [fallbackRightMovies, setFallbackRightMovies] = useState<Movie[]>([]);

    const [selectedProvinceId, setSelectedProvinceId] =
        useState<ProvinceFilterValue>("all");
    const [selectedDay, setSelectedDay] = useState(getTodayAsLocalDate());
    const [isCustomDay, setIsCustomDay] = useState(false);

    const today = useMemo(() => getTodayAsLocalDate(), []);
    const normalizedProvinceId = useMemo(() => {
        if (!province || !/^\d+$/.test(province)) return undefined;
        return Number(province);
    }, [province]);
    const normalizedDay = useMemo(() => {
        const rawDay = day ?? "";
        if (!isValidDayParam(rawDay)) return undefined;
        return rawDay >= today ? rawDay : today;
    }, [day, today]);

    const effectiveProvinceId = normalizedProvinceId;
    const effectiveDay = normalizedDay ?? today;

    useEffect(() => {
        setSelectedProvinceId(effectiveProvinceId ?? "all");
        setSelectedDay(effectiveDay);
        setIsCustomDay(Boolean(normalizedDay && normalizedDay !== today));
    }, [effectiveDay, effectiveProvinceId, normalizedDay, today]);

    const selectedCinemaId = cinemas[0]?.cinemaId;

    const numericMovieId = useMemo(() => {
        if (!slug) return null;
        return /^\d+$/.test(slug) ? Number(slug) : null;
    }, [slug]);

    const locationMovieId = useMemo(() => {
        const state = location.state as ShowtimesLocationState | null;
        if (!state) return null;

        if (typeof state.movieId === "number") return state.movieId;
        if (typeof state.movieId === "string" && /^\d+$/.test(state.movieId)) {
            return Number(state.movieId);
        }

        if (state.movie?.movieId) return state.movie.movieId;
        return null;
    }, [location.state]);

    const locationMovie = useMemo(() => {
        const state = location.state as ShowtimesLocationState | null;
        return state?.movie ?? null;
    }, [location.state]);

    const [persistedMovieId, setPersistedMovieId] = useState<number | null>(
        numericMovieId ?? locationMovieId ?? locationMovie?.movieId ?? null
    );
    const [persistedMovie, setPersistedMovie] = useState<Movie | null>(locationMovie);

    useEffect(() => {
        if (numericMovieId) {
            setPersistedMovieId(numericMovieId);
            return;
        }

        if (locationMovieId) {
            setPersistedMovieId(locationMovieId);
        }
    }, [locationMovieId, numericMovieId]);

    useEffect(() => {
        if (!locationMovie?.movieId) return;
        setPersistedMovie(locationMovie);
    }, [locationMovie]);

    const preferredMovieId = numericMovieId ?? locationMovieId ?? persistedMovieId ?? null;

    const selectedMovie = useMemo(() => {
        if (preferredMovieId) {
            return (
                (currentMovie?.movieId === preferredMovieId ? currentMovie : null) ??
                movies.find((movie) => movie.movieId === preferredMovieId) ??
                (persistedMovie?.movieId === preferredMovieId ? persistedMovie : null) ??
                (locationMovie?.movieId === preferredMovieId ? locationMovie : null) ??
                null
            );
        }

        return (
            movies.find(
                (movie) => movie.slug === slug || String(movie.movieId) === slug
            ) ??
            persistedMovie ??
            (locationMovie && locationMovie.slug === slug ? locationMovie : null) ??
            null
        );
    }, [currentMovie, locationMovie, movies, persistedMovie, preferredMovieId, slug]);

    useEffect(() => {
        if (!selectedMovie?.movieId) return;
        setPersistedMovie(selectedMovie);
        setPersistedMovieId(selectedMovie.movieId);
    }, [selectedMovie]);

    const bookingSlug = useMemo(() => {
        const normalizedMovieSlug = selectedMovie?.slug?.trim();
        if (normalizedMovieSlug) return normalizedMovieSlug;
        const persistedMovieSlug = persistedMovie?.slug?.trim();
        if (persistedMovieSlug) return persistedMovieSlug;
        if (slug.trim()) return slug.trim();
        if (preferredMovieId) return String(preferredMovieId);
        if (selectedMovie?.movieId) return String(selectedMovie.movieId);
        return "";
    }, [persistedMovie, preferredMovieId, selectedMovie, slug]);

    useEffect(() => {
        dispatch(fetchCinemasThunk({ isShowing: true, status: "ACTIVE" }));
    }, [dispatch]);

    useEffect(() => {
        if (!selectedCinemaId) return;

        dispatch(
            fetchMoviesThunk({
                cinemaId: selectedCinemaId,
                params: {
                    cinemaId: selectedCinemaId,
                    status: "ACTIVE",
                    page: 1,
                    size: 50,
                },
            })
        );
    }, [dispatch, selectedCinemaId]);

    useEffect(() => {
        if (!preferredMovieId) return;
        dispatch(fetchMovieByIdThunk({ movieId: preferredMovieId, status: "ACTIVE" }));
    }, [dispatch, preferredMovieId]);

    useEffect(() => {
        let isUnmounted = false;

        const resolveMovieBySlug = async () => {
            if (preferredMovieId || selectedMovie || !slug.trim()) return;

            try {
                const response = await showTimeService.getGroupedShowTimesByFilters({
                    provinceId: effectiveProvinceId,
                    releaseDate: today,
                    releaseDateCondition: "GTE",
                    status: "SELLING",
                    page: 1,
                    size: 200,
                    sortBy: "showtime",
                    direction: "ASC",
                });

                if (isUnmounted || response.code !== "SUCCESS") return;

                const matchedMovie = response.result?.items?.find((item) => {
                    const itemSlug = item.movie?.slug?.trim();
                    return itemSlug === slug || String(item.movie?.movieId) === slug;
                })?.movie;

                if (!matchedMovie?.movieId) return;

                setPersistedMovie(matchedMovie);
                setPersistedMovieId(matchedMovie.movieId);
                dispatch(
                    fetchMovieByIdThunk({
                        movieId: matchedMovie.movieId,
                        status: "ACTIVE",
                    })
                );
            } catch {
                // Ignore fallback failures and keep the page functional with available data.
            }
        };

        void resolveMovieBySlug();

        return () => {
            isUnmounted = true;
        };
    }, [
        dispatch,
        effectiveProvinceId,
        preferredMovieId,
        selectedMovie,
        slug,
        today,
    ]);

    useEffect(() => {
        let isUnmounted = false;

        const fetchProvinceList = async () => {
            try {
                const response = await provinceService.getProvinceItemList("ACTIVE");
                if (isUnmounted) return;

                if (response.code === "SUCCESS") {
                    setProvinces(response.result?.items ?? []);
                    return;
                }

                setProvinces([]);
            } catch {
                if (!isUnmounted) {
                    setProvinces([]);
                }
            }
        };

        void fetchProvinceList();

        return () => {
            isUnmounted = true;
        };
    }, []);

    useEffect(() => {
        let isUnmounted = false;

        const fetchShowtimes = async () => {
            const targetMovieId = selectedMovie?.movieId ?? preferredMovieId;
            if (!targetMovieId) {
                setShowtimes([]);
                return;
            }

            setIsShowtimeLoading(true);

            try {
                const response = await showTimeService.getShowTimesByFilters({
                    movieId: targetMovieId,
                    provinceId: effectiveProvinceId,
                    releaseDate: effectiveDay,
                    releaseDateCondition: "EQ",
                    status: "SELLING",
                    page: 1,
                    size: 200,
                    sortBy: "showtime",
                    direction: "ASC",
                });

                if (isUnmounted) return;

                if (response.code !== "SUCCESS") {
                    setShowtimes([]);
                    return;
                }

                setShowtimes(response.result?.items ?? []);
            } catch {
                if (!isUnmounted) {
                    setShowtimes([]);
                }
            } finally {
                if (!isUnmounted) {
                    setIsShowtimeLoading(false);
                }
            }
        };

        void fetchShowtimes();

        return () => {
            isUnmounted = true;
        };
    }, [effectiveDay, effectiveProvinceId, preferredMovieId, selectedMovie?.movieId]);

    useEffect(() => {
        if (movies.length > 0) {
            setFallbackRightMovies([]);
            return;
        }

        let isUnmounted = false;

        const fetchFallbackRightMovies = async () => {
            try {
                const response = await showTimeService.getGroupedShowTimesByFilters({
                    provinceId: effectiveProvinceId,
                    releaseDate: today,
                    releaseDateCondition: "GTE",
                    status: "SELLING",
                    page: 1,
                    size: 12,
                    sortBy: "releaseDate",
                    direction: "ASC",
                });

                if (isUnmounted || response.code !== "SUCCESS") {
                    setFallbackRightMovies([]);
                    return;
                }

                const uniqueMovies = (response.result?.items ?? []).reduce<Movie[]>(
                    (accumulator, item) => {
                        if (!accumulator.some((movie) => movie.movieId === item.movie.movieId)) {
                            accumulator.push(item.movie);
                        }
                        return accumulator;
                    },
                    []
                );

                setFallbackRightMovies(uniqueMovies);
            } catch {
                if (!isUnmounted) {
                    setFallbackRightMovies([]);
                }
            }
        };

        void fetchFallbackRightMovies();

        return () => {
            isUnmounted = true;
        };
    }, [effectiveProvinceId, movies.length, today]);

    const rightSideMovies = useMemo(() => {
        const source = movies.length > 0 ? movies : fallbackRightMovies;
        const merged = [...source];

        if (selectedMovie && !merged.some((movie) => movie.movieId === selectedMovie.movieId)) {
            merged.unshift(selectedMovie);
        }

        return merged.slice(0, 4);
    }, [fallbackRightMovies, movies, selectedMovie]);

    const groupedShowtimes = useMemo<GroupedCinemaShowtimes[]>(() => {
        const groupedByCinema = new Map<string, GroupedCinemaShowtimes>();

        showtimes.forEach((showtime) => {
            const cinemaName = showtime.room?.cinema?.cinemaName ?? "Rap chua cap nhat";
            const provinceName =
                showtime.room?.cinema?.province?.provinceName ??
                showtime.room?.cinema?.provinceName ??
                "Khu vuc chua cap nhat";
            const roomTypeName = showtime.room?.roomType?.roomTypeName ?? "Suat chieu";
            const groupKey = `${provinceName}__${cinemaName}`;

            if (!groupedByCinema.has(groupKey)) {
                groupedByCinema.set(groupKey, {
                    key: groupKey,
                    cinemaName,
                    provinceName,
                    roomTypes: {},
                });
            }

            const cinemaGroup = groupedByCinema.get(groupKey);
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

        return Array.from(groupedByCinema.values());
    }, [showtimes]);

    const buildShowtimesPath = (
        nextProvinceId: ProvinceFilterValue,
        nextDay: string,
        useCustomDay: boolean
    ) => {
        const normalizedSlug =
            selectedMovie?.slug?.trim() ||
            persistedMovie?.slug?.trim() ||
            (preferredMovieId ? String(preferredMovieId) : slug);

        if (nextProvinceId === "all") {
            if (useCustomDay && nextDay !== today) {
                return `/xuat-chieu/${normalizedSlug}/day/${nextDay}`;
            }

            return `/xuat-chieu/${normalizedSlug}`;
        }

        if (useCustomDay && nextDay !== today) {
            return `/xuat-chieu/${normalizedSlug}/province/${nextProvinceId}/day/${nextDay}`;
        }

        return `/xuat-chieu/${normalizedSlug}/province/${nextProvinceId}`;
    };

    const handleProvinceChange = (rawProvinceId: string) => {
        const nextProvinceId: ProvinceFilterValue = rawProvinceId
            ? Number(rawProvinceId)
            : "all";

        setSelectedProvinceId(nextProvinceId);

        const targetPath = buildShowtimesPath(nextProvinceId, selectedDay, isCustomDay);
        navigate(targetPath, {
            state: {
                movieId: preferredMovieId ?? selectedMovie?.movieId ?? persistedMovie?.movieId,
                movie: selectedMovie ?? persistedMovie ?? locationMovie ?? undefined,
            } satisfies ShowtimesLocationState,
        });
    };

    const handleDayChange = (rawDay: string) => {
        const normalizedRawDay = rawDay && rawDay < today ? today : rawDay;
        const nextDay = normalizedRawDay || today;
        const nextIsCustomDay = nextDay !== today;

        setSelectedDay(nextDay);
        setIsCustomDay(nextIsCustomDay);

        const targetPath = buildShowtimesPath(
            selectedProvinceId,
            nextDay,
            nextIsCustomDay
        );
        navigate(targetPath, {
            state: {
                movieId: preferredMovieId ?? selectedMovie?.movieId ?? persistedMovie?.movieId,
                movie: selectedMovie ?? persistedMovie ?? locationMovie ?? undefined,
            } satisfies ShowtimesLocationState,
        });
    };

    const handleOpenTrailer = () => {
        const trailerUrl = selectedMovie?.trailerUrl?.trim();
        if (!trailerUrl) {
            toast.error("Phim nay chua co trailer");
            return;
        }

        window.open(trailerUrl, "_blank", "noopener,noreferrer");
    };

    return (
        <div>
            <div className="mb-4">
                <div className="relative bg-black flex justify-center w-full h-full">
                    <div className="absolute w-full h-full z-[10] bg-[#0003]"></div>
                    <div className="relative h-full">
                        <div className="relative">
                            <img
                                src={resolveMovieLandscapeImage(selectedMovie?.imageLandscape)}
                                className="w-[860px] h-full lg:h-[500px] object-cover"
                            />
                            <button
                                type="button"
                                onClick={handleOpenTrailer}
                                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[200] cursor-pointer"
                                title="Xem trailer"
                            >
                                <img
                                    src="/images/button-play.png"
                                    className="w-[40px] h-[40px] lg:w-[64px] lg:h-[64px]"
                                />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-7 my-0 mx-auto xl:max-w-7xl lg:max-w-4xl md:max-w-4xl gap-8 py-7 md:px-4 px-4">
                    <div className="book__left lg:col-span-5 w-full">
                        <div className="movie__info relative lg:grid hidden grid-cols-3 lg:gap-5 gap-3 lg:items-end">
                            <div className="movie__thumbnail lg:-translate-y-16 col-span-1 drop-shadow-2xl z-[500]">
                                <img
                                    alt={selectedMovie?.movieName}
                                    loading="lazy"
                                    width="220"
                                    height="280"
                                    src={resolveMoviePortraitImage(selectedMovie?.imagePortrait)}
                                    className="border-2 rounded border-white lg:w-[320px] lg:h-100 w-full h-full object-cover"
                                    style={{ color: "transparent" }}
                                />
                            </div>

                            <div className="col-span-2 lg:-translate-y-16 flex flex-col justify-end">
                                <div className="item__title flex items-center">
                                    <h1 className="text-[20px] md:text-[24px] lg:text-[28px] font-bold text-black-10 mr-4">
                                        {selectedMovie?.movieName}
                                    </h1>
                                    <span className="inline-flex items-center justify-center w-[38px] h-7 bg-[rgb(245,128,32)] rounded text-sm text-center text-white font-bold">
                                        T{selectedMovie?.minimumAge}
                                    </span>
                                </div>

                                <div className="flex items-center">
                                    <div className="text-sm flex items-center font-semibold">
                                        <Clock />
                                        <span>{selectedMovie?.durationMinutes} Phut</span>
                                    </div>
                                    <div className="text-sm ml-4 flex items-center font-semibold">
                                        <Calendar />
                                        {new Date(
                                            selectedMovie?.createdAt || ""
                                        ).toLocaleDateString("vi-VN")}
                                    </div>
                                </div>

                                <div className="mt-2">
                                    <span className="text-[20px] flex items-center">
                                        <Vote />
                                        <span className="mr-1">{selectedMovie?.ratingAverage}</span>
                                        <span className="text-sm text-gray-500">
                                            ({selectedMovie?.totalVotes})
                                        </span>
                                    </span>
                                </div>

                                <div className="flex flex-col gap-1 mt-2">
                                    <div className="flex text-sm mb-2">
                                        <span className="text-gray-500">Quoc gia:</span>
                                        <span className="ml-4">{selectedMovie?.country}</span>
                                    </div>
                                    <div className="flex text-sm mb-2">
                                        <span className="text-gray-500">Nha san xuat:</span>
                                        <span className="ml-4">{selectedMovie?.producer}</span>
                                    </div>
                                    <div className="flex text-sm">
                                        <span className="text-gray-500 w-[70px]">Dao dien:</span>
                                        <span className="ml-2 border border-gray-300 px-3 py-1 rounded-lg">
                                            {selectedMovie?.director}
                                        </span>
                                    </div>
                                    <div className="flex text-sm">
                                        <span className="text-gray-500 w-[70px]">Dien vien:</span>
                                        <div className="flex flex-wrap gap-2 ml-2">
                                            {parseActors(selectedMovie?.actors).map((actor, index) => (
                                                <span
                                                    key={index}
                                                    className="border border-gray-300 px-3 py-1 rounded-lg"
                                                >
                                                    {actor}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="movie__content mt-3 mb-1 lg:mt-0">
                            <span className="border-l-4 border-solid border-blue-800 mr-2"></span>
                            <h1 className="mb-4 text-base inline-block capitalize font-bold">
                                Noi dung phim
                            </h1>
                            <div className="text-black-10 text-sm font-normal content-text">
                                <p className="mb-1">
                                    <strong className="text-[#485fc7]">{selectedMovie?.movieName}</strong>{" "}
                                    {selectedMovie?.description}
                                </p>
                            </div>
                        </div>

                        <div className="show__time">
                            <div className="movie__showtime-header">
                                <span className="border-l-4 border-solid border-blue-800 mr-2" />
                                <h1 className="mb-4 text-base inline-block capitalize font-bold">
                                    Lich chieu
                                </h1>
                            </div>

                            <div className="movie__filter grid grid-cols-1 sm:grid-cols-2 gap-4 items-end mb-4">
                                <div>
                                    <label className="text-sm font-semibold text-[#034ea2]">Khu vuc</label>
                                    <select
                                        value={
                                            selectedProvinceId === "all"
                                                ? ""
                                                : String(selectedProvinceId)
                                        }
                                        onChange={(event) => {
                                            handleProvinceChange(event.target.value);
                                        }}
                                        className="w-full mt-2 h-10 border border-gray-300 rounded px-3 outline-none focus:border-[#034ea2]"
                                    >
                                        <option value="">Tat ca khu vuc</option>
                                        {provinces.map((item) => (
                                            <option key={item.provinceId} value={item.provinceId}>
                                                {item.provinceName}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="text-sm font-semibold text-[#034ea2]">Ngay chieu</label>
                                    <input
                                        type="date"
                                        value={selectedDay}
                                        min={today}
                                        onChange={(event) => {
                                            handleDayChange(event.target.value);
                                        }}
                                        className="w-full mt-2 h-10 border border-gray-300 rounded px-3 outline-none focus:border-[#034ea2]"
                                    />
                                </div>
                            </div>

                            <div className="w-full h-0.5 bg-[#034ea2] my-4"></div>

                            <div className="showtime__list">
                                {isShowtimeLoading ? (
                                    <p className="px-3 py-4 text-sm text-gray-500">Dang tai suat chieu...</p>
                                ) : groupedShowtimes.length === 0 ? (
                                    <p className="px-3 py-4 text-sm text-gray-500">
                                        Chua co suat chieu phu hop bo loc.
                                    </p>
                                ) : (
                                    groupedShowtimes.map((cinemaGroup, cinemaIndex) => (
                                        <div
                                            key={cinemaGroup.key}
                                            className={`showtime__cinema md:py-8 py-4 px-3 ${
                                                cinemaIndex % 2 === 0 ? "bg-white" : "bg-[#FDFBFA]"
                                            }`}
                                        >
                                            <h1 className="text-base font-bold mb-4">
                                                {cinemaGroup.cinemaName} - {cinemaGroup.provinceName}
                                            </h1>

                                            {Object.entries(cinemaGroup.roomTypes).map(
                                                ([roomType, shows]) => (
                                                    <div
                                                        key={roomType}
                                                        className="showtime__bundle flex md:flex-row flex-col gap-2 items-start mb-6"
                                                    >
                                                        <label className="text-sm font-semibold text-grey-10 mt-2 w-[150px]">
                                                            {roomType}
                                                        </label>

                                                        <div className="time__show flex flex-1 flex-row gap-x-3 gap-y-1 flex-wrap">
                                                            <Signin
                                                                open={openSignIn}
                                                                setOpen={setOpenSignIn}
                                                            />
                                                            {[...shows]
                                                                .sort((a, b) =>
                                                                    a.startTime.localeCompare(
                                                                        b.startTime
                                                                    )
                                                                )
                                                                .map((show) => (
                                                                    <Link
                                                                        key={show.showTimeId}
                                                                        onClick={(event) => {
                                                                            if (!user) {
                                                                                event.preventDefault();
                                                                                setOpenSignIn(true);
                                                                            }
                                                                        }}
                                                                        state={{
                                                                            showTimeId: show.showTimeId,
                                                                        }}
                                                                        to={`/dat-ve/${
                                                                            bookingSlug ||
                                                                            show.movieId
                                                                        }/showtime/${
                                                                            show.showTimeId
                                                                        }`}
                                                                        className="py-2 md:px-8 px-6 border border-gray-300 rounded text-sm font-normal text-black-10 active:bg-[#034ea2] transition-all duration-500 ease-in-out hover:text-white hover:bg-[#034ea2]"
                                                                    >
                                                                        {formatTime(show.startTime)}
                                                                    </Link>
                                                                ))}
                                                        </div>
                                                    </div>
                                                )
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="book__right hidden xl:block lg:col-span-2 w-full overflow-hidden">
                        <div className="mb-4">
                            <span className="border-l-4 border-solid border-blue-10 mr-2" />
                            <h1 className="text-xl inline-block uppercase font-semibold">
                                Phim dang chieu
                            </h1>
                        </div>
                        <div className="movie__content">
                            <div className="flex flex-col gap-12 justify-between">
                                {rightSideMovies.map((movie) => (
                                    <Card key={movie.movieId} w={400} h={250} movie={movie} />
                                ))}
                            </div>
                        </div>
                        <div className="film__footer text-center transition-all duration-300 mt-15">
                            <Link
                                to="/phim-dang-chieu"
                                className="text-[#f26b38] hover:text-white w-40 border border-[#fb9440] hover:bg-[#fb9440] transition-all duration-300 focus:ring-1 focus:outline-none focus:ring-[#fb9440] rounded text-sm px-5 py-2.5 text-center inline-flex items-center mr-2 mb-2 justify-center"
                            >
                                Xem them
                                <ArrowRight />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ShowtimesPage;
