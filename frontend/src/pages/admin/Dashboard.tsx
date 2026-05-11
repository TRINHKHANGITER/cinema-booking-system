import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { cinemaService } from "../../services/cinema.service";
import { comboService } from "../../services/combo.service";
import { dashboardService } from "../../services/dashboard.service";
import { movieService } from "../../services/movie.service";
import { movieTypeService } from "../../services/movieType.service";
import { provinceService } from "../../services/province.service";
import type { CinemaResponse } from "../../types/cinema";
import type { ComboResponse } from "../../types/combo";
import type {
    CinemaRevenueItem,
    ComboRevenueItem,
    DashboardOrderStatistics,
    DashboardOverview,
    MovieRevenueItem,
    MovieTypeRevenueItem,
    OrderStatisticItem,
    RevenueRankingResponse,
} from "../../types/dashboard";
import type { Movie } from "../../types/movie";
import type { MovieTypeResponse } from "../../types/movie-type";
import type { OrderStatus } from "../../types/order";
import type { ProvinceResponse } from "../../types/province";

type DashboardTabKey = "overview" | "cinema" | "movie" | "movieType" | "combo" | "order";

type DateRange = {
    startDate: string;
    endDate: string;
};

type CinemaTabFilters = DateRange & {
    provinceId: number | "";
    cinemaId: number | "";
    topN: string;
    sort: "ASC" | "DESC";
    page: number;
    size: number;
};

type MovieTabFilters = DateRange & {
    movieId: number | "";
    topN: string;
    sort: "ASC" | "DESC";
    page: number;
    size: number;
};

type MovieTypeTabFilters = DateRange & {
    categoryId: number | "";
    topN: string;
    sort: "ASC" | "DESC";
    page: number;
    size: number;
};

type ComboTabFilters = DateRange & {
    comboId: number | "";
    topN: string;
    sort: "ASC" | "DESC";
    page: number;
    size: number;
};

type OrderTabFilters = {
    fromDate: string;
    toDate: string;
    status: OrderStatus | "";
    page: number;
    size: number;
};

type ChartDatum = {
    key: string;
    label: string;
    value: number;
};

const TAB_ITEMS: Array<{ key: DashboardTabKey; label: string }> = [
    { key: "overview", label: "Tổng quan" },
    { key: "cinema", label: "Doanh thu theo rạp" },
    { key: "movie", label: "Doanh thu theo phim" },
    { key: "movieType", label: "Doanh thu theo loại phim" },
    { key: "combo", label: "Doanh thu theo combo" },
    { key: "order", label: "Thống kê đơn hàng" },
];

const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];
const ORDER_STATUS_OPTIONS: OrderStatus[] = ["PAYING", "PAID", "CANCELLED", "REFUNDED", "EXPIRED"];

const resolveApiErrorMessage = (error: unknown, fallback: string) => {
    if (axios.isAxiosError(error)) {
        const payload = error.response?.data as { message?: string } | undefined;
        return payload?.message || fallback;
    }
    return fallback;
};

const toDateInputValue = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
};

const createDefaultDateRange = (): DateRange => {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    return {
        startDate: toDateInputValue(monthStart),
        endDate: toDateInputValue(now),
    };
};

const formatCurrency = (value: number | null | undefined) =>
    `${Number(value ?? 0).toLocaleString("vi-VN")} đ`;

const formatNumber = (value: number | null | undefined) =>
    Number(value ?? 0).toLocaleString("vi-VN");

const formatDateCell = (value: string | null | undefined) => {
    if (!value) return "-";
    return value;
};

const formatDateTimeCell = (value: string | null | undefined) => {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleString("vi-VN");
};

const formatShowtimeCell = (showDate?: string | null, showTime?: string | null) => {
    if (!showDate || !showTime) return "-";
    const trimmedTime = showTime.length >= 5 ? showTime.slice(0, 5) : showTime;
    return `${showDate} ${trimmedTime}`;
};

const validateDateRange = (range: DateRange) =>
    Boolean(range.startDate && range.endDate && range.startDate <= range.endDate);

const validateOrderDateRange = (range: Pick<OrderTabFilters, "fromDate" | "toDate">) =>
    Boolean(range.fromDate && range.toDate && range.fromDate <= range.toDate);

const parseOptionalPositiveInteger = (raw: string) => {
    const normalized = raw.trim();
    if (!normalized) {
        return { isValid: true, value: undefined as number | undefined };
    }

    const parsed = Number(normalized);
    if (!Number.isInteger(parsed) || parsed < 1) {
        return { isValid: false, value: undefined as number | undefined };
    }

    return { isValid: true, value: parsed };
};

const buildVisiblePages = (currentPage: number, totalPages: number) => {
    const maxButtons = 5;
    if (totalPages <= maxButtons) {
        return Array.from({ length: totalPages }, (_, index) => index + 1);
    }

    let start = Math.max(1, currentPage - 2);
    const end = Math.min(totalPages, start + maxButtons - 1);
    if (end - start + 1 < maxButtons) {
        start = Math.max(1, end - maxButtons + 1);
    }

    const pages: number[] = [];
    for (let page = start; page <= end; page += 1) {
        pages.push(page);
    }
    return pages;
};

const buildEmptyRanking = <T,>(page = 1, size = 10): RevenueRankingResponse<T> => ({
    startDate: "",
    endDate: "",
    totalRevenue: 0,
    topN: null,
    sortDirection: "DESC",
    chartItems: [],
    items: [],
    totalItems: 0,
    currentPage: page,
    pageSize: size,
    totalPages: 1,
});

const buildEmptyOrderStatistics = (
    filters: Pick<OrderTabFilters, "fromDate" | "toDate" | "status" | "page" | "size">
): DashboardOrderStatistics => ({
    fromDate: filters.fromDate,
    toDate: filters.toDate,
    status: filters.status === "" ? null : filters.status,
    totalAmount: 0,
    items: [],
    totalItems: 0,
    currentPage: filters.page,
    pageSize: filters.size,
    totalPages: 1,
});

const resolveStatusBadge = (status: string) => {
    if (status === "ACTIVE" || status === "AVAILABLE" || status === "PAID") {
        return "bg-emerald-100 text-emerald-700";
    }
    if (status.includes("COMING") || status.includes("MAINTENANCE")) {
        return "bg-amber-100 text-amber-700";
    }
    if (status.includes("INACTIVE") || status.includes("UNAVAILABLE")) {
        return "bg-slate-200 text-slate-700";
    }
    return "bg-sky-100 text-sky-700";
};

const formatOrderStatusLabel = (status: OrderStatus) => {
    switch (status) {
        case "PAYING":
            return "Đang thanh toán";
        case "PAID":
            return "Đã thanh toán";
        case "CANCELLED":
            return "Đã hủy";
        case "REFUNDED":
            return "Đã hoàn tiền";
        case "EXPIRED":
            return "Hết hạn";
        default:
            return status;
    }
};

