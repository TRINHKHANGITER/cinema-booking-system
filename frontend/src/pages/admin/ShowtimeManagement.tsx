import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { toast } from "sonner";
import Close from "../../components/icon/close";
import { cinemaService } from "../../services/cinema.service";
import { movieService } from "../../services/movie.service";
import { movieTypeService } from "../../services/movieType.service";
import { provinceService } from "../../services/province.service";
import { roomService } from "../../services/room.service";
import { showTimeSeatService } from "../../services/showtimeSeat.service";
import { showTimeService } from "../../services/showtimeService";
import type { CinemaResponse } from "../../types/cinema";
import type { Movie, MovieStatus } from "../../types/movie";
import type { MovieTypeResponse } from "../../types/movie-type";
import type { ProvinceResponse } from "../../types/province";
import type { RoomResponse, RoomStatus } from "../../types/room";
import type { ShowTimeSeat } from "../../types/showtime-seat";
import type {
    ShowTimeCreationRequest,
    ShowTimeResponse,
    ShowTimeStatus,
    ShowTimeUpdateRequest,
} from "../../types/showtime";
import { resolveApiErrorMessage, resolveMoviePortraitImage } from "../../utils/utils";

const defaultShowtimeStatuses: ShowTimeStatus[] = [
    "SCHEDULED",
    "SELLING",
    "STOPPED",
    "COMPLETED",
    "CANCELLED",
];

const movieStatusOptions: MovieStatus[] = ["ACTIVE", "COMING_SOON", "STOPPED", "INACTIVE"];

const statusClassByShowTimeStatus: Record<ShowTimeStatus, string> = {
    SCHEDULED: "bg-sky-100 text-sky-700",
    SELLING: "bg-emerald-100 text-emerald-700",
    STOPPED: "bg-amber-100 text-amber-700",
    COMPLETED: "bg-slate-200 text-slate-700",
    CANCELLED: "bg-rose-100 text-rose-700",
};

type SeatVariant = "STANDARD" | "VIP" | "COUPLE";

type ModalShellProps = {
    open: boolean;
    title: string;
    onClose: () => void;
    panelClassName?: string;
    children: ReactNode;
};

type FormMode = "create" | "edit";

type ShowtimeFilters = {
    showTimeId?: number;
    movieName: string;
    movieId?: number;
    provinceId?: number;
    cinemaId?: number;
    movieTypeId?: number;
    releaseFromDate?: string;
    releaseToDate?: string;
    startTime?: string;
    endTime?: string;
    status?: ShowTimeStatus;
    page: number;
    size: number;
};

type ShowtimeFormValues = {
    movieId: number | null;
    roomId: number | null;
    provinceId: number | null;
    cinemaId: number | null;
    releaseDate: string;
    startTime: string;
    endTime: string;
    status: ShowTimeStatus;
};

const todayDateString = () => new Date().toISOString().slice(0, 10);

const toDisplayDate = (value: string | null | undefined, fallback = "-") => {
    if (!value) return fallback;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString("vi-VN");
};

const normalizeTimeInput = (value: string | null | undefined) => {
    if (!value) return "";

    if (value.includes(":")) {
        const parts = value.split(":");
        if (parts.length >= 2) {
            return `${parts[0].padStart(2, "0")}:${parts[1].padStart(2, "0")}`;
        }
    }

    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) {
        return parsed.toLocaleTimeString("en-GB", {
            hour12: false,
            hour: "2-digit",
            minute: "2-digit",
        });
    }

    return "";
};

const toApiTime = (value: string) => {
    if (!value) return value;
    return value.length === 5 ? `${value}:00` : value;
};

const formatShowTimePeriod = (showTime: ShowTimeResponse) => {
    const start = normalizeTimeInput(showTime.startTime) || "--:--";
    const end = normalizeTimeInput(showTime.endTime) || "--:--";
    return `${start} - ${end}`;
};

const resolveProvinceIdFromShowTime = (showTime: ShowTimeResponse) => {
    return showTime.room?.cinema?.provinceId ?? showTime.room?.cinema?.province?.provinceId ?? null;
};

const resolveCinemaIdFromShowTime = (showTime: ShowTimeResponse) => {
    return showTime.room?.cinemaId ?? showTime.room?.cinema?.cinemaId ?? null;
};

const resolveProvinceNameFromShowTime = (showTime: ShowTimeResponse) => {
    return (
        showTime.room?.cinema?.provinceName ?? showTime.room?.cinema?.province?.provinceName ?? "-"
    );
};

const resolveCinemaNameFromShowTime = (showTime: ShowTimeResponse) => {
    return showTime.room?.cinema?.cinemaName ?? "-";
};

const resolveRoomNameFromShowTime = (showTime: ShowTimeResponse) => {
    return showTime.room?.roomName ?? (showTime.roomId ? `#${showTime.roomId}` : "-");
};

const buildDefaultFormValues = (status: ShowTimeStatus): ShowtimeFormValues => ({
    movieId: null,
    roomId: null,
    provinceId: null,
    cinemaId: null,
    releaseDate: todayDateString(),
    startTime: "",
    endTime: "",
    status,
});

const normalizeKeyword = (value?: string | null) => {
    return (value ?? "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d")
        .replace(/Đ/g, "d")
        .toLowerCase()
        .trim();
};

const resolveSeatVariant = (seatTypeId?: number, seatTypeName?: string | null): SeatVariant => {
    if (seatTypeId === 3) return "COUPLE";
    if (seatTypeId === 2) return "VIP";

    const keyword = normalizeKeyword(seatTypeName);
    if (keyword.includes("vip")) return "VIP";
    if (keyword.includes("doi") || keyword.includes("couple") || keyword.includes("double")) {
        return "COUPLE";
    }
    return "STANDARD";
};

const resolveMergedSeatStatus = (seats: ShowTimeSeat[]) => {
    if (seats.some((seat) => seat.status === "SOLD")) return "SOLD";
    if (seats.some((seat) => seat.status === "HELD")) return "HELD";
    if (seats.some((seat) => seat.status === "BLOCKED")) return "BLOCKED";
    return "AVAILABLE";
};

const ModalShell = ({ open, title, onClose, panelClassName, children }: ModalShellProps) => {
    return (
        <div
            className={`fixed inset-0 z-[1000] grid h-screen w-screen place-items-center bg-black/45 px-4 transition-opacity duration-300 ${
                open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
            }`}
        >
            <div
                className={`relative max-h-[92vh] w-full max-w-[900px] overflow-y-auto rounded-md bg-white px-6 py-6 shadow-2xl ${
                    panelClassName ?? ""
                }`}
            >
                <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-lg font-bold text-slate-800">{title}</h3>
                    <button
                        type="button"
                        onClick={onClose}
                        className="inline-flex h-7 w-7 items-center justify-center rounded-full transition hover:bg-slate-100"
                    >
                        <Close />
                    </button>
                </div>
                {children}
            </div>
        </div>
    );
};