const RevenueBarChart = ({
    title,
    bars,
    colorClass,
}: {
    title: string;
    bars: ChartDatum[];
    colorClass: string;
}) => {
    const maxValue = bars.reduce((max, item) => Math.max(max, item.value), 0);

    return (
        <section className="rounded-2xl border border-[var(--glx-border)] bg-white p-4 shadow-[0_16px_36px_-34px_rgba(15,23,42,0.6)]">
            <h4 className="mb-4 text-sm font-bold text-slate-700">{title}</h4>
            {bars.length === 0 ? (
                <div className="rounded-lg border border-dashed border-[var(--glx-border)] bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
                    Không có dữ liệu để vẽ biểu đồ
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <div className="flex min-w-max items-end gap-3 pb-1">
                        {bars.map((item) => {
                            const height =
                                maxValue <= 0 ? 0 : Math.max(12, Math.round((item.value / maxValue) * 180));
                            return (
                                <div key={item.key} className="w-20 shrink-0 text-center">
                                    <p className="mb-1 truncate text-[10px] font-semibold text-slate-500">
                                        {formatCurrency(item.value)}
                                    </p>
                                    <div className="flex h-[190px] items-end justify-center">
                                        <div
                                            className={`w-10 rounded-t-md ${colorClass}`}
                                            style={{ height: `${height}px` }}
                                            title={`${item.label}: ${formatCurrency(item.value)}`}
                                        />
                                    </div>
                                    <p className="mt-2 line-clamp-2 text-xs font-semibold text-slate-600">
                                        {item.label}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </section>
    );
};

const Pagination = ({
    currentPage,
    totalPages,
    disabled,
    onPageChange,
}: {
    currentPage: number;
    totalPages: number;
    disabled?: boolean;
    onPageChange: (page: number) => void;
}) => {
    const pages = buildVisiblePages(currentPage, totalPages);

    return (
        <div className="flex items-center justify-center gap-2 border-t border-[var(--glx-border)] px-5 py-4">
            <button
                type="button"
                onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                disabled={disabled || currentPage <= 1}
                className="rounded-md border border-[var(--glx-border)] px-3 py-1.5 text-sm text-slate-600 transition-all duration-300 hover:border-[var(--glx-orange)] hover:text-[var(--glx-orange)] disabled:cursor-not-allowed disabled:opacity-40"
            >
                Trước
            </button>

            {pages.map((page) => (
                <button
                    key={page}
                    type="button"
                    onClick={() => onPageChange(page)}
                    className={`rounded-md border px-3 py-1.5 text-sm font-semibold transition-all duration-300 ${
                        page === currentPage
                            ? "border-[var(--glx-blue)] bg-[var(--glx-blue)] text-white"
                            : "border-[var(--glx-border)] text-slate-600 hover:border-[var(--glx-orange)] hover:text-[var(--glx-orange)]"
                    }`}
                >
                    {page}
                </button>
            ))}

            <button
                type="button"
                onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                disabled={disabled || currentPage >= totalPages}
                className="rounded-md border border-[var(--glx-border)] px-3 py-1.5 text-sm text-slate-600 transition-all duration-300 hover:border-[var(--glx-orange)] hover:text-[var(--glx-orange)] disabled:cursor-not-allowed disabled:opacity-40"
            >
                Tiếp
            </button>
        </div>
    );
};

const Dashboard = () => {
    const defaultDateRange = useMemo(() => createDefaultDateRange(), []);

    const [activeTab, setActiveTab] = useState<DashboardTabKey>("overview");

    const [provinces, setProvinces] = useState<ProvinceResponse[]>([]);
    const [cinemaOptions, setCinemaOptions] = useState<CinemaResponse[]>([]);
    const [movies, setMovies] = useState<Movie[]>([]);
    const [movieTypes, setMovieTypes] = useState<MovieTypeResponse[]>([]);
    const [combos, setCombos] = useState<ComboResponse[]>([]);

    const [overviewFilters, setOverviewFilters] = useState<DateRange>(defaultDateRange);
    const [overviewData, setOverviewData] = useState<DashboardOverview | null>(null);
    const [overviewLoading, setOverviewLoading] = useState(false);
    const [overviewLoaded, setOverviewLoaded] = useState(false);

    const [cinemaFilters, setCinemaFilters] = useState<CinemaTabFilters>({
        ...defaultDateRange,
        provinceId: "",
        cinemaId: "",
        topN: "",
        sort: "DESC",
        page: 1,
        size: 10,
    });
    const [cinemaData, setCinemaData] = useState<RevenueRankingResponse<CinemaRevenueItem> | null>(null);
    const [cinemaLoading, setCinemaLoading] = useState(false);
    const [cinemaLoaded, setCinemaLoaded] = useState(false);

    const [movieFilters, setMovieFilters] = useState<MovieTabFilters>({
        ...defaultDateRange,
        movieId: "",
        topN: "",
        sort: "DESC",
        page: 1,
        size: 10,
    });
    const [movieData, setMovieData] = useState<RevenueRankingResponse<MovieRevenueItem> | null>(null);
    const [movieLoading, setMovieLoading] = useState(false);
    const [movieLoaded, setMovieLoaded] = useState(false);

    const [movieTypeFilters, setMovieTypeFilters] = useState<MovieTypeTabFilters>({
        ...defaultDateRange,
        categoryId: "",
        topN: "",
        sort: "DESC",
        page: 1,
        size: 10,
    });
    const [movieTypeData, setMovieTypeData] = useState<RevenueRankingResponse<MovieTypeRevenueItem> | null>(null);
    const [movieTypeLoading, setMovieTypeLoading] = useState(false);
    const [movieTypeLoaded, setMovieTypeLoaded] = useState(false);

    const [comboFilters, setComboFilters] = useState<ComboTabFilters>({
        ...defaultDateRange,
        comboId: "",
        topN: "",
        sort: "DESC",
        page: 1,
        size: 10,
    });
    const [comboData, setComboData] = useState<RevenueRankingResponse<ComboRevenueItem> | null>(null);
    const [comboLoading, setComboLoading] = useState(false);
    const [comboLoaded, setComboLoaded] = useState(false);

    const [orderFilters, setOrderFilters] = useState<OrderTabFilters>({
        fromDate: defaultDateRange.startDate,
        toDate: defaultDateRange.endDate,
        status: "",
        page: 1,
        size: 10,
    });
    const [orderData, setOrderData] = useState<DashboardOrderStatistics | null>(null);
    const [orderLoading, setOrderLoading] = useState(false);
    const [orderLoaded, setOrderLoaded] = useState(false);

    const fetchOverview = useCallback(async (filters: DateRange) => {
        if (!validateDateRange(filters)) {
            toast.error("Khoảng ngày không hợp lệ");
            return;
        }

        try {
            setOverviewLoading(true);
            const response = await dashboardService.getOverview(filters);
            if (response.code !== "SUCCESS") {
                toast.error(response.message || "Không thể tải dữ liệu tổng quan");
                return;
            }

            setOverviewData(response.result);
        } catch (error) {
            toast.error(resolveApiErrorMessage(error, "Không thể tải dữ liệu tổng quan"));
        } finally {
            setOverviewLoading(false);
            setOverviewLoaded(true);
        }
    }, []);

    const fetchCinemaRevenue = useCallback(async (filters: CinemaTabFilters) => {
        if (!validateDateRange(filters)) {
            toast.error("Khoảng ngày không hợp lệ");
            return;
        }

        const parsedTopN = parseOptionalPositiveInteger(filters.topN);
        if (!parsedTopN.isValid) {
            toast.error("Top N phải là số nguyên dương");
            return;
        }

        try {
            setCinemaLoading(true);
            const response = await dashboardService.getRevenueByCinema({
                startDate: filters.startDate,
                endDate: filters.endDate,
                provinceId: filters.provinceId === "" ? undefined : filters.provinceId,
                cinemaId: filters.cinemaId === "" ? undefined : filters.cinemaId,
                n: parsedTopN.value,
                sort: filters.sort,
                page: filters.page,
                size: filters.size,
            });

            if (response.code !== "SUCCESS") {
                toast.error(response.message || "Không thể tải doanh thu theo rạp");
                return;
            }

            setCinemaData(response.result ?? buildEmptyRanking(filters.page, filters.size));
        } catch (error) {
            toast.error(resolveApiErrorMessage(error, "Không thể tải doanh thu theo rạp"));
        } finally {
            setCinemaLoading(false);
            setCinemaLoaded(true);
        }
    }, []);

    const fetchMovieRevenue = useCallback(async (filters: MovieTabFilters) => {
        if (!validateDateRange(filters)) {
            toast.error("Khoảng ngày không hợp lệ");
            return;
        }

        const parsedTopN = parseOptionalPositiveInteger(filters.topN);
        if (!parsedTopN.isValid) {
            toast.error("Top N phải là số nguyên dương");
            return;
        }

        try {
            setMovieLoading(true);
            const response = await dashboardService.getRevenueByMovie({
                startDate: filters.startDate,
                endDate: filters.endDate,
                movieId: filters.movieId === "" ? undefined : filters.movieId,
                n: parsedTopN.value,
                sort: filters.sort,
                page: filters.page,
                size: filters.size,
            });

            if (response.code !== "SUCCESS") {
                toast.error(response.message || "Không thể tải doanh thu theo phim");
                return;
            }

            setMovieData(response.result ?? buildEmptyRanking(filters.page, filters.size));
        } catch (error) {
            toast.error(resolveApiErrorMessage(error, "Không thể tải doanh thu theo phim"));
        } finally {
            setMovieLoading(false);
            setMovieLoaded(true);
        }
    }, []);

    const fetchMovieTypeRevenue = useCallback(async (filters: MovieTypeTabFilters) => {
        if (!validateDateRange(filters)) {
            toast.error("Khoảng ngày không hợp lệ");
            return;
        }

        const parsedTopN = parseOptionalPositiveInteger(filters.topN);
        if (!parsedTopN.isValid) {
            toast.error("Top N phải là số nguyên dương");
            return;
        }

        try {
            setMovieTypeLoading(true);
            const response = await dashboardService.getRevenueByMovieType({
                startDate: filters.startDate,
                endDate: filters.endDate,
                categoryId: filters.categoryId === "" ? undefined : filters.categoryId,
                n: parsedTopN.value,
                sort: filters.sort,
                page: filters.page,
                size: filters.size,
            });

            if (response.code !== "SUCCESS") {
                toast.error(response.message || "Không thể tải doanh thu theo loại phim");
                return;
            }

            setMovieTypeData(response.result ?? buildEmptyRanking(filters.page, filters.size));
        } catch (error) {
            toast.error(resolveApiErrorMessage(error, "Không thể tải doanh thu theo loại phim"));
        } finally {
            setMovieTypeLoading(false);
            setMovieTypeLoaded(true);
        }
    }, []);

    const fetchComboRevenue = useCallback(async (filters: ComboTabFilters) => {
        if (!validateDateRange(filters)) {
            toast.error("Khoảng ngày không hợp lệ");
            return;
        }

        const parsedTopN = parseOptionalPositiveInteger(filters.topN);
        if (!parsedTopN.isValid) {
            toast.error("Top N phải là số nguyên dương");
            return;
        }

        try {
            setComboLoading(true);
            const response = await dashboardService.getRevenueByCombo({
                startDate: filters.startDate,
                endDate: filters.endDate,
                comboId: filters.comboId === "" ? undefined : filters.comboId,
                n: parsedTopN.value,
                sort: filters.sort,
                page: filters.page,
                size: filters.size,
            });

            if (response.code !== "SUCCESS") {
                toast.error(response.message || "Không thể tải doanh thu theo combo");
                return;
            }

            setComboData(response.result ?? buildEmptyRanking(filters.page, filters.size));
        } catch (error) {
            toast.error(resolveApiErrorMessage(error, "Không thể tải doanh thu theo combo"));
        } finally {
            setComboLoading(false);
            setComboLoaded(true);
        }
    }, []);

    const fetchOrderStatistics = useCallback(async (filters: OrderTabFilters) => {
        if (!validateOrderDateRange(filters)) {
            toast.error("Khoảng ngày không hợp lệ");
            return;
        }

        try {
            setOrderLoading(true);
            const response = await dashboardService.getOrderStatistics({
                fromDate: filters.fromDate,
                toDate: filters.toDate,
                status: filters.status === "" ? undefined : filters.status,
                page: filters.page,
                size: filters.size,
            });

            if (response.code !== "SUCCESS") {
                toast.error(response.message || "Không thể tải thống kê đơn hàng");
                return;
            }

            setOrderData(response.result ?? buildEmptyOrderStatistics(filters));
        } catch (error) {
            toast.error(resolveApiErrorMessage(error, "Không thể tải thống kê đơn hàng"));
        } finally {
            setOrderLoading(false);
            setOrderLoaded(true);
        }
    }, []);

    const fetchFilterOptions = useCallback(async () => {
        const [provinceResponse, movieResponse, movieTypeResponse, comboResponse] = await Promise.all([
            provinceService.filterProvinces({ page: 1, size: 100 }),
            movieService.filterMovies({ page: 1, size: 100 }),
            movieTypeService.getMovieTypeItemList(),
            comboService.getCombos(),
        ]);

        setProvinces(provinceResponse.result?.items ?? []);
        setMovies(movieResponse.result?.items ?? []);
        setMovieTypes(movieTypeResponse.result?.items ?? []);
        setCombos(comboResponse.result ?? []);
    }, []);

    const fetchCinemaOptions = useCallback(async (provinceId?: number) => {
        try {
            const response = await cinemaService.getCinemaItemList({ provinceId });
            setCinemaOptions(response.result?.items ?? []);
        } catch {
            setCinemaOptions([]);
        }
    }, []);

    useEffect(() => {
        const bootstrap = async () => {
            try {
                await fetchFilterOptions();
            } catch (error) {
                toast.error(resolveApiErrorMessage(error, "Không thể tải dữ liệu bộ lọc"));
            }
        };

        void bootstrap();
    }, [fetchFilterOptions]);

    useEffect(() => {
        const provinceId = cinemaFilters.provinceId === "" ? undefined : cinemaFilters.provinceId;
        void fetchCinemaOptions(provinceId);
    }, [cinemaFilters.provinceId, fetchCinemaOptions]);

    useEffect(() => {
        if (activeTab === "overview" && !overviewLoaded) {
            void fetchOverview(overviewFilters);
            return;
        }
        if (activeTab === "cinema" && !cinemaLoaded) {
            void fetchCinemaRevenue(cinemaFilters);
            return;
        }
        if (activeTab === "movie" && !movieLoaded) {
            void fetchMovieRevenue(movieFilters);
            return;
        }
        if (activeTab === "movieType" && !movieTypeLoaded) {
            void fetchMovieTypeRevenue(movieTypeFilters);
            return;
        }
        if (activeTab === "combo" && !comboLoaded) {
            void fetchComboRevenue(comboFilters);
            return;
        }
        if (activeTab === "order" && !orderLoaded) {
            void fetchOrderStatistics(orderFilters);
        }
    }, [
        activeTab,
        overviewLoaded,
        cinemaLoaded,
        movieLoaded,
        movieTypeLoaded,
        comboLoaded,
        orderLoaded,
        fetchOverview,
        fetchCinemaRevenue,
        fetchMovieRevenue,
        fetchMovieTypeRevenue,
        fetchComboRevenue,
        fetchOrderStatistics,
        overviewFilters,
        cinemaFilters,
        movieFilters,
        movieTypeFilters,
        comboFilters,
        orderFilters,
    ]);

    const overviewCards = useMemo(
        () => [
            {
                title: "Tổng doanh thu",
                value: formatCurrency(overviewData?.totalRevenue),
                accent: "bg-[var(--glx-orange)]",
            },
            {
                title: "Tổng số đơn hàng",
                value: formatNumber(overviewData?.totalOrderCount),
                accent: "bg-violet-500",
            },
            {
                title: "Số khách hàng",
                value: formatNumber(overviewData?.customerCount),
                accent: "bg-[var(--glx-blue)]",
            },
            {
                title: "Số phim",
                value: formatNumber(overviewData?.movieCount),
                accent: "bg-emerald-500",
            },
            {
                title: "Số rạp",
                value: formatNumber(overviewData?.cinemaCount),
                accent: "bg-sky-500",
            },
        ],
        [overviewData]
    );

    const cinemaResult = cinemaData ?? buildEmptyRanking<CinemaRevenueItem>(cinemaFilters.page, cinemaFilters.size);
    const movieResult = movieData ?? buildEmptyRanking<MovieRevenueItem>(movieFilters.page, movieFilters.size);
    const movieTypeResult =
        movieTypeData ?? buildEmptyRanking<MovieTypeRevenueItem>(movieTypeFilters.page, movieTypeFilters.size);
    const comboResult = comboData ?? buildEmptyRanking<ComboRevenueItem>(comboFilters.page, comboFilters.size);
    const orderResult = orderData ?? buildEmptyOrderStatistics(orderFilters);

    const cinemaChart = cinemaResult.chartItems.map((item) => ({
        key: `cinema-${item.cinemaId}`,
        label: item.cinemaName,
        value: Number(item.revenue ?? 0),
    }));

    const movieChart = movieResult.chartItems.map((item) => ({
        key: `movie-${item.movieId}`,
        label: item.movieName,
        value: Number(item.revenue ?? 0),
    }));

    const movieTypeChart = movieTypeResult.chartItems.map((item) => ({
        key: `movietype-${item.movieTypeId}`,
        label: item.movieTypeName,
        value: Number(item.revenue ?? 0),
    }));

    const comboChart = comboResult.chartItems.map((item) => ({
        key: `combo-${item.comboId}`,
        label: item.comboName,
        value: Number(item.revenue ?? 0),
    }));

    return (
        <div className="space-y-6">
            <section className="rounded-2xl border border-[var(--glx-border)] bg-white p-5 shadow-[0_18px_42px_-35px_rgba(15,23,42,0.5)] sm:p-6">
                <div className="mb-4">
                    <p className="text-xs uppercase tracking-[0.16em] text-[var(--glx-blue)]">
                        Dashboard quản trị
                    </p>
                    <h2 className="mt-1 text-2xl font-bold text-slate-800">Thống kê doanh thu</h2>
                    <p className="mt-2 text-sm text-[var(--glx-text-muted)]">
                        Doanh thu chỉ tính từ các đơn hàng có trạng thái <strong>PAID</strong>.
                    </p>
                </div>

                <div className="border-b border-[var(--glx-border)]">
                    <nav className="flex gap-6 overflow-x-auto pb-0.5">
                        {TAB_ITEMS.map((tab) => {
                            const active = activeTab === tab.key;
                            return (
                                <button
                                    key={tab.key}
                                    type="button"
                                    onClick={() => setActiveTab(tab.key)}
                                    className={`relative whitespace-nowrap pb-3 text-sm font-bold transition-colors ${
                                        active ? "text-[var(--glx-blue)]" : "text-slate-500 hover:text-slate-700"
                                    }`}
                                >
                                    {tab.label}
                                    <span
                                        className={`absolute bottom-0 left-0 h-[3px] w-full rounded-full bg-[var(--glx-blue)] transition-opacity ${
                                            active ? "opacity-100" : "opacity-0"
                                        }`}
                                    />
                                </button>
                            );
                        })}
                    </nav>
                </div>

                {activeTab === "overview" && (
                    <div className="space-y-5 pt-5">
                        <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_1fr_auto]">
                            <input
                                type="date"
                                value={overviewFilters.startDate}
                                onChange={(event) =>
                                    setOverviewFilters((prev) => ({
                                        ...prev,
                                        startDate: event.target.value,
                                    }))
                                }
                                className="h-11 rounded-xl border border-[var(--glx-border)] px-4 text-sm outline-none transition-all focus:border-[var(--glx-blue)] focus:ring-2 focus:ring-[var(--glx-blue)]/15"
                            />
                            <input
                                type="date"
                                value={overviewFilters.endDate}
                                onChange={(event) =>
                                    setOverviewFilters((prev) => ({
                                        ...prev,
                                        endDate: event.target.value,
                                    }))
                                }
                                className="h-11 rounded-xl border border-[var(--glx-border)] px-4 text-sm outline-none transition-all focus:border-[var(--glx-blue)] focus:ring-2 focus:ring-[var(--glx-blue)]/15"
                            />
                            <button
                                type="button"
                                onClick={() => void fetchOverview(overviewFilters)}
                                disabled={overviewLoading}
                                className="h-11 rounded-xl border border-[var(--glx-blue)] bg-[var(--glx-blue)] px-4 text-sm font-semibold text-white transition-all duration-300 hover:bg-[var(--glx-blue-strong)] disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {overviewLoading ? "Đang tải..." : "Xem thống kê"}
                            </button>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                            {overviewCards.map((card) => (
                                <article
                                    key={card.title}
                                    className="rounded-2xl border border-[var(--glx-border)] bg-white p-5 shadow-[0_18px_42px_-35px_rgba(15,23,42,0.5)]"
                                >
                                    <div className={`h-1.5 w-12 rounded-full ${card.accent}`} />
                                    <p className="mt-4 text-sm font-semibold text-slate-500">{card.title}</p>
                                    <p className="mt-2 text-2xl font-bold text-slate-800">{card.value}</p>
                                    <p className="mt-2 text-xs text-[var(--glx-text-muted)]">
                                        Từ {overviewFilters.startDate} đến {overviewFilters.endDate}
                                    </p>
                                </article>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === "cinema" && (
                    <div className="space-y-5 pt-5">
                        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-[1fr_1fr_1fr_1fr_0.9fr_0.9fr_auto]">
                            <input
                                type="date"
                                value={cinemaFilters.startDate}
                                onChange={(event) =>
                                    setCinemaFilters((prev) => ({ ...prev, startDate: event.target.value }))
                                }
                                className="h-11 rounded-xl border border-[var(--glx-border)] px-4 text-sm outline-none focus:border-[var(--glx-blue)] focus:ring-2 focus:ring-[var(--glx-blue)]/15"
                            />
                            <input
                                type="date"
                                value={cinemaFilters.endDate}
                                onChange={(event) =>
                                    setCinemaFilters((prev) => ({ ...prev, endDate: event.target.value }))
                                }
                                className="h-11 rounded-xl border border-[var(--glx-border)] px-4 text-sm outline-none focus:border-[var(--glx-blue)] focus:ring-2 focus:ring-[var(--glx-blue)]/15"
                            />
                            <select
                                value={cinemaFilters.provinceId}
                                onChange={(event) => {
                                    const value = event.target.value;
                                    setCinemaFilters((prev) => ({
                                        ...prev,
                                        provinceId: value ? Number(value) : "",
                                        cinemaId: "",
                                    }));
                                }}
                                className="h-11 rounded-xl border border-[var(--glx-border)] px-4 text-sm outline-none focus:border-[var(--glx-blue)] focus:ring-2 focus:ring-[var(--glx-blue)]/15"
                            >
                                <option value="">Tất cả tỉnh/thành</option>
                                {provinces.map((province) => (
                                    <option key={province.provinceId} value={province.provinceId}>
                                        {province.provinceName}
                                    </option>
                                ))}
                            </select>
                            <select
                                value={cinemaFilters.cinemaId}
                                onChange={(event) => {
                                    const value = event.target.value;
                                    setCinemaFilters((prev) => ({
                                        ...prev,
                                        cinemaId: value ? Number(value) : "",
                                    }));
                                }}
                                className="h-11 rounded-xl border border-[var(--glx-border)] px-4 text-sm outline-none focus:border-[var(--glx-blue)] focus:ring-2 focus:ring-[var(--glx-blue)]/15"
                            >
                                <option value="">Tất cả rạp</option>
                                {cinemaOptions.map((cinema) => (
                                    <option key={cinema.cinemaId} value={cinema.cinemaId}>
                                        {cinema.cinemaName}
                                    </option>
                                ))}
                            </select>
                            <input
                                type="number"
                                min={1}
                                value={cinemaFilters.topN}
                                onChange={(event) =>
                                    setCinemaFilters((prev) => ({ ...prev, topN: event.target.value }))
                                }
                                placeholder="Top N"
                                className="h-11 rounded-xl border border-[var(--glx-border)] px-4 text-sm outline-none focus:border-[var(--glx-blue)] focus:ring-2 focus:ring-[var(--glx-blue)]/15"
                            />
                            <select
                                value={cinemaFilters.sort}
                                onChange={(event) =>
                                    setCinemaFilters((prev) => ({
                                        ...prev,
                                        sort: event.target.value as "ASC" | "DESC",
                                    }))
                                }
                                className="h-11 rounded-xl border border-[var(--glx-border)] px-4 text-sm outline-none focus:border-[var(--glx-blue)] focus:ring-2 focus:ring-[var(--glx-blue)]/15"
                            >
                                <option value="DESC">Doanh thu giảm dần</option>
                                <option value="ASC">Doanh thu tăng dần</option>
                            </select>
                            <button
                                type="button"
                                onClick={() => {
                                    const next = { ...cinemaFilters, page: 1 };
                                    setCinemaFilters(next);
                                    void fetchCinemaRevenue(next);
                                }}
                                disabled={cinemaLoading}
                                className="h-11 rounded-xl bg-[var(--glx-blue)] px-4 text-sm font-semibold text-white hover:bg-[var(--glx-blue-strong)] disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {cinemaLoading ? "Đang tải..." : "Áp dụng"}
                            </button>
                        </div>

                        <div>
                            <RevenueBarChart
                                title={`Biểu đồ doanh thu theo rạp (${cinemaFilters.sort === "ASC" ? "tăng dần" : "giảm dần"})`}
                                bars={cinemaChart}
                                colorClass="bg-[var(--glx-blue)]"
                            />
                        </div>

                        <section className="rounded-2xl border border-[var(--glx-border)]">
                            <div className="flex flex-col gap-3 border-b border-[var(--glx-border)] px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                                <div>
                                    <h3 className="text-lg font-bold text-slate-800">Bảng doanh thu theo rạp</h3>
                                    <p className="text-xs text-slate-500">
                                        Tổng doanh thu: <strong>{formatCurrency(cinemaResult.totalRevenue)}</strong>
                                    </p>
                                </div>
                                <label className="flex items-center gap-2 text-sm text-slate-600">
                                    <span>Kích thước</span>
                                    <select
                                        value={cinemaFilters.size}
                                        onChange={(event) => {
                                            const next = {
                                                ...cinemaFilters,
                                                size: Number(event.target.value),
                                                page: 1,
                                            };
                                            setCinemaFilters(next);
                                            void fetchCinemaRevenue(next);
                                        }}
                                        className="rounded-md border border-[var(--glx-border)] px-2 py-1 text-sm"
                                    >
                                        {PAGE_SIZE_OPTIONS.map((size) => (
                                            <option key={`cinema-size-${size}`} value={size}>
                                                {size}
                                            </option>
                                        ))}
                                    </select>
                                </label>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-[var(--glx-border)] text-sm">
                                    <thead className="bg-slate-50 text-left">
                                        <tr>
                                            <th className="px-6 py-3 font-bold text-slate-600">STT</th>
                                            <th className="px-6 py-3 font-bold text-slate-600">Mã rạp</th>
                                            <th className="px-6 py-3 font-bold text-slate-600">Tên rạp</th>
                                            <th className="px-6 py-3 font-bold text-slate-600">Tỉnh/Thành</th>
                                            <th className="px-6 py-3 font-bold text-slate-600">Số đơn PAID</th>
                                            <th className="px-6 py-3 text-right font-bold text-slate-600">
                                                Doanh thu
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[var(--glx-border)] bg-white">
                                        {cinemaLoading ? (
                                            <tr>
                                                <td colSpan={6} className="px-6 py-10 text-center text-slate-500">
                                                    Đang tải dữ liệu...
                                                </td>
                                            </tr>
                                        ) : cinemaResult.items.length === 0 ? (
                                            <tr>
                                                <td colSpan={6} className="px-6 py-10 text-center text-slate-500">
                                                    Không có dữ liệu
                                                </td>
                                            </tr>
                                        ) : (
                                            cinemaResult.items.map((item, index) => (
                                                <tr key={`${item.cinemaId}-${index}`}>
                                                    <td className="px-6 py-4 text-slate-600">
                                                        {(cinemaFilters.page - 1) * cinemaFilters.size + index + 1}
                                                    </td>
                                                    <td className="px-6 py-4 text-slate-600">{item.cinemaId}</td>
                                                    <td className="px-6 py-4 font-semibold text-slate-700">
                                                        {item.cinemaName}
                                                    </td>
                                                    <td className="px-6 py-4 text-slate-600">
                                                        {item.provinceName}
                                                    </td>
                                                    <td className="px-6 py-4 text-slate-600">
                                                        {formatNumber(item.paidOrderCount)}
                                                    </td>
                                                    <td className="px-6 py-4 text-right font-semibold text-[var(--glx-orange)]">
                                                        {formatCurrency(item.revenue)}
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            <Pagination
                                currentPage={cinemaFilters.page}
                                totalPages={Math.max(1, cinemaResult.totalPages)}
                                disabled={cinemaLoading}
                                onPageChange={(page) => {
                                    const next = { ...cinemaFilters, page };
                                    setCinemaFilters(next);
                                    void fetchCinemaRevenue(next);
                                }}
                            />
                        </section>
                    </div>
                )}

                {activeTab === "movie" && (
                    <div className="space-y-5 pt-5">
                        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-[1fr_1fr_1fr_0.9fr_0.9fr_auto]">
                            <input
                                type="date"
                                value={movieFilters.startDate}
                                onChange={(event) =>
                                    setMovieFilters((prev) => ({ ...prev, startDate: event.target.value }))
                                }
                                className="h-11 rounded-xl border border-[var(--glx-border)] px-4 text-sm outline-none focus:border-[var(--glx-blue)] focus:ring-2 focus:ring-[var(--glx-blue)]/15"
                            />
                            <input
                                type="date"
                                value={movieFilters.endDate}
                                onChange={(event) =>
                                    setMovieFilters((prev) => ({ ...prev, endDate: event.target.value }))
                                }
                                className="h-11 rounded-xl border border-[var(--glx-border)] px-4 text-sm outline-none focus:border-[var(--glx-blue)] focus:ring-2 focus:ring-[var(--glx-blue)]/15"
                            />
                            <select
                                value={movieFilters.movieId}
                                onChange={(event) => {
                                    const value = event.target.value;
                                    setMovieFilters((prev) => ({
                                        ...prev,
                                        movieId: value ? Number(value) : "",
                                    }));
                                }}
                                className="h-11 rounded-xl border border-[var(--glx-border)] px-4 text-sm outline-none focus:border-[var(--glx-blue)] focus:ring-2 focus:ring-[var(--glx-blue)]/15"
                            >
                                <option value="">Tất cả phim</option>
                                {movies.map((movie) => (
                                    <option key={movie.movieId} value={movie.movieId}>
                                        {movie.movieName}
                                    </option>
                                ))}
                            </select>
                            <input
                                type="number"
                                min={1}
                                value={movieFilters.topN}
                                onChange={(event) =>
                                    setMovieFilters((prev) => ({ ...prev, topN: event.target.value }))
                                }
                                placeholder="Top N"
                                className="h-11 rounded-xl border border-[var(--glx-border)] px-4 text-sm outline-none focus:border-[var(--glx-blue)] focus:ring-2 focus:ring-[var(--glx-blue)]/15"
                            />
                            <select
                                value={movieFilters.sort}
                                onChange={(event) =>
                                    setMovieFilters((prev) => ({
                                        ...prev,
                                        sort: event.target.value as "ASC" | "DESC",
                                    }))
                                }
                                className="h-11 rounded-xl border border-[var(--glx-border)] px-4 text-sm outline-none focus:border-[var(--glx-blue)] focus:ring-2 focus:ring-[var(--glx-blue)]/15"
                            >
                                <option value="DESC">Doanh thu giảm dần</option>
                                <option value="ASC">Doanh thu tăng dần</option>
                            </select>
                            <button
                                type="button"
                                onClick={() => {
                                    const next = { ...movieFilters, page: 1 };
                                    setMovieFilters(next);
                                    void fetchMovieRevenue(next);
                                }}
                                disabled={movieLoading}
                                className="h-11 rounded-xl bg-[var(--glx-blue)] px-4 text-sm font-semibold text-white hover:bg-[var(--glx-blue-strong)] disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {movieLoading ? "Đang tải..." : "Áp dụng"}
                            </button>
                        </div>

                        <div>
                            <RevenueBarChart
                                title={`Biểu đồ doanh thu theo phim (${movieFilters.sort === "ASC" ? "tăng dần" : "giảm dần"})`}
                                bars={movieChart}
                                colorClass="bg-[var(--glx-blue)]"
                            />
                        </div>

                        <section className="rounded-2xl border border-[var(--glx-border)]">
                            <div className="flex flex-col gap-3 border-b border-[var(--glx-border)] px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                                <div>
                                    <h3 className="text-lg font-bold text-slate-800">Bảng doanh thu theo phim</h3>
                                    <p className="text-xs text-slate-500">
                                        Tổng doanh thu: <strong>{formatCurrency(movieResult.totalRevenue)}</strong>
                                    </p>
                                </div>
                                <label className="flex items-center gap-2 text-sm text-slate-600">
                                    <span>Kích thước</span>
                                    <select
                                        value={movieFilters.size}
                                        onChange={(event) => {
                                            const next = {
                                                ...movieFilters,
                                                size: Number(event.target.value),
                                                page: 1,
                                            };
                                            setMovieFilters(next);
                                            void fetchMovieRevenue(next);
                                        }}
                                        className="rounded-md border border-[var(--glx-border)] px-2 py-1 text-sm"
                                    >
                                        {PAGE_SIZE_OPTIONS.map((size) => (
                                            <option key={`movie-size-${size}`} value={size}>
                                                {size}
                                            </option>
                                        ))}
                                    </select>
                                </label>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-[var(--glx-border)] text-sm">
                                    <thead className="bg-slate-50 text-left">
                                        <tr>
                                            <th className="px-6 py-3 font-bold text-slate-600">STT</th>
                                            <th className="px-6 py-3 font-bold text-slate-600">Mã phim</th>
                                            <th className="px-6 py-3 font-bold text-slate-600">Tên phim</th>
                                            <th className="px-6 py-3 font-bold text-slate-600">Loại phim</th>
                                            <th className="px-6 py-3 font-bold text-slate-600">Trạng thái</th>
                                            <th className="px-6 py-3 font-bold text-slate-600">Khởi chiếu</th>
                                            <th className="px-6 py-3 font-bold text-slate-600">Kết thúc</th>
                                            <th className="px-6 py-3 font-bold text-slate-600">Số đơn PAID</th>
                                            <th className="px-6 py-3 text-right font-bold text-slate-600">
                                                Doanh thu
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[var(--glx-border)] bg-white">
                                        {movieLoading ? (
                                            <tr>
                                                <td colSpan={9} className="px-6 py-10 text-center text-slate-500">
                                                    Đang tải dữ liệu...
                                                </td>
                                            </tr>
                                        ) : movieResult.items.length === 0 ? (
                                            <tr>
                                                <td colSpan={9} className="px-6 py-10 text-center text-slate-500">
                                                    Không có dữ liệu
                                                </td>
                                            </tr>
                                        ) : (
                                            movieResult.items.map((item, index) => (
                                                <tr key={`${item.movieId}-${index}`}>
                                                    <td className="px-6 py-4 text-slate-600">
                                                        {(movieFilters.page - 1) * movieFilters.size + index + 1}
                                                    </td>
                                                    <td className="px-6 py-4 text-slate-600">{item.movieId}</td>
                                                    <td className="px-6 py-4 font-semibold text-slate-700">
                                                        {item.movieName}
                                                    </td>
                                                    <td className="px-6 py-4 text-slate-600">
                                                        {item.movieTypeName}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span
                                                            className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${resolveStatusBadge(item.status)}`}
                                                        >
                                                            {item.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-slate-600">
                                                        {formatDateCell(item.releaseDate)}
                                                    </td>
                                                    <td className="px-6 py-4 text-slate-600">
                                                        {formatDateCell(item.endDate)}
                                                    </td>
                                                    <td className="px-6 py-4 text-slate-600">
                                                        {formatNumber(item.paidOrderCount)}
                                                    </td>
                                                    <td className="px-6 py-4 text-right font-semibold text-[var(--glx-orange)]">
                                                        {formatCurrency(item.revenue)}
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            <Pagination
                                currentPage={movieFilters.page}
                                totalPages={Math.max(1, movieResult.totalPages)}
                                disabled={movieLoading}
                                onPageChange={(page) => {
                                    const next = { ...movieFilters, page };
                                    setMovieFilters(next);
                                    void fetchMovieRevenue(next);
                                }}
                            />
                        </section>
                    </div>
                )}

                {activeTab === "movieType" && (
                    <div className="space-y-5 pt-5">
                        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-[1fr_1fr_1fr_0.9fr_0.9fr_auto]">
                            <input
                                type="date"
                                value={movieTypeFilters.startDate}
                                onChange={(event) =>
                                    setMovieTypeFilters((prev) => ({
                                        ...prev,
                                        startDate: event.target.value,
                                    }))
                                }
                                className="h-11 rounded-xl border border-[var(--glx-border)] px-4 text-sm outline-none focus:border-[var(--glx-blue)] focus:ring-2 focus:ring-[var(--glx-blue)]/15"
                            />
                            <input
                                type="date"
                                value={movieTypeFilters.endDate}
                                onChange={(event) =>
                                    setMovieTypeFilters((prev) => ({
                                        ...prev,
                                        endDate: event.target.value,
                                    }))
                                }
                                className="h-11 rounded-xl border border-[var(--glx-border)] px-4 text-sm outline-none focus:border-[var(--glx-blue)] focus:ring-2 focus:ring-[var(--glx-blue)]/15"
                            />
                            <select
                                value={movieTypeFilters.categoryId}
                                onChange={(event) => {
                                    const value = event.target.value;
                                    setMovieTypeFilters((prev) => ({
                                        ...prev,
                                        categoryId: value ? Number(value) : "",
                                    }));
                                }}
                                className="h-11 rounded-xl border border-[var(--glx-border)] px-4 text-sm outline-none focus:border-[var(--glx-blue)] focus:ring-2 focus:ring-[var(--glx-blue)]/15"
                            >
                                <option value="">Tất cả loại phim</option>
                                {movieTypes.map((movieType) => (
                                    <option key={movieType.movieTypeId} value={movieType.movieTypeId}>
                                        {movieType.movieTypeName}
                                    </option>
                                ))}
                            </select>
                            <input
                                type="number"
                                min={1}
                                value={movieTypeFilters.topN}
                                onChange={(event) =>
                                    setMovieTypeFilters((prev) => ({ ...prev, topN: event.target.value }))
                                }
                                placeholder="Top N"
                                className="h-11 rounded-xl border border-[var(--glx-border)] px-4 text-sm outline-none focus:border-[var(--glx-blue)] focus:ring-2 focus:ring-[var(--glx-blue)]/15"
                            />
                            <select
                                value={movieTypeFilters.sort}
                                onChange={(event) =>
                                    setMovieTypeFilters((prev) => ({
                                        ...prev,
                                        sort: event.target.value as "ASC" | "DESC",
                                    }))
                                }
                                className="h-11 rounded-xl border border-[var(--glx-border)] px-4 text-sm outline-none focus:border-[var(--glx-blue)] focus:ring-2 focus:ring-[var(--glx-blue)]/15"
                            >
                                <option value="DESC">Doanh thu giảm dần</option>
                                <option value="ASC">Doanh thu tăng dần</option>
                            </select>
                            <button
                                type="button"
                                onClick={() => {
                                    const next = { ...movieTypeFilters, page: 1 };
                                    setMovieTypeFilters(next);
                                    void fetchMovieTypeRevenue(next);
                                }}
                                disabled={movieTypeLoading}
                                className="h-11 rounded-xl bg-[var(--glx-blue)] px-4 text-sm font-semibold text-white hover:bg-[var(--glx-blue-strong)] disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {movieTypeLoading ? "Đang tải..." : "Áp dụng"}
                            </button>
                        </div>

                        <div>
                            <RevenueBarChart
                                title={`Biểu đồ doanh thu theo loại phim (${movieTypeFilters.sort === "ASC" ? "tăng dần" : "giảm dần"})`}
                                bars={movieTypeChart}
                                colorClass="bg-[var(--glx-blue)]"
                            />
                        </div>

                        <section className="rounded-2xl border border-[var(--glx-border)]">
                            <div className="flex flex-col gap-3 border-b border-[var(--glx-border)] px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                                <div>
                                    <h3 className="text-lg font-bold text-slate-800">
                                        Bảng doanh thu theo loại phim
                                    </h3>
                                    <p className="text-xs text-slate-500">
                                        Tổng doanh thu:{" "}
                                        <strong>{formatCurrency(movieTypeResult.totalRevenue)}</strong>
                                    </p>
                                </div>
                                <label className="flex items-center gap-2 text-sm text-slate-600">
                                    <span>Kích thước</span>
                                    <select
                                        value={movieTypeFilters.size}
                                        onChange={(event) => {
                                            const next = {
                                                ...movieTypeFilters,
                                                size: Number(event.target.value),
                                                page: 1,
                                            };
                                            setMovieTypeFilters(next);
                                            void fetchMovieTypeRevenue(next);
                                        }}
                                        className="rounded-md border border-[var(--glx-border)] px-2 py-1 text-sm"
                                    >
                                        {PAGE_SIZE_OPTIONS.map((size) => (
                                            <option key={`movietype-size-${size}`} value={size}>
                                                {size}
                                            </option>
                                        ))}
                                    </select>
                                </label>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-[var(--glx-border)] text-sm">
                                    <thead className="bg-slate-50 text-left">
                                        <tr>
                                            <th className="px-6 py-3 font-bold text-slate-600">STT</th>
                                            <th className="px-6 py-3 font-bold text-slate-600">Mã loại phim</th>
                                            <th className="px-6 py-3 font-bold text-slate-600">Tên loại phim</th>
                                            <th className="px-6 py-3 font-bold text-slate-600">Mô tả</th>
                                            <th className="px-6 py-3 font-bold text-slate-600">Trạng thái</th>
                                            <th className="px-6 py-3 font-bold text-slate-600">Số đơn PAID</th>
                                            <th className="px-6 py-3 text-right font-bold text-slate-600">
                                                Doanh thu
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[var(--glx-border)] bg-white">
                                        {movieTypeLoading ? (
                                            <tr>
                                                <td colSpan={7} className="px-6 py-10 text-center text-slate-500">
                                                    Đang tải dữ liệu...
                                                </td>
                                            </tr>
                                        ) : movieTypeResult.items.length === 0 ? (
                                            <tr>
                                                <td colSpan={7} className="px-6 py-10 text-center text-slate-500">
                                                    Không có dữ liệu
                                                </td>
                                            </tr>
                                        ) : (
                                            movieTypeResult.items.map((item, index) => (
                                                <tr key={`${item.movieTypeId}-${index}`}>
                                                    <td className="px-6 py-4 text-slate-600">
                                                        {(movieTypeFilters.page - 1) * movieTypeFilters.size +
                                                            index +
                                                            1}
                                                    </td>
                                                    <td className="px-6 py-4 text-slate-600">{item.movieTypeId}</td>
                                                    <td className="px-6 py-4 font-semibold text-slate-700">
                                                        {item.movieTypeName}
                                                    </td>
                                                    <td className="max-w-[320px] px-6 py-4 text-slate-600">
                                                        {item.description || "-"}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span
                                                            className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${resolveStatusBadge(item.status)}`}
                                                        >
                                                            {item.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-slate-600">
                                                        {formatNumber(item.paidOrderCount)}
                                                    </td>
                                                    <td className="px-6 py-4 text-right font-semibold text-[var(--glx-orange)]">
                                                        {formatCurrency(item.revenue)}
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            <Pagination
                                currentPage={movieTypeFilters.page}
                                totalPages={Math.max(1, movieTypeResult.totalPages)}
                                disabled={movieTypeLoading}
                                onPageChange={(page) => {
                                    const next = { ...movieTypeFilters, page };
                                    setMovieTypeFilters(next);
                                    void fetchMovieTypeRevenue(next);
                                }}
                            />
                        </section>
                    </div>
                )}

                {activeTab === "combo" && (
                    <div className="space-y-5 pt-5">
                        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-[1fr_1fr_1fr_0.9fr_0.9fr_auto]">
                            <input
                                type="date"
                                value={comboFilters.startDate}
                                onChange={(event) =>
                                    setComboFilters((prev) => ({ ...prev, startDate: event.target.value }))
                                }
                                className="h-11 rounded-xl border border-[var(--glx-border)] px-4 text-sm outline-none focus:border-[var(--glx-blue)] focus:ring-2 focus:ring-[var(--glx-blue)]/15"
                            />
                            <input
                                type="date"
                                value={comboFilters.endDate}
                                onChange={(event) =>
                                    setComboFilters((prev) => ({ ...prev, endDate: event.target.value }))
                                }
                                className="h-11 rounded-xl border border-[var(--glx-border)] px-4 text-sm outline-none focus:border-[var(--glx-blue)] focus:ring-2 focus:ring-[var(--glx-blue)]/15"
                            />
                            <select
                                value={comboFilters.comboId}
                                onChange={(event) => {
                                    const value = event.target.value;
                                    setComboFilters((prev) => ({
                                        ...prev,
                                        comboId: value ? Number(value) : "",
                                    }));
                                }}
                                className="h-11 rounded-xl border border-[var(--glx-border)] px-4 text-sm outline-none focus:border-[var(--glx-blue)] focus:ring-2 focus:ring-[var(--glx-blue)]/15"
                            >
                                <option value="">Tất cả combo</option>
                                {combos.map((combo) => (
                                    <option key={combo.comboId} value={combo.comboId}>
                                        {combo.comboName}
                                    </option>
                                ))}
                            </select>
                            <input
                                type="number"
                                min={1}
                                value={comboFilters.topN}
                                onChange={(event) =>
                                    setComboFilters((prev) => ({ ...prev, topN: event.target.value }))
                                }
                                placeholder="Top N"
                                className="h-11 rounded-xl border border-[var(--glx-border)] px-4 text-sm outline-none focus:border-[var(--glx-blue)] focus:ring-2 focus:ring-[var(--glx-blue)]/15"
                            />
                            <select
                                value={comboFilters.sort}
                                onChange={(event) =>
                                    setComboFilters((prev) => ({
                                        ...prev,
                                        sort: event.target.value as "ASC" | "DESC",
                                    }))
                                }
                                className="h-11 rounded-xl border border-[var(--glx-border)] px-4 text-sm outline-none focus:border-[var(--glx-blue)] focus:ring-2 focus:ring-[var(--glx-blue)]/15"
                            >
                                <option value="DESC">Doanh thu giảm dần</option>
                                <option value="ASC">Doanh thu tăng dần</option>
                            </select>
                            <button
                                type="button"
                                onClick={() => {
                                    const next = { ...comboFilters, page: 1 };
                                    setComboFilters(next);
                                    void fetchComboRevenue(next);
                                }}
                                disabled={comboLoading}
                                className="h-11 rounded-xl bg-[var(--glx-blue)] px-4 text-sm font-semibold text-white hover:bg-[var(--glx-blue-strong)] disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {comboLoading ? "Đang tải..." : "Áp dụng"}
                            </button>
                        </div>

                        <div>
                            <RevenueBarChart
                                title={`Biểu đồ doanh thu theo combo (${comboFilters.sort === "ASC" ? "tăng dần" : "giảm dần"})`}
                                bars={comboChart}
                                colorClass="bg-[var(--glx-blue)]"
                            />
                        </div>

                        <section className="rounded-2xl border border-[var(--glx-border)]">
                            <div className="flex flex-col gap-3 border-b border-[var(--glx-border)] px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                                <div>
                                    <h3 className="text-lg font-bold text-slate-800">Bảng doanh thu theo combo</h3>
                                    <p className="text-xs text-slate-500">
                                        Tổng doanh thu: <strong>{formatCurrency(comboResult.totalRevenue)}</strong>
                                    </p>
                                </div>
                                <label className="flex items-center gap-2 text-sm text-slate-600">
                                    <span>Kích thước</span>
                                    <select
                                        value={comboFilters.size}
                                        onChange={(event) => {
                                            const next = {
                                                ...comboFilters,
                                                size: Number(event.target.value),
                                                page: 1,
                                            };
                                            setComboFilters(next);
                                            void fetchComboRevenue(next);
                                        }}
                                        className="rounded-md border border-[var(--glx-border)] px-2 py-1 text-sm"
                                    >
                                        {PAGE_SIZE_OPTIONS.map((size) => (
                                            <option key={`combo-size-${size}`} value={size}>
                                                {size}
                                            </option>
                                        ))}
                                    </select>
                                </label>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-[var(--glx-border)] text-sm">
                                    <thead className="bg-slate-50 text-left">
                                        <tr>
                                            <th className="px-6 py-3 font-bold text-slate-600">STT</th>
                                            <th className="px-6 py-3 font-bold text-slate-600">Mã combo</th>
                                            <th className="px-6 py-3 font-bold text-slate-600">Tên combo</th>
                                            <th className="px-6 py-3 font-bold text-slate-600">Trạng thái</th>
                                            <th className="px-6 py-3 font-bold text-slate-600">Giá combo</th>
                                            <th className="px-6 py-3 font-bold text-slate-600">SL bán</th>
                                            <th className="px-6 py-3 font-bold text-slate-600">Số đơn PAID</th>
                                            <th className="px-6 py-3 text-right font-bold text-slate-600">
                                                Doanh thu
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[var(--glx-border)] bg-white">
                                        {comboLoading ? (
                                            <tr>
                                                <td colSpan={8} className="px-6 py-10 text-center text-slate-500">
                                                    Đang tải dữ liệu...
                                                </td>
                                            </tr>
                                        ) : comboResult.items.length === 0 ? (
                                            <tr>
                                                <td colSpan={8} className="px-6 py-10 text-center text-slate-500">
                                                    Không có dữ liệu
                                                </td>
                                            </tr>
                                        ) : (
                                            comboResult.items.map((item, index) => (
                                                <tr key={`${item.comboId}-${index}`}>
                                                    <td className="px-6 py-4 text-slate-600">
                                                        {(comboFilters.page - 1) * comboFilters.size + index + 1}
                                                    </td>
                                                    <td className="px-6 py-4 text-slate-600">{item.comboId}</td>
                                                    <td className="px-6 py-4 font-semibold text-slate-700">
                                                        {item.comboName}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span
                                                            className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${resolveStatusBadge(item.status)}`}
                                                        >
                                                            {item.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-slate-600">
                                                        {formatCurrency(item.price)}
                                                    </td>
                                                    <td className="px-6 py-4 text-slate-600">
                                                        {formatNumber(item.soldQuantity)}
                                                    </td>
                                                    <td className="px-6 py-4 text-slate-600">
                                                        {formatNumber(item.paidOrderCount)}
                                                    </td>
                                                    <td className="px-6 py-4 text-right font-semibold text-[var(--glx-orange)]">
                                                        {formatCurrency(item.revenue)}
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            <Pagination
                                currentPage={comboFilters.page}
                                totalPages={Math.max(1, comboResult.totalPages)}
                                disabled={comboLoading}
                                onPageChange={(page) => {
                                    const next = { ...comboFilters, page };
                                    setComboFilters(next);
                                    void fetchComboRevenue(next);
                                }}
                            />
                        </section>
                    </div>
                )}

                {activeTab === "order" && (
                    <div className="space-y-5 pt-5">
                        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-[1fr_1fr_1fr_auto]">
                            <input
                                type="date"
                                value={orderFilters.fromDate}
                                onChange={(event) =>
                                    setOrderFilters((prev) => ({ ...prev, fromDate: event.target.value }))
                                }
                                className="h-11 rounded-xl border border-[var(--glx-border)] px-4 text-sm outline-none focus:border-[var(--glx-blue)] focus:ring-2 focus:ring-[var(--glx-blue)]/15"
                            />
                            <input
                                type="date"
                                value={orderFilters.toDate}
                                onChange={(event) =>
                                    setOrderFilters((prev) => ({ ...prev, toDate: event.target.value }))
                                }
                                className="h-11 rounded-xl border border-[var(--glx-border)] px-4 text-sm outline-none focus:border-[var(--glx-blue)] focus:ring-2 focus:ring-[var(--glx-blue)]/15"
                            />
                            <select
                                value={orderFilters.status}
                                onChange={(event) =>
                                    setOrderFilters((prev) => ({
                                        ...prev,
                                        status: event.target.value as OrderStatus | "",
                                    }))
                                }
                                className="h-11 rounded-xl border border-[var(--glx-border)] px-4 text-sm outline-none focus:border-[var(--glx-blue)] focus:ring-2 focus:ring-[var(--glx-blue)]/15"
                            >
                                <option value="">Tất cả trạng thái</option>
                                {ORDER_STATUS_OPTIONS.map((status) => (
                                    <option key={status} value={status}>
                                        {formatOrderStatusLabel(status)}
                                    </option>
                                ))}
                            </select>
                            <button
                                type="button"
                                onClick={() => {
                                    const next = { ...orderFilters, page: 1 };
                                    setOrderFilters(next);
                                    void fetchOrderStatistics(next);
                                }}
                                disabled={orderLoading}
                                className="h-11 rounded-xl bg-[var(--glx-blue)] px-4 text-sm font-semibold text-white hover:bg-[var(--glx-blue-strong)] disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {orderLoading ? "Đang tải..." : "Áp dụng"}
                            </button>
                        </div>

                        <section className="rounded-2xl border border-[var(--glx-border)]">
                            <div className="flex flex-col gap-3 border-b border-[var(--glx-border)] px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                                <div>
                                    <h3 className="text-lg font-bold text-slate-800">Bảng thống kê đơn hàng</h3>
                                    <p className="text-xs text-slate-500">
                                        Tổng số đơn: <strong>{formatNumber(orderResult.totalItems)}</strong>
                                    </p>
                                </div>
                                <label className="flex items-center gap-2 text-sm text-slate-600">
                                    <span>Kích thước</span>
                                    <select
                                        value={orderFilters.size}
                                        onChange={(event) => {
                                            const next = {
                                                ...orderFilters,
                                                size: Number(event.target.value),
                                                page: 1,
                                            };
                                            setOrderFilters(next);
                                            void fetchOrderStatistics(next);
                                        }}
                                        className="rounded-md border border-[var(--glx-border)] px-2 py-1 text-sm"
                                    >
                                        {PAGE_SIZE_OPTIONS.map((size) => (
                                            <option key={`order-size-${size}`} value={size}>
                                                {size}
                                            </option>
                                        ))}
                                    </select>
                                </label>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-[var(--glx-border)] text-sm">
                                    <thead className="bg-slate-50 text-left">
                                        <tr>
                                            <th className="px-6 py-3 font-bold text-slate-600">ID đơn hàng</th>
                                            <th className="px-6 py-3 font-bold text-slate-600">Tên khách hàng</th>
                                            <th className="px-6 py-3 font-bold text-slate-600">Tên phim</th>
                                            <th className="px-6 py-3 font-bold text-slate-600">Suất chiếu</th>
                                            <th className="px-6 py-3 font-bold text-slate-600">Số lượng vé</th>
                                            <th className="px-6 py-3 text-right font-bold text-slate-600">
                                                Tổng tiền
                                            </th>
                                            <th className="px-6 py-3 font-bold text-slate-600">
                                                Trạng thái đơn hàng
                                            </th>
                                            <th className="px-6 py-3 font-bold text-slate-600">Ngày đặt hàng</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[var(--glx-border)] bg-white">
                                        {orderLoading ? (
                                            <tr>
                                                <td colSpan={8} className="px-6 py-10 text-center text-slate-500">
                                                    Đang tải dữ liệu...
                                                </td>
                                            </tr>
                                        ) : orderResult.items.length === 0 ? (
                                            <tr>
                                                <td colSpan={8} className="px-6 py-10 text-center text-slate-500">
                                                    Không có dữ liệu
                                                </td>
                                            </tr>
                                        ) : (
                                            orderResult.items.map((item: OrderStatisticItem) => (
                                                <tr key={item.orderId}>
                                                    <td className="px-6 py-4 font-semibold text-slate-700">
                                                        #{item.orderId}
                                                    </td>
                                                    <td className="px-6 py-4 text-slate-600">
                                                        {item.customerName || "Khách lẻ"}
                                                    </td>
                                                    <td className="px-6 py-4 text-slate-600">{item.movieName}</td>
                                                    <td className="px-6 py-4 text-slate-600">
                                                        {formatShowtimeCell(item.showDate, item.showTime)}
                                                    </td>
                                                    <td className="px-6 py-4 text-slate-600">
                                                        {formatNumber(item.ticketQuantity)}
                                                    </td>
                                                    <td className="px-6 py-4 text-right font-semibold text-[var(--glx-orange)]">
                                                        {formatCurrency(item.totalAmount)}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span
                                                            className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${resolveStatusBadge(item.status)}`}
                                                        >
                                                            {formatOrderStatusLabel(item.status)}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-slate-600">
                                                        {formatDateTimeCell(item.orderCreatedAt)}
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            <div className="border-t border-[var(--glx-border)] px-6 py-4 text-sm text-slate-600">
                                Tổng số tiền theo bộ lọc ({orderFilters.fromDate} - {orderFilters.toDate},{" "}
                                {orderFilters.status
                                    ? formatOrderStatusLabel(orderFilters.status)
                                    : "tất cả trạng thái"}
                                ): <strong className="text-[var(--glx-orange)]">{formatCurrency(orderResult.totalAmount)}</strong>
                            </div>

                            <Pagination
                                currentPage={orderFilters.page}
                                totalPages={Math.max(1, orderResult.totalPages)}
                                disabled={orderLoading}
                                onPageChange={(page) => {
                                    const next = { ...orderFilters, page };
                                    setOrderFilters(next);
                                    void fetchOrderStatistics(next);
                                }}
                            />
                        </section>
                    </div>
                )}
            </section>
        </div>
    );
};

export default Dashboard;