const ShowtimeManagement = () => {
    const [showtimes, setShowtimes] = useState<ShowTimeResponse[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const [provinces, setProvinces] = useState<ProvinceResponse[]>([]);
    const [movieTypes, setMovieTypes] = useState<MovieTypeResponse[]>([]);
    const [showtimeStatuses, setShowtimeStatuses] =
        useState<ShowTimeStatus[]>(defaultShowtimeStatuses);

    const [filterCinemas, setFilterCinemas] = useState<CinemaResponse[]>([]);

    const [movieNameInput, setMovieNameInput] = useState("");
    const [movieIdInput, setMovieIdInput] = useState<number | "">("");
    const [showTimeIdInput, setShowTimeIdInput] = useState<number | "">("");
    const [provinceInput, setProvinceInput] = useState<number | "">("");
    const [cinemaInput, setCinemaInput] = useState<number | "">("");
    const [movieTypeInput, setMovieTypeInput] = useState<number | "">("");
    const [releaseDateInput, setReleaseDateInput] = useState("");
    const [startTimeInput, setStartTimeInput] = useState("");
    const [endTimeInput, setEndTimeInput] = useState("");
    const [statusInput, setStatusInput] = useState<ShowTimeStatus | "">("");

    const [filters, setFilters] = useState<ShowtimeFilters>({
        showTimeId: undefined,
        movieName: "",
        page: 1,
        size: 10,
    });

    const [totalItems, setTotalItems] = useState(0);
    const [totalPages, setTotalPages] = useState(1);

    const [formMode, setFormMode] = useState<FormMode>("create");
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingShowTimeId, setEditingShowTimeId] = useState<number | null>(null);
    const [formValues, setFormValues] = useState<ShowtimeFormValues>(() =>
        buildDefaultFormValues(defaultShowtimeStatuses[0])
    );
    const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
    const [formCinemas, setFormCinemas] = useState<CinemaResponse[]>([]);
    const [formRooms, setFormRooms] = useState<RoomResponse[]>([]);
    const [isSaving, setIsSaving] = useState(false);

    const [deleteTarget, setDeleteTarget] = useState<ShowTimeResponse | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isSeatMapOpen, setIsSeatMapOpen] = useState(false);
    const [isSeatMapLoading, setIsSeatMapLoading] = useState(false);
    const [seatMapTarget, setSeatMapTarget] = useState<ShowTimeResponse | null>(null);
    const [seatMapItems, setSeatMapItems] = useState<ShowTimeSeat[]>([]);

    const [isMovieSearchOpen, setIsMovieSearchOpen] = useState(false);
    const [movieSearchName, setMovieSearchName] = useState("");
    const [movieSearchTypeId, setMovieSearchTypeId] = useState<number | "">("");
    const [movieSearchStatus, setMovieSearchStatus] = useState<MovieStatus | "">("ACTIVE");
    const [movieSearchPage, setMovieSearchPage] = useState(1);
    const [movieSearchSize, setMovieSearchSize] = useState(10);
    const [movieSearchTotalPages, setMovieSearchTotalPages] = useState(1);
    const [movieSearchTotalItems, setMovieSearchTotalItems] = useState(0);
    const [movieSearchResults, setMovieSearchResults] = useState<Movie[]>([]);
    const [movieSearchLoading, setMovieSearchLoading] = useState(false);

    const showtimeRows = useMemo(() => {
        return [...showtimes].sort((first, second) => {
            const firstKey = `${first.releaseDate} ${first.startTime}`;
            const secondKey = `${second.releaseDate} ${second.startTime}`;
            return firstKey.localeCompare(secondKey);
        });
    }, [showtimes]);

    const visiblePages = useMemo(() => {
        const maxButtons = 5;
        if (totalPages <= maxButtons) {
            return Array.from({ length: totalPages }, (_, index) => index + 1);
        }

        let start = Math.max(1, filters.page - 2);
        const end = Math.min(totalPages, start + maxButtons - 1);
        if (end - start + 1 < maxButtons) {
            start = Math.max(1, end - maxButtons + 1);
        }

        const pages: number[] = [];
        for (let page = start; page <= end; page += 1) {
            pages.push(page);
        }
        return pages;
    }, [filters.page, totalPages]);

    const movieSearchVisiblePages = useMemo(() => {
        const maxButtons = 5;
        if (movieSearchTotalPages <= maxButtons) {
            return Array.from({ length: movieSearchTotalPages }, (_, index) => index + 1);
        }

        let start = Math.max(1, movieSearchPage - 2);
        const end = Math.min(movieSearchTotalPages, start + maxButtons - 1);
        if (end - start + 1 < maxButtons) {
            start = Math.max(1, end - maxButtons + 1);
        }

        const pages: number[] = [];
        for (let page = start; page <= end; page += 1) {
            pages.push(page);
        }
        return pages;
    }, [movieSearchPage, movieSearchTotalPages]);

    const seatMapRows = useMemo(() => {
        const grouped = new Map<string, ShowTimeSeat[]>();
        for (const seat of seatMapItems) {
            if (!grouped.has(seat.seatRow)) {
                grouped.set(seat.seatRow, []);
            }
            grouped.get(seat.seatRow)?.push(seat);
        }

        return Array.from(grouped.entries())
            .sort(([first], [second]) => first.localeCompare(second))
            .map(([row, rowSeats]) => ({
                row,
                seats: [...rowSeats].sort((first, second) => first.seatColumn - second.seatColumn),
            }));
    }, [seatMapItems]);

    const seatMapSummary = useMemo(
        () =>
            seatMapItems.reduce(
                (accumulator, seat) => {
                    if (seat.status === "SOLD") accumulator.sold += 1;
                    if (seat.status === "HELD") accumulator.held += 1;
                    if (seat.status === "BLOCKED") accumulator.blocked += 1;
                    if (seat.status === "AVAILABLE") accumulator.available += 1;
                    return accumulator;
                },
                { available: 0, held: 0, sold: 0, blocked: 0 }
            ),
        [seatMapItems]
    );

    const fetchFilterCinemas = useCallback(async (provinceId?: number) => {
        const response = await cinemaService.getCinemaItemList({
            provinceId,
            status: "ACTIVE",
        });
        return response.result?.items ?? [];
    }, []);

    const fetchFormCinemas = useCallback(async (provinceId?: number) => {
        const response = await cinemaService.getCinemaItemList({
            provinceId,
            status: "ACTIVE",
        });
        return response.result?.items ?? [];
    }, []);

    const fetchFormRooms = useCallback(async (cinemaId?: number) => {
        const response = await roomService.getRoomItemList({
            cinemaId,
            status: "ACTIVE" as RoomStatus,
        });
        return response.result?.items ?? [];
    }, []);

    const fetchMovieSearch = useCallback(
        async (page: number) => {
            try {
                setMovieSearchLoading(true);
                const response = await movieService.filterMovies({
                    name: movieSearchName.trim() || undefined,
                    movieTypeId: movieSearchTypeId === "" ? undefined : movieSearchTypeId,
                    status: movieSearchStatus === "" ? undefined : movieSearchStatus,
                    page,
                    size: movieSearchSize,
                });

                if (response.code !== "SUCCESS") {
                    toast.error(response.message || "Không thể tìm danh sách phim");
                    setMovieSearchResults([]);
                    setMovieSearchTotalItems(0);
                    setMovieSearchTotalPages(1);
                    return;
                }

                const result = response.result;
                if (!result) {
                    setMovieSearchResults([]);
                    setMovieSearchTotalItems(0);
                    setMovieSearchTotalPages(1);
                    return;
                }

                setMovieSearchResults(result.items ?? []);
                setMovieSearchTotalItems(result.totalItems ?? 0);
                setMovieSearchTotalPages(Math.max(1, result.totalPages ?? 1));
            } catch (error) {
                toast.error(resolveApiErrorMessage(error, "Không thể tìm danh sách phim"));
                setMovieSearchResults([]);
                setMovieSearchTotalItems(0);
                setMovieSearchTotalPages(1);
            } finally {
                setMovieSearchLoading(false);
            }
        },
        [movieSearchName, movieSearchSize, movieSearchStatus, movieSearchTypeId]
    );

    const fetchShowtimes = useCallback(async () => {
        try {
            setIsLoading(true);

            const response = await showTimeService.getShowTimesByFilters({
                showTimeId: filters.showTimeId,
                movieName: filters.movieName,
                movieId: filters.movieId,
                provinceId: filters.provinceId,
                cinemaId: filters.cinemaId,
                movieTypeId: filters.movieTypeId,
                releaseFromDate: filters.releaseFromDate,
                releaseToDate: filters.releaseToDate,
                startTime: filters.startTime,
                endTime: filters.endTime,
                status: filters.status,
                page: filters.page,
                size: filters.size,
                sortBy: "showtime",
                direction: "ASC",
            });

            if (response.code !== "SUCCESS") {
                toast.error(response.message || "Không thể tải danh sách suất chiếu");
                setShowtimes([]);
                setTotalItems(0);
                setTotalPages(1);
                return;
            }

            const result = response.result;
            if (!result) {
                setShowtimes([]);
                setTotalItems(0);
                setTotalPages(1);
                return;
            }

            const items = result.items ?? [];
            const uniqueMovieIds = Array.from(
                new Set(
                    items
                        .map((item) => item.movieId)
                        .filter((movieId): movieId is number => Number.isInteger(movieId))
                )
            );

            const movieById = new Map<number, Movie>();
            if (uniqueMovieIds.length > 0) {
                const movieResponses = await Promise.all(
                    uniqueMovieIds.map(async (movieId) => {
                        try {
                            return await movieService.getMovieByIdAndStatus(movieId);
                        } catch {
                            return null;
                        }
                    })
                );

                movieResponses.forEach((movieResponse, index) => {
                    if (movieResponse?.code === "SUCCESS" && movieResponse.result) {
                        movieById.set(uniqueMovieIds[index], movieResponse.result);
                    }
                });
            }

            const hydratedShowtimes = items.map((item) => ({
                ...item,
                movie: movieById.get(item.movieId) ?? item.movie,
            }));

            setShowtimes(hydratedShowtimes);
            setTotalItems(result.totalItems ?? 0);
            setTotalPages(Math.max(1, result.totalPages ?? 1));
        } catch (error) {
            toast.error(resolveApiErrorMessage(error, "Không thể tải danh sách suất chiếu"));
            setShowtimes([]);
            setTotalItems(0);
            setTotalPages(1);
        } finally {
            setIsLoading(false);
        }
    }, [filters]);

    const fetchInitialOptions = useCallback(async () => {
        const [provinceResult, movieTypeResult, statusResult, cinemaResult] =
            await Promise.allSettled([
                provinceService.getProvinceItemList("ACTIVE"),
                movieTypeService.getMovieTypeItemList("ACTIVE"),
                showTimeService.getAllShowTimeStatuses(),
                fetchFilterCinemas(undefined),
            ]);

        if (provinceResult.status === "fulfilled") {
            setProvinces(provinceResult.value.result?.items ?? []);
        } else {
            setProvinces([]);
        }

        if (movieTypeResult.status === "fulfilled") {
            setMovieTypes(movieTypeResult.value.result?.items ?? []);
        } else {
            setMovieTypes([]);
        }

        if (statusResult.status === "fulfilled") {
            const statuses = statusResult.value.result?.items ?? defaultShowtimeStatuses;
            setShowtimeStatuses(statuses.length > 0 ? statuses : defaultShowtimeStatuses);
        } else {
            setShowtimeStatuses(defaultShowtimeStatuses);
        }

        if (cinemaResult.status === "fulfilled") {
            setFilterCinemas(cinemaResult.value);
        } else {
            setFilterCinemas([]);
        }
    }, [fetchFilterCinemas]);

    useEffect(() => {
        void fetchInitialOptions();
    }, [fetchInitialOptions]);

    useEffect(() => {
        void fetchShowtimes();
    }, [fetchShowtimes]);

    useEffect(() => {
        if (!isMovieSearchOpen) return;
        void fetchMovieSearch(movieSearchPage);
    }, [fetchMovieSearch, isMovieSearchOpen, movieSearchPage]);

    useEffect(() => {
        if (showtimeStatuses.length === 0) return;
        setFormValues((prev) => {
            if (showtimeStatuses.includes(prev.status)) {
                return prev;
            }
            return {
                ...prev,
                status: showtimeStatuses[0],
            };
        });
    }, [showtimeStatuses]);

    const applyFilters = () => {
        setFilters((prev) => ({
            ...prev,
            showTimeId: showTimeIdInput === "" ? undefined : showTimeIdInput,
            movieName: movieNameInput.trim(),
            movieId: movieIdInput === "" ? undefined : movieIdInput,
            provinceId: provinceInput === "" ? undefined : provinceInput,
            cinemaId: cinemaInput === "" ? undefined : cinemaInput,
            movieTypeId: movieTypeInput === "" ? undefined : movieTypeInput,
            releaseFromDate: releaseDateInput || undefined,
            releaseToDate: releaseDateInput || undefined,
            startTime: startTimeInput ? toApiTime(startTimeInput) : undefined,
            endTime: endTimeInput ? toApiTime(endTimeInput) : undefined,
            status: statusInput === "" ? undefined : statusInput,
            page: 1,
        }));
    };

    const resetFilters = async () => {
        setMovieNameInput("");
        setMovieIdInput("");
        setShowTimeIdInput("");
        setProvinceInput("");
        setCinemaInput("");
        setMovieTypeInput("");
        setReleaseDateInput("");
        setStartTimeInput("");
        setEndTimeInput("");
        setStatusInput("");

        try {
            const cinemas = await fetchFilterCinemas(undefined);
            setFilterCinemas(cinemas);
        } catch {
            setFilterCinemas([]);
        }

        setFilters((prev) => ({
            ...prev,
            showTimeId: undefined,
            movieName: "",
            movieId: undefined,
            provinceId: undefined,
            cinemaId: undefined,
            movieTypeId: undefined,
            releaseFromDate: undefined,
            releaseToDate: undefined,
            startTime: undefined,
            endTime: undefined,
            status: undefined,
            page: 1,
        }));
    };

    const handleFilterProvinceChange = async (value: string) => {
        const nextProvinceId = value ? Number(value) : "";
        setProvinceInput(nextProvinceId);
        setCinemaInput("");

        try {
            const cinemas = await fetchFilterCinemas(
                nextProvinceId === "" ? undefined : nextProvinceId
            );
            setFilterCinemas(cinemas);
        } catch {
            setFilterCinemas([]);
        }
    };

    const openCreateModal = () => {
        const defaultStatus = showtimeStatuses[0] ?? defaultShowtimeStatuses[0];
        setFormMode("create");
        setEditingShowTimeId(null);
        setSelectedMovie(null);
        setFormCinemas([]);
        setFormRooms([]);
        setFormValues(buildDefaultFormValues(defaultStatus));
        setIsFormOpen(true);
    };

    const openEditModal = (showTime: ShowTimeResponse) => {
        const provinceId = resolveProvinceIdFromShowTime(showTime);
        const cinemaId = resolveCinemaIdFromShowTime(showTime);

        setFormMode("edit");
        setEditingShowTimeId(showTime.showTimeId);
        setSelectedMovie(showTime.movie ?? null);
        setFormValues({
            movieId: showTime.movieId,
            roomId: showTime.roomId,
            provinceId,
            cinemaId,
            releaseDate: showTime.releaseDate,
            startTime: normalizeTimeInput(showTime.startTime),
            endTime: normalizeTimeInput(showTime.endTime),
            status: showTime.status,
        });
        setIsFormOpen(true);

        void (async () => {
            try {
                const [cinemas, rooms] = await Promise.all([
                    fetchFormCinemas(provinceId ?? undefined),
                    fetchFormRooms(cinemaId ?? undefined),
                ]);
                setFormCinemas(cinemas);
                setFormRooms(rooms);
            } catch {
                setFormCinemas([]);
                setFormRooms([]);
            }
        })();
    };

    const closeFormModal = () => {
        setIsFormOpen(false);
        setEditingShowTimeId(null);
        setSelectedMovie(null);
        setFormCinemas([]);
        setFormRooms([]);
    };

    const handleFormProvinceChange = async (value: string) => {
        const nextProvinceId = value ? Number(value) : null;
        setFormValues((prev) => ({
            ...prev,
            provinceId: nextProvinceId,
            cinemaId: null,
            roomId: null,
        }));

        if (!nextProvinceId) {
            setFormCinemas([]);
            setFormRooms([]);
            return;
        }

        try {
            const cinemas = await fetchFormCinemas(nextProvinceId);
            setFormCinemas(cinemas);
            setFormRooms([]);
        } catch {
            setFormCinemas([]);
            setFormRooms([]);
        }
    };

    const handleFormCinemaChange = async (value: string) => {
        const nextCinemaId = value ? Number(value) : null;
        setFormValues((prev) => ({
            ...prev,
            cinemaId: nextCinemaId,
            roomId: null,
        }));

        if (!nextCinemaId) {
            setFormRooms([]);
            return;
        }

        try {
            const rooms = await fetchFormRooms(nextCinemaId);
            setFormRooms(rooms);
        } catch {
            setFormRooms([]);
        }
    };

    const openMovieSearchModal = () => {
        setMovieSearchPage(1);
        setIsMovieSearchOpen(true);
    };

    const closeMovieSearchModal = () => {
        setIsMovieSearchOpen(false);
    };

    const openSeatMapModal = (showTime: ShowTimeResponse) => {
        setSeatMapTarget(showTime);
        setSeatMapItems([]);
        setIsSeatMapOpen(true);
    };

    const closeSeatMapModal = () => {
        setIsSeatMapOpen(false);
        setIsSeatMapLoading(false);
        setSeatMapTarget(null);
        setSeatMapItems([]);
    };

    useEffect(() => {
        if (!isSeatMapOpen || !seatMapTarget) return;

        let isCancelled = false;

        const fetchSeatMap = async () => {
            try {
                setIsSeatMapLoading(true);
                const response = await showTimeSeatService.getSeatMap(seatMapTarget.showTimeId);
                if (isCancelled) return;

                if (response.code !== "SUCCESS") {
                    toast.error(response.message || "Không thể tải sơ đồ ghế");
                    setSeatMapItems([]);
                    return;
                }

                setSeatMapItems(response.result ?? []);
            } catch (error) {
                if (isCancelled) return;
                toast.error(resolveApiErrorMessage(error, "Không thể tải sơ đồ ghế"));
                setSeatMapItems([]);
            } finally {
                if (!isCancelled) {
                    setIsSeatMapLoading(false);
                }
            }
        };

        void fetchSeatMap();

        return () => {
            isCancelled = true;
        };
    }, [isSeatMapOpen, seatMapTarget]);

    const renderSeatMapButtons = (rowSeats: ShowTimeSeat[]) => {
        const elements: ReactNode[] = [];

        for (let index = 0; index < rowSeats.length; index += 1) {
            const seat = rowSeats[index];
            const variant = resolveSeatVariant(seat.seatTypeId, seat.seatTypeName);

            let buttonLabel = `${seat.seatRow}${seat.seatColumn}`;
            let widthClass = "w-7";
            let seatsToRender: ShowTimeSeat[] = [seat];
            let skipNext = false;

            if (variant === "COUPLE") {
                const nextSeat = rowSeats[index + 1];
                const isPair =
                    nextSeat != null &&
                    resolveSeatVariant(nextSeat.seatTypeId, nextSeat.seatTypeName) === "COUPLE" &&
                    nextSeat.seatColumn === seat.seatColumn + 1;

                if (isPair) {
                    buttonLabel = `${seat.seatRow}${seat.seatColumn}-${nextSeat.seatRow}${nextSeat.seatColumn}`;
                    widthClass = "w-16";
                    seatsToRender = [seat, nextSeat];
                    skipNext = true;
                } else {
                    widthClass = "w-10";
                }
            }

            const mergedStatus = resolveMergedSeatStatus(seatsToRender);
            const visualClass =
                mergedStatus === "SOLD"
                    ? "bg-rose-100 border-rose-200 text-rose-500"
                    : mergedStatus === "HELD"
                      ? "bg-amber-100 border-amber-300 text-amber-700"
                      : mergedStatus === "BLOCKED"
                        ? "bg-slate-200 border-slate-300 text-slate-500"
                        : variant === "VIP"
                          ? "bg-[#FAEEDA] border-[#EF9F27] text-[#854F0B]"
                          : variant === "COUPLE"
                            ? "bg-[#FBEAF0] border-[#ED93B1] text-[#72243E]"
                            : "bg-white border-gray-300 text-gray-600";

            const statusLabel =
                mergedStatus === "SOLD"
                    ? "Đã bán"
                    : mergedStatus === "HELD"
                      ? "Đang giữ chỗ"
                      : mergedStatus === "BLOCKED"
                        ? "Đang khóa"
                        : "Trống";

            elements.push(
                <button
                    key={seat.showTimeSeatId}
                    type="button"
                    disabled
                    className={`h-7 rounded-t-md rounded-b-sm border-[1.5px] text-[10px] font-medium ${widthClass} ${visualClass}`}
                    title={`${buttonLabel} - ${statusLabel}`}
                >
                    {buttonLabel}
                </button>
            );

            if (skipNext) index += 1;
        }

        return elements;
    };

    const applyMovieSearchFilters = () => {
        setMovieSearchPage(1);
        void fetchMovieSearch(1);
    };

    const selectMovie = (movie: Movie) => {
        setSelectedMovie(movie);
        setFormValues((prev) => ({
            ...prev,
            movieId: movie.movieId,
            releaseDate: prev.releaseDate || movie.releaseDate || todayDateString(),
        }));
        setIsMovieSearchOpen(false);
    };

    const validateForm = () => {
        if (!formValues.movieId) {
            return "Vui lòng chọn phim";
        }

        if (!formValues.provinceId) {
            return "Vui lòng chọn tỉnh/thành";
        }

        if (!formValues.cinemaId) {
            return "Vui lòng chọn rạp";
        }

        if (!formValues.roomId) {
            return "Vui lòng chọn phòng";
        }

        if (!formValues.releaseDate) {
            return "Vui lòng chọn ngày chiếu";
        }

        if (!formValues.startTime || !formValues.endTime) {
            return "Vui lòng chọn giờ bắt đầu và kết thúc";
        }

        if (!formValues.status) {
            return "Vui lòng chọn trạng thái";
        }

        return null;
    };

    const submitForm = async () => {
        const validationError = validateForm();
        if (validationError) {
            toast.error(validationError);
            return;
        }

        const movieReleaseDate = selectedMovie?.releaseDate?.slice(0, 10);
        if (movieReleaseDate && formValues.releaseDate < movieReleaseDate) {
            toast.error("Ngày chiếu phải lớn hơn hoặc bằng ngày khởi chiếu của phim");
            return;
        }

        const startDateTime = new Date(
            `${formValues.releaseDate}T${toApiTime(formValues.startTime)}`
        );
        if (!Number.isNaN(startDateTime.getTime()) && startDateTime.getTime() < Date.now()) {
            toast.error("Suất chiếu phải lớn hơn hoặc bằng thời điểm hiện tại");
            return;
        }

        const payload: ShowTimeCreationRequest = {
            movieId: Number(formValues.movieId),
            roomId: Number(formValues.roomId),
            releaseDate: formValues.releaseDate,
            startTime: toApiTime(formValues.startTime),
            endTime: toApiTime(formValues.endTime),
            status: formValues.status,
        };

        try {
            setIsSaving(true);
            const response =
                formMode === "create"
                    ? await showTimeService.createShowTime(payload)
                    : await showTimeService.updateShowTime(
                          Number(editingShowTimeId),
                          payload as ShowTimeUpdateRequest
                      );

            if (response.code !== "SUCCESS") {
                toast.error(
                    response.message ||
                        (formMode === "create"
                            ? "Thêm suất chiếu thất bại"
                            : "Cập nhật suất chiếu thất bại")
                );
                return;
            }

            toast.success(
                formMode === "create"
                    ? "Thêm suất chiếu thành công"
                    : "Cập nhật suất chiếu thành công"
            );
            closeFormModal();
            void fetchShowtimes();
        } catch (error) {
            toast.error(
                resolveApiErrorMessage(
                    error,
                    formMode === "create"
                        ? "Thêm suất chiếu thất bại"
                        : "Cập nhật suất chiếu thất bại"
                )
            );
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;

        try {
            setIsDeleting(true);
            const response = await showTimeService.deleteShowTime(deleteTarget.showTimeId);
            if (response.code !== "SUCCESS") {
                toast.error(response.message || "Xóa suất chiếu thất bại");
                return;
            }

            toast.success("Xóa suất chiếu thành công");
            setDeleteTarget(null);
            void fetchShowtimes();
        } catch (error) {
            toast.error(resolveApiErrorMessage(error, "Xóa suất chiếu thất bại"));
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="space-y-6">
            <section className="rounded-2xl border border-[var(--glx-border)] bg-white p-5 shadow-[0_18px_42px_-35px_rgba(15,23,42,0.5)] sm:p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <p className="text-xs uppercase tracking-[0.16em] text-[var(--glx-blue)]">
                            Quản trị lịch chiếu
                        </p>
                        <h2 className="mt-1 text-2xl font-bold text-slate-800">
                            Quản lý suất chiếu
                        </h2>
                        <p className="mt-2 text-sm text-[var(--glx-text-muted)]">
                            Quản lý lịch chiếu theo phim, tỉnh/thành, rạp và phòng chiếu.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={openCreateModal}
                        className="inline-flex h-10 items-center justify-center rounded-lg bg-[var(--glx-orange)] px-4 text-sm font-semibold text-white transition-all duration-300 hover:bg-[var(--glx-orange-soft)]"
                    >
                        + Thêm suất chiếu
                    </button>
                </div>

                <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-4">
                    <input
                        value={movieNameInput}
                        onChange={(event) => setMovieNameInput(event.target.value)}
                        onKeyDown={(event) => {
                            if (event.key === "Enter") {
                                applyFilters();
                            }
                        }}
                        type="text"
                        placeholder="Tên phim"
                        className="h-11 rounded-xl border border-[var(--glx-border)] bg-white px-4 text-sm text-slate-700 outline-none transition-all focus:border-[var(--glx-blue)] focus:ring-2 focus:ring-[var(--glx-blue)]/15"
                    />

                    <input
                        value={movieIdInput}
                        onChange={(event) => {
                            const nextValue = event.target.value;
                            setMovieIdInput(nextValue ? Number(nextValue) : "");
                        }}
                        type="number"
                        min={1}
                        placeholder="Mã phim"
                        className="h-11 rounded-xl border border-[var(--glx-border)] bg-white px-4 text-sm text-slate-700 outline-none transition-all focus:border-[var(--glx-blue)] focus:ring-2 focus:ring-[var(--glx-blue)]/15"
                    />

                    <input
                        value={showTimeIdInput}
                        onChange={(event) => {
                            const nextValue = event.target.value;
                            setShowTimeIdInput(nextValue ? Number(nextValue) : "");
                        }}
                        type="number"
                        min={1}
                        placeholder="Mã suất chiếu"
                        className="h-11 rounded-xl border border-[var(--glx-border)] bg-white px-4 text-sm text-slate-700 outline-none transition-all focus:border-[var(--glx-blue)] focus:ring-2 focus:ring-[var(--glx-blue)]/15"
                    />

                    <select
                        value={movieTypeInput}
                        onChange={(event) =>
                            setMovieTypeInput(event.target.value ? Number(event.target.value) : "")
                        }
                        className="h-11 rounded-xl border border-[var(--glx-border)] bg-white px-4 text-sm text-slate-700 outline-none transition-all focus:border-[var(--glx-blue)] focus:ring-2 focus:ring-[var(--glx-blue)]/15"
                    >
                        <option value="">Tất cả thể loại phim</option>
                        {movieTypes.map((movieType) => (
                            <option key={movieType.movieTypeId} value={movieType.movieTypeId}>
                                {movieType.movieTypeName}
                            </option>
                        ))}
                    </select>

                    <input
                        type="date"
                        value={releaseDateInput}
                        onChange={(event) => setReleaseDateInput(event.target.value)}
                        className="h-11 rounded-xl border border-[var(--glx-border)] bg-white px-4 text-sm text-slate-700 outline-none transition-all focus:border-[var(--glx-blue)] focus:ring-2 focus:ring-[var(--glx-blue)]/15"
                    />

                    <input
                        type="time"
                        value={startTimeInput}
                        onChange={(event) => setStartTimeInput(event.target.value)}
                        placeholder="Giờ bắt đầu từ"
                        className="h-11 rounded-xl border border-[var(--glx-border)] bg-white px-4 text-sm text-slate-700 outline-none transition-all focus:border-[var(--glx-blue)] focus:ring-2 focus:ring-[var(--glx-blue)]/15"
                    />

                    <input
                        type="time"
                        value={endTimeInput}
                        onChange={(event) => setEndTimeInput(event.target.value)}
                        placeholder="Giờ bắt đầu đến"
                        className="h-11 rounded-xl border border-[var(--glx-border)] bg-white px-4 text-sm text-slate-700 outline-none transition-all focus:border-[var(--glx-blue)] focus:ring-2 focus:ring-[var(--glx-blue)]/15"
                    />

                    <select
                        value={provinceInput}
                        onChange={(event) => void handleFilterProvinceChange(event.target.value)}
                        className="h-11 rounded-xl border border-[var(--glx-border)] bg-white px-4 text-sm text-slate-700 outline-none transition-all focus:border-[var(--glx-blue)] focus:ring-2 focus:ring-[var(--glx-blue)]/15"
                    >
                        <option value="">Tất cả tỉnh/thành</option>
                        {provinces.map((province) => (
                            <option key={province.provinceId} value={province.provinceId}>
                                {province.provinceName}
                            </option>
                        ))}
                    </select>

                    <select
                        value={cinemaInput}
                        onChange={(event) =>
                            setCinemaInput(event.target.value ? Number(event.target.value) : "")
                        }
                        className="h-11 rounded-xl border border-[var(--glx-border)] bg-white px-4 text-sm text-slate-700 outline-none transition-all focus:border-[var(--glx-blue)] focus:ring-2 focus:ring-[var(--glx-blue)]/15"
                    >
                        <option value="">Tất cả rạp</option>
                        {filterCinemas.map((cinema) => (
                            <option key={cinema.cinemaId} value={cinema.cinemaId}>
                                {cinema.cinemaName}
                            </option>
                        ))}
                    </select>

                    <select
                        value={statusInput}
                        onChange={(event) =>
                            setStatusInput(event.target.value as ShowTimeStatus | "")
                        }
                        className="h-11 rounded-xl border border-[var(--glx-border)] bg-white px-4 text-sm text-slate-700 outline-none transition-all focus:border-[var(--glx-blue)] focus:ring-2 focus:ring-[var(--glx-blue)]/15"
                    >
                        <option value="">Tất cả trạng thái</option>
                        {showtimeStatuses.map((status) => (
                            <option key={status} value={status}>
                                {status}
                            </option>
                        ))}
                    </select>

                    <div className="grid grid-cols-2 gap-2">
                        <button
                            type="button"
                            onClick={applyFilters}
                            className="h-11 rounded-xl border border-[var(--glx-blue)] bg-[var(--glx-blue)] px-4 text-sm font-semibold text-white transition-all duration-300 hover:bg-[var(--glx-blue-strong)]"
                        >
                            Áp dụng
                        </button>
                        <button
                            type="button"
                            onClick={() => void resetFilters()}
                            className="h-11 rounded-xl border border-[var(--glx-border)] bg-white px-4 text-sm font-semibold text-slate-600 transition-all duration-300 hover:border-[var(--glx-orange)] hover:text-[var(--glx-orange)]"
                        >
                            Đặt lại
                        </button>
                    </div>
                </div>
            </section>

            <section className="rounded-2xl border border-[var(--glx-border)] bg-white shadow-[0_18px_42px_-35px_rgba(15,23,42,0.5)]">
                <div className="flex flex-col gap-3 border-b border-[var(--glx-border)] px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                    <h3 className="text-lg font-bold text-slate-800">Danh sách suất chiếu</h3>
                    <div className="flex items-center gap-3 text-sm text-slate-500">
                        <span>Tổng: {totalItems}</span>
                        <label className="flex items-center gap-2">
                            <span>Kích thước</span>
                            <select
                                value={filters.size}
                                onChange={(event) =>
                                    setFilters((prev) => ({
                                        ...prev,
                                        size: Number(event.target.value),
                                        page: 1,
                                    }))
                                }
                                className="rounded-md border border-[var(--glx-border)] px-2 py-1 text-sm text-slate-700 outline-none focus:border-[var(--glx-blue)]"
                            >
                                {[5, 10, 20, 50].map((size) => (
                                    <option key={size} value={size}>
                                        {size}
                                    </option>
                                ))}
                            </select>
                        </label>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-[var(--glx-border)] text-sm">
                        <thead className="bg-slate-50 text-left">
                            <tr>
                                <th className="px-6 py-3 font-bold text-slate-600">Mã suất</th>
                                <th className="px-6 py-3 font-bold text-slate-600">Ảnh</th>
                                <th className="px-6 py-3 font-bold text-slate-600">Phim</th>
                                <th className="px-6 py-3 font-bold text-slate-600">Địa điểm</th>
                                <th className="px-6 py-3 font-bold text-slate-600">Ngày chiếu</th>
                                <th className="px-6 py-3 font-bold text-slate-600">Khung giờ</th>
                                <th className="px-6 py-3 font-bold text-slate-600">Trạng thái</th>
                                <th className="px-6 py-3 text-right font-bold text-slate-600">
                                    Thao tác
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--glx-border)]">
                            {isLoading ? (
                                <tr>
                                    <td
                                        colSpan={8}
                                        className="px-6 py-10 text-center text-sm text-slate-500"
                                    >
                                        Đang tải suất chiếu...
                                    </td>
                                </tr>
                            ) : showtimeRows.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={8}
                                        className="px-6 py-10 text-center text-sm text-slate-500"
                                    >
                                        Không tìm thấy suất chiếu
                                    </td>
                                </tr>
                            ) : (
                                showtimeRows.map((row) => {
                                    const statusClass =
                                        statusClassByShowTimeStatus[row.status] ??
                                        "bg-slate-200 text-slate-700";

                                    return (
                                        <tr
                                            key={row.showTimeId}
                                            className="bg-white hover:bg-slate-50/80"
                                        >
                                            <td className="px-6 py-4 text-slate-600">
                                                #{row.showTimeId}
                                            </td>
                                            <td className="px-6 py-4">
                                                <img
                                                    src={resolveMoviePortraitImage(
                                                        row.movie?.imagePortrait
                                                    )}
                                                    alt={row.movie?.movieName ?? "Movie"}
                                                    className="h-16 w-12 rounded border border-slate-200 object-cover"
                                                />
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-semibold text-slate-700">
                                                    {row.movie?.movieName ?? "-"}
                                                </div>
                                                <div className="text-xs text-slate-500">
                                                    Mã phim: {row.movieId}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-slate-600">
                                                <div>{resolveProvinceNameFromShowTime(row)}</div>
                                                <div>{resolveCinemaNameFromShowTime(row)}</div>
                                                <div className="text-xs text-slate-500">
                                                    {resolveRoomNameFromShowTime(row)}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-slate-600">
                                                {toDisplayDate(row.releaseDate)}
                                            </td>
                                            <td className="px-6 py-4 text-slate-600">
                                                {formatShowTimePeriod(row)}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span
                                                    className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${statusClass}`}
                                                >
                                                    {row.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="inline-flex items-center gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => openSeatMapModal(row)}
                                                        className="rounded-md border border-[var(--glx-blue)] px-3 py-1.5 text-xs font-semibold text-[var(--glx-blue)] transition-all duration-300 hover:bg-[var(--glx-blue)] hover:text-white"
                                                    >
                                                        Sơ đồ ghế
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => openEditModal(row)}
                                                        className="rounded-md border border-[var(--glx-border)] px-3 py-1.5 text-xs font-semibold text-slate-600 transition-all duration-300 hover:border-[var(--glx-blue)] hover:text-[var(--glx-blue)]"
                                                    >
                                                        Sửa
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setDeleteTarget(row)}
                                                        className="rounded-md border border-rose-200 px-3 py-1.5 text-xs font-semibold text-rose-600 transition-all duration-300 hover:bg-rose-50"
                                                    >
                                                        Xóa
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="flex items-center justify-center gap-2 border-t border-[var(--glx-border)] px-5 py-4">
                    <button
                        type="button"
                        onClick={() =>
                            setFilters((prev) => ({ ...prev, page: Math.max(1, prev.page - 1) }))
                        }
                        disabled={filters.page === 1 || isLoading}
                        className="rounded-md border border-[var(--glx-border)] px-3 py-1.5 text-sm text-slate-600 transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-40 hover:border-[var(--glx-orange)] hover:text-[var(--glx-orange)]"
                    >
                        Trước
                    </button>

                    {visiblePages.map((page) => (
                        <button
                            key={page}
                            type="button"
                            onClick={() => setFilters((prev) => ({ ...prev, page }))}
                            className={`rounded-md border px-3 py-1.5 text-sm font-semibold transition-all duration-300 ${
                                filters.page === page
                                    ? "border-[var(--glx-blue)] bg-[var(--glx-blue)] text-white"
                                    : "border-[var(--glx-border)] text-slate-600 hover:border-[var(--glx-orange)] hover:text-[var(--glx-orange)]"
                            }`}
                        >
                            {page}
                        </button>
                    ))}

                    <button
                        type="button"
                        onClick={() =>
                            setFilters((prev) => ({
                                ...prev,
                                page: Math.min(totalPages, prev.page + 1),
                            }))
                        }
                        disabled={filters.page >= totalPages || isLoading}
                        className="rounded-md border border-[var(--glx-border)] px-3 py-1.5 text-sm text-slate-600 transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-40 hover:border-[var(--glx-orange)] hover:text-[var(--glx-orange)]"
                    >
                        Tiếp
                    </button>
                </div>
            </section>

            <ModalShell
                open={isSeatMapOpen}
                onClose={closeSeatMapModal}
                title="Sơ đồ ghế suất chiếu"
                panelClassName="max-w-[1120px]"
            >
                <div className="space-y-4">
                    <div className="rounded-md border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                        <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                            <p>
                                <span className="font-semibold text-slate-800">Mã suất:</span>{" "}
                                {seatMapTarget ? `#${seatMapTarget.showTimeId}` : "-"}
                            </p>
                            <p>
                                <span className="font-semibold text-slate-800">Phim:</span>{" "}
                                {seatMapTarget?.movie?.movieName ?? "-"}
                            </p>
                            <p>
                                <span className="font-semibold text-slate-800">Lịch chiếu:</span>{" "}
                                {seatMapTarget
                                    ? `${toDisplayDate(seatMapTarget.releaseDate)} | ${formatShowTimePeriod(seatMapTarget)}`
                                    : "-"}
                            </p>
                            <p>
                                <span className="font-semibold text-slate-800">
                                    {"M\u00e3 ph\u00f2ng:"}
                                </span>{" "}
                                {seatMapTarget?.roomId ? `#${seatMapTarget.roomId}` : "-"}
                            </p>
                            <p>
                                <span className="font-semibold text-slate-800">
                                    {"T\u00ean ph\u00f2ng:"}
                                </span>{" "}
                                {seatMapTarget ? resolveRoomNameFromShowTime(seatMapTarget) : "-"}
                            </p>
                            <p>
                                <span className="font-semibold text-slate-800">
                                    {"T\u00ean r\u1ea1p:"}
                                </span>{" "}
                                {seatMapTarget ? resolveCinemaNameFromShowTime(seatMapTarget) : "-"}
                            </p>
                        </div>
                    </div>

                    <div className="rounded-xl border border-[var(--glx-border)] bg-[#f6f6f7] p-4 md:p-6">
                        <div className="mb-6 flex flex-col items-center">
                            <div className="h-1 w-3/5 rounded-full bg-[#034ea2] opacity-50" />
                            <p className="mt-2 text-xs tracking-[0.2em] text-slate-400">Màn hình</p>
                        </div>

                        {isSeatMapLoading ? (
                            <p className="py-8 text-center text-sm text-slate-500">
                                Đang tải sơ đồ ghế...
                            </p>
                        ) : seatMapRows.length === 0 ? (
                            <p className="py-8 text-center text-sm text-slate-500">
                                Chưa có dữ liệu ghế cho suất chiếu này
                            </p>
                        ) : (
                            <div className="flex flex-col items-center gap-1.5 overflow-auto">
                                {seatMapRows.map((rowGroup) => (
                                    <div key={rowGroup.row} className="flex items-center gap-2">
                                        <span className="w-4 text-center text-[11px] text-slate-400">
                                            {rowGroup.row}
                                        </span>

                                        <div className="flex items-center gap-1">
                                            {renderSeatMapButtons(rowGroup.seats)}
                                        </div>

                                        <span className="w-4 text-center text-[11px] text-slate-400">
                                            {rowGroup.row}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="mt-7 space-y-3 border-t border-slate-200 pt-4">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <div className="flex flex-wrap items-center gap-4">
                                    <div className="flex items-center gap-1.5">
                                        <span className="inline-block h-5 w-5 rounded border border-gray-300 bg-white" />
                                        <span className="text-xs text-slate-500">
                                            Trống ({seatMapSummary.available})
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <span className="inline-block h-5 w-5 rounded border border-amber-300 bg-amber-100" />
                                        <span className="text-xs text-slate-500">
                                            Đang giữ chỗ ({seatMapSummary.held})
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <span className="inline-block h-5 w-5 rounded border border-rose-200 bg-rose-100" />
                                        <span className="text-xs text-slate-500">
                                            Đã đặt ({seatMapSummary.sold})
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <span className="inline-block h-5 w-5 rounded border border-slate-300 bg-slate-200" />
                                        <span className="text-xs text-slate-500">
                                            Khóa ({seatMapSummary.blocked})
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-4">
                                <div className="flex items-center gap-1.5">
                                    <span className="inline-block h-5 w-5 rounded border border-gray-300 bg-white" />
                                    <span className="text-xs text-slate-500">Ghế đơn</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <span className="inline-block h-5 w-5 rounded border border-[#EF9F27] bg-[#FAEEDA]" />
                                    <span className="text-xs text-slate-500">VIP</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <span className="inline-block h-5 w-10 rounded border border-[#ED93B1] bg-[#FBEAF0]" />
                                    <span className="text-xs text-slate-500">Ghế đôi</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </ModalShell>

            <ModalShell
                open={isFormOpen}
                onClose={closeFormModal}
                title={formMode === "create" ? "Thêm suất chiếu" : "Cập nhật suất chiếu"}
            >
                <div className="space-y-4">
                    <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-3">
                        <p className="text-xs font-bold uppercase text-slate-500">Phim</p>
                        {selectedMovie ? (
                            <div className="mt-2">
                                <p className="text-sm font-semibold text-slate-700">
                                    {selectedMovie.movieName}
                                </p>
                                <p className="text-xs text-slate-500">
                                    Mã phim: {selectedMovie.movieId}
                                </p>
                                <p className="text-xs text-slate-500">
                                    Ngày khởi chiếu: {toDisplayDate(selectedMovie.releaseDate)}
                                </p>
                            </div>
                        ) : (
                            <p className="mt-2 text-sm text-slate-500">Chưa chọn phim</p>
                        )}
                        <button
                            type="button"
                            onClick={openMovieSearchModal}
                            className="mt-3 rounded-md border border-[var(--glx-blue)] px-3 py-1.5 text-xs font-semibold text-[var(--glx-blue)] transition hover:bg-[var(--glx-blue)] hover:text-white"
                        >
                            Tìm phim
                        </button>
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                        <div>
                            <label className="mb-1 block text-xs font-bold text-slate-500">
                                Tỉnh/Thành *
                            </label>
                            <select
                                value={formValues.provinceId ?? ""}
                                onChange={(event) =>
                                    void handleFormProvinceChange(event.target.value)
                                }
                                className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm outline-none transition-all focus:border-[var(--glx-blue)] focus:ring-2 focus:ring-[var(--glx-blue)]/20"
                            >
                                <option value="">Chọn tỉnh/thành</option>
                                {provinces.map((province) => (
                                    <option key={province.provinceId} value={province.provinceId}>
                                        {province.provinceName}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="mb-1 block text-xs font-bold text-slate-500">
                                Rạp *
                            </label>
                            <select
                                value={formValues.cinemaId ?? ""}
                                onChange={(event) =>
                                    void handleFormCinemaChange(event.target.value)
                                }
                                className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm outline-none transition-all focus:border-[var(--glx-blue)] focus:ring-2 focus:ring-[var(--glx-blue)]/20"
                            >
                                <option value="">Chọn rạp</option>
                                {formCinemas.map((cinema) => (
                                    <option key={cinema.cinemaId} value={cinema.cinemaId}>
                                        {cinema.cinemaName}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="mb-1 block text-xs font-bold text-slate-500">
                                Phòng *
                            </label>
                            <select
                                value={formValues.roomId ?? ""}
                                onChange={(event) =>
                                    setFormValues((prev) => ({
                                        ...prev,
                                        roomId: event.target.value
                                            ? Number(event.target.value)
                                            : null,
                                    }))
                                }
                                className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm outline-none transition-all focus:border-[var(--glx-blue)] focus:ring-2 focus:ring-[var(--glx-blue)]/20"
                            >
                                <option value="">Chọn phòng</option>
                                {formRooms.map((room) => (
                                    <option key={room.roomId} value={room.roomId}>
                                        {room.roomName}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div>
                            <label className="mb-1 block text-xs font-bold text-slate-500">
                                Ngày chiếu *
                            </label>
                            <input
                                type="date"
                                value={formValues.releaseDate}
                                onChange={(event) =>
                                    setFormValues((prev) => ({
                                        ...prev,
                                        releaseDate: event.target.value,
                                    }))
                                }
                                className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm outline-none transition-all focus:border-[var(--glx-blue)] focus:ring-2 focus:ring-[var(--glx-blue)]/20"
                            />
                        </div>

                        <div>
                            <label className="mb-1 block text-xs font-bold text-slate-500">
                                Trạng thái *
                            </label>
                            <select
                                value={formValues.status}
                                onChange={(event) =>
                                    setFormValues((prev) => ({
                                        ...prev,
                                        status: event.target.value as ShowTimeStatus,
                                    }))
                                }
                                className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm outline-none transition-all focus:border-[var(--glx-blue)] focus:ring-2 focus:ring-[var(--glx-blue)]/20"
                            >
                                {showtimeStatuses.map((status) => (
                                    <option key={status} value={status}>
                                        {status}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div>
                            <label className="mb-1 block text-xs font-bold text-slate-500">
                                Giờ bắt đầu *
                            </label>
                            <input
                                type="time"
                                value={formValues.startTime}
                                onChange={(event) =>
                                    setFormValues((prev) => ({
                                        ...prev,
                                        startTime: event.target.value,
                                    }))
                                }
                                className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm outline-none transition-all focus:border-[var(--glx-blue)] focus:ring-2 focus:ring-[var(--glx-blue)]/20"
                            />
                        </div>

                        <div>
                            <label className="mb-1 block text-xs font-bold text-slate-500">
                                Giờ kết thúc *
                            </label>
                            <input
                                type="time"
                                value={formValues.endTime}
                                onChange={(event) =>
                                    setFormValues((prev) => ({
                                        ...prev,
                                        endTime: event.target.value,
                                    }))
                                }
                                className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm outline-none transition-all focus:border-[var(--glx-blue)] focus:ring-2 focus:ring-[var(--glx-blue)]/20"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                        <button
                            type="button"
                            onClick={closeFormModal}
                            className="rounded-md border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-[var(--glx-orange)] hover:text-[var(--glx-orange)]"
                        >
                            Hủy
                        </button>
                        <button
                            type="button"
                            onClick={() => void submitForm()}
                            disabled={isSaving}
                            className="rounded-md bg-[var(--glx-orange)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--glx-orange-soft)] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {formMode === "create" ? "Tạo mới" : "Lưu"}
                        </button>
                    </div>
                </div>
            </ModalShell>

            <ModalShell
                open={isMovieSearchOpen}
                onClose={closeMovieSearchModal}
                title="Tìm phim để gán suất chiếu"
                panelClassName="max-w-[1000px]"
            >
                <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-[1.6fr_1fr_1fr_auto]">
                        <input
                            value={movieSearchName}
                            onChange={(event) => setMovieSearchName(event.target.value)}
                            onKeyDown={(event) => {
                                if (event.key === "Enter") {
                                    applyMovieSearchFilters();
                                }
                            }}
                            type="text"
                            placeholder="Tìm tên phim..."
                            className="h-10 rounded-md border border-slate-200 px-3 text-sm outline-none transition-all focus:border-[var(--glx-blue)] focus:ring-2 focus:ring-[var(--glx-blue)]/20"
                        />

                        <select
                            value={movieSearchTypeId}
                            onChange={(event) =>
                                setMovieSearchTypeId(
                                    event.target.value ? Number(event.target.value) : ""
                                )
                            }
                            className="h-10 rounded-md border border-slate-200 px-3 text-sm outline-none transition-all focus:border-[var(--glx-blue)] focus:ring-2 focus:ring-[var(--glx-blue)]/20"
                        >
                            <option value="">Tất cả thể loại phim</option>
                            {movieTypes.map((movieType) => (
                                <option key={movieType.movieTypeId} value={movieType.movieTypeId}>
                                    {movieType.movieTypeName}
                                </option>
                            ))}
                        </select>

                        <select
                            value={movieSearchStatus}
                            onChange={(event) =>
                                setMovieSearchStatus(event.target.value as MovieStatus | "")
                            }
                            className="h-10 rounded-md border border-slate-200 px-3 text-sm outline-none transition-all focus:border-[var(--glx-blue)] focus:ring-2 focus:ring-[var(--glx-blue)]/20"
                        >
                            <option value="">Tất cả trạng thái</option>
                            {movieStatusOptions.map((status) => (
                                <option key={status} value={status}>
                                    {status}
                                </option>
                            ))}
                        </select>

                        <button
                            type="button"
                            onClick={applyMovieSearchFilters}
                            className="h-10 rounded-md bg-[var(--glx-blue)] px-4 text-sm font-semibold text-white transition hover:bg-[var(--glx-blue-strong)]"
                        >
                            Tìm
                        </button>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-500">
                        <span>Tổng phim: {movieSearchTotalItems}</span>
                        <label className="flex items-center gap-2">
                            <span>Kích thước</span>
                            <select
                                value={movieSearchSize}
                                onChange={(event) => {
                                    const nextSize = Number(event.target.value);
                                    setMovieSearchSize(nextSize);
                                    setMovieSearchPage(1);
                                }}
                                className="rounded-md border border-slate-200 px-2 py-1 text-xs outline-none focus:border-[var(--glx-blue)]"
                            >
                                {[5, 10, 20].map((size) => (
                                    <option key={size} value={size}>
                                        {size}
                                    </option>
                                ))}
                            </select>
                        </label>
                    </div>

                    <div className="overflow-x-auto rounded-md border border-slate-200">
                        <table className="min-w-full divide-y divide-slate-200 text-sm">
                            <thead className="bg-slate-50 text-left">
                                <tr>
                                    <th className="px-4 py-2 font-semibold text-slate-600">Mã</th>
                                    <th className="px-4 py-2 font-semibold text-slate-600">
                                        Tên phim
                                    </th>
                                    <th className="px-4 py-2 font-semibold text-slate-600">
                                        Thể loại
                                    </th>
                                    <th className="px-4 py-2 font-semibold text-slate-600">
                                        Khởi chiếu
                                    </th>
                                    <th className="px-4 py-2 text-right font-semibold text-slate-600">
                                        Chọn
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {movieSearchLoading ? (
                                    <tr>
                                        <td
                                            colSpan={5}
                                            className="px-4 py-6 text-center text-slate-500"
                                        >
                                            Đang tải danh sách phim...
                                        </td>
                                    </tr>
                                ) : movieSearchResults.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={5}
                                            className="px-4 py-6 text-center text-slate-500"
                                        >
                                            Không tìm thấy phim
                                        </td>
                                    </tr>
                                ) : (
                                    movieSearchResults.map((movie) => (
                                        <tr key={movie.movieId} className="hover:bg-slate-50">
                                            <td className="px-4 py-3 text-slate-600">
                                                #{movie.movieId}
                                            </td>
                                            <td className="px-4 py-3 text-slate-700">
                                                {movie.movieName}
                                            </td>
                                            <td className="px-4 py-3 text-slate-600">
                                                {movie.movieType?.movieTypeName ?? "-"}
                                            </td>
                                            <td className="px-4 py-3 text-slate-600">
                                                {toDisplayDate(movie.releaseDate)}
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <button
                                                    type="button"
                                                    onClick={() => selectMovie(movie)}
                                                    className="rounded-md border border-[var(--glx-blue)] px-3 py-1 text-xs font-semibold text-[var(--glx-blue)] transition hover:bg-[var(--glx-blue)] hover:text-white"
                                                >
                                                    Chọn
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex items-center justify-center gap-2">
                        <button
                            type="button"
                            onClick={() =>
                                setMovieSearchPage((prev) => {
                                    const next = Math.max(1, prev - 1);
                                    return next;
                                })
                            }
                            disabled={movieSearchPage === 1 || movieSearchLoading}
                            className="rounded-md border border-slate-200 px-3 py-1.5 text-sm text-slate-600 transition disabled:cursor-not-allowed disabled:opacity-40 hover:border-[var(--glx-orange)] hover:text-[var(--glx-orange)]"
                        >
                            Trước
                        </button>

                        {movieSearchVisiblePages.map((page) => (
                            <button
                                key={page}
                                type="button"
                                onClick={() => setMovieSearchPage(page)}
                                className={`rounded-md border px-3 py-1.5 text-sm font-semibold transition ${
                                    movieSearchPage === page
                                        ? "border-[var(--glx-blue)] bg-[var(--glx-blue)] text-white"
                                        : "border-slate-200 text-slate-600 hover:border-[var(--glx-orange)] hover:text-[var(--glx-orange)]"
                                }`}
                            >
                                {page}
                            </button>
                        ))}

                        <button
                            type="button"
                            onClick={() =>
                                setMovieSearchPage((prev) =>
                                    Math.min(movieSearchTotalPages, prev + 1)
                                )
                            }
                            disabled={
                                movieSearchPage >= movieSearchTotalPages || movieSearchLoading
                            }
                            className="rounded-md border border-slate-200 px-3 py-1.5 text-sm text-slate-600 transition disabled:cursor-not-allowed disabled:opacity-40 hover:border-[var(--glx-orange)] hover:text-[var(--glx-orange)]"
                        >
                            Tiếp
                        </button>
                    </div>
                </div>
            </ModalShell>

            <ModalShell
                open={Boolean(deleteTarget)}
                onClose={() => setDeleteTarget(null)}
                title="Xóa suất chiếu"
                panelClassName="max-w-[560px]"
            >
                <div className="space-y-4">
                    <p className="text-sm text-slate-600">
                        Bạn có chắc muốn xóa suất chiếu <strong>#{deleteTarget?.showTimeId}</strong>{" "}
                        của phim <strong>{deleteTarget?.movie?.movieName ?? ""}</strong>?
                    </p>
                    <p className="text-xs text-rose-500">
                        Không thể xóa nếu còn ticket ACTIVE đang sử dụng suất chiếu này.
                    </p>
                    <div className="flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={() => setDeleteTarget(null)}
                            className="rounded-md border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-[var(--glx-orange)] hover:text-[var(--glx-orange)]"
                        >
                            Hủy
                        </button>
                        <button
                            type="button"
                            onClick={() => void handleDelete()}
                            disabled={isDeleting}
                            className="rounded-md border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-600 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Xóa
                        </button>
                    </div>
                </div>
            </ModalShell>
        </div>
    );
};

export default ShowtimeManagement;
