import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import CardShowtime from "../../components/ui/CardShowtime";
import { provinceService } from "../../services/province.service";
import { showTimeService } from "../../services/showtimeService";
import type { Province } from "../../types/province";
import type { FullShowtimeMovieResponse } from "../../types/showtime";
import { formatTime } from "../../utils/utils";

type SearchFilters = {
    keyword: string;
    provinceId: string;
    day: string;
};

const getTodayAsLocalDate = () => {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
};

const normalizeDate = (value?: string | null) => {
    if (!value) return "";
    return value.length >= 10 ? value.slice(0, 10) : value;
};

const resolveEarliestShowTime = (item: FullShowtimeMovieResponse) => {
    if (!item.showTimes || item.showTimes.length === 0) {
        return null;
    }

    return [...item.showTimes].sort((first, second) => {
        const firstDate = normalizeDate(first.releaseDate);
        const secondDate = normalizeDate(second.releaseDate);

        if (firstDate !== secondDate) {
            return firstDate.localeCompare(secondDate);
        }

        return first.startTime.localeCompare(second.startTime);
    })[0];
};

const SearchPage = () => {
    const [keyword, setKeyword] = useState("");
    const [provinceId, setProvinceId] = useState<string>("");
    const [day, setDay] = useState("");

    const [provinces, setProvinces] = useState<Province[]>([]);
    const [results, setResults] = useState<FullShowtimeMovieResponse[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [appliedFilters, setAppliedFilters] = useState<SearchFilters>({
        keyword: "",
        provinceId: "",
        day: "",
    });

    const today = useMemo(() => getTodayAsLocalDate(), []);

    useEffect(() => {
        let isUnmounted = false;

        const fetchProvinceOptions = async () => {
            try {
                const response = await provinceService.getProvinceItemList("ACTIVE");
                if (isUnmounted) return;

                if (response.code === "SUCCESS") {
                    setProvinces(response.result?.items ?? []);
                    return;
                }

                const fallback = await provinceService.getProvinces("ACTIVE");
                if (isUnmounted) return;

                if (fallback.code === "SUCCESS") {
                    setProvinces(fallback.result ?? []);
                    return;
                }

                setProvinces([]);
            } catch {
                if (!isUnmounted) {
                    setProvinces([]);
                }
            }
        };

        void fetchProvinceOptions();

        return () => {
            isUnmounted = true;
        };
    }, []);

    const fetchResults = async () => {
        const trimmedKeyword = appliedFilters.keyword.trim();
        const hasProvince = Boolean(appliedFilters.provinceId);
        const safeDay =
            appliedFilters.day && appliedFilters.day >= today ? appliedFilters.day : "";
        const hasDay = Boolean(safeDay);

        const effectiveDay = hasDay ? safeDay : today;
        const releaseDateCondition = hasDay ? "EQ" : "GTE";

        setIsLoading(true);

        try {
            const response = await showTimeService.getGroupedShowTimesByFilters({
                movieName: trimmedKeyword || undefined,
                provinceId: hasProvince ? Number(appliedFilters.provinceId) : undefined,
                releaseDate: effectiveDay,
                releaseDateCondition,
                status: "SELLING",
                page: currentPage,
                size: pageSize,
                sortBy: "showtime",
                direction: "ASC",
            });

            if (response.code !== "SUCCESS") {
                setResults([]);
                setTotalPages(1);
                setTotalItems(0);
                return;
            }

            setResults(response.result?.items ?? []);
            setTotalPages(Math.max(1, response.result?.totalPages ?? 1));
            setTotalItems(response.result?.totalItems ?? 0);
        } catch {
            setResults([]);
            setTotalPages(1);
            setTotalItems(0);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        void fetchResults();
    }, [appliedFilters, currentPage, pageSize]);

    const sortedResults = useMemo(() => {
        return [...results].sort((first, second) => {
            const firstShowTime = resolveEarliestShowTime(first);
            const secondShowTime = resolveEarliestShowTime(second);

            if (!firstShowTime && !secondShowTime) return 0;
            if (!firstShowTime) return 1;
            if (!secondShowTime) return -1;

            const firstDate = normalizeDate(firstShowTime.releaseDate);
            const secondDate = normalizeDate(secondShowTime.releaseDate);

            if (firstDate !== secondDate) {
                return firstDate.localeCompare(secondDate);
            }

            return firstShowTime.startTime.localeCompare(secondShowTime.startTime);
        });
    }, [results]);

    const filterMessage = useMemo(() => {
        if (!appliedFilters.day && appliedFilters.provinceId) {
            return `Đang áp dụng: khu vực đã chọn, ngày >= ${today}`;
        }

        if (appliedFilters.day && !appliedFilters.provinceId) {
            return `Đang áp dụng: ngày ${appliedFilters.day}, tất cả khu vực`;
        }

        if (appliedFilters.day && appliedFilters.provinceId) {
            return "Đang áp dụng: khu vực + ngày cụ thể";
        }

        return `Đang áp dụng: tất cả khu vực, ngày >= ${today}`;
    }, [appliedFilters, today]);

    const visiblePageButtons = useMemo(() => {
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
    }, [currentPage, totalPages]);

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const normalizedDay = day && day < today ? today : day;
        setDay(normalizedDay);
        setCurrentPage(1);
        setAppliedFilters({
            keyword,
            provinceId,
            day: normalizedDay,
        });
    };

    return (
        <div>
            <main className="home-main min-h[100vh]">
                <div className="pb-12 pt-6 my-0 mx-auto xl:max-w-screen-xl lg:max-w-4xl md:max-w-4xl md:px-4 sm:px-[45px] px-[16px]">
                    <div className="flex w-full md:justify-start justify-between gap-5 items-center mb-8">
                        <div className="hidden md:block">
                            <span className="border-l-4 border-solid border-[#034ea2] mr-2"></span>
                            <h1 className="mr-10 text-xl font-bold not-italic uppercase inline">
                                Tìm Suất Chiếu
                            </h1>
                        </div>
                        <h1 className="md:hidden text-base font-bold uppercase">Tìm Suất Chiếu</h1>
                    </div>

                    <form
                        className="w-full bg-white border border-gray-200 rounded-lg p-4 mb-4"
                        onSubmit={handleSubmit}
                    >
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                            <div className="md:col-span-6">
                                <label className="block text-sm font-semibold text-[#333333] mb-1">
                                    Ten phim
                                </label>
                                <input
                                    type="text"
                                    value={keyword}
                                    onChange={(event) => setKeyword(event.target.value)}
                                    placeholder="Nhap ten phim"
                                    className="w-full h-10 border border-[#D0D0D0] rounded px-3 outline-none focus:border-[#034EA2]"
                                />
                            </div>

                            <div className="md:col-span-3">
                                <label className="block text-sm font-semibold text-[#333333] mb-1">
                                    Khu vực
                                </label>
                                <select
                                    value={provinceId}
                                    onChange={(event) => setProvinceId(event.target.value)}
                                    className="w-full h-10 border border-[#D0D0D0] rounded px-3 outline-none focus:border-[#034EA2]"
                                >
                                    <option value="">Tất cả</option>
                                    {provinces.map((province) => (
                                        <option key={province.provinceId} value={province.provinceId}>
                                            {province.provinceName}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-semibold text-[#333333] mb-1">
                                    Ngày chiếu
                                </label>
                                <input
                                    type="date"
                                    value={day}
                                    min={today}
                                    onChange={(event) => {
                                        const nextDay = event.target.value;
                                        setDay(nextDay && nextDay < today ? today : nextDay);
                                    }}
                                    className="w-full h-10 border border-[#D0D0D0] rounded px-3 outline-none focus:border-[#034EA2]"
                                />
                            </div>

                            <div className="md:col-span-1 md:self-end">
                                <button
                                    type="submit"
                                    className="h-10 w-full text-white bg-[#f26b38] hover:bg-[#fb9440] rounded transition-all duration-300"
                                >
                                    Tìm
                                </button>
                            </div>
                        </div>
                    </form>

                    <p className="text-sm text-gray-500 mb-4">{filterMessage}</p>
                    <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                        <span className="text-xs text-gray-500">Tong: {totalItems}</span>
                        <label className="flex items-center gap-2 text-xs text-gray-500">
                            <span>Moi trang</span>
                            <select
                                value={pageSize}
                                onChange={(event) => {
                                    const nextSize = Number(event.target.value);
                                    setPageSize(nextSize);
                                    setCurrentPage(1);
                                }}
                                className="h-8 border border-[#D0D0D0] rounded px-2 outline-none focus:border-[#034EA2]"
                            >
                                {[1, 3, 5, 10, 20].map((size) => (
                                    <option key={size} value={size}>
                                        {size}
                                    </option>
                                ))}
                            </select>
                        </label>
                    </div>

                    <div className="space-y-4">
                        {isLoading ? (
                            <p className="text-sm text-gray-500">Đang tải kết quả...</p>
                        ) : sortedResults.length === 0 ? (
                            <p className="text-sm text-gray-500">Không có suất chiếu phù hợp.</p>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 xl:grid-cols-4 gap-6 mb-10">
                                {sortedResults.map((item) => {
                                    const earliestShowTime = resolveEarliestShowTime(item);

                                    return (
                                        <div key={item.movie.movieId}>
                                            <CardShowtime movie={item.movie} />
                                            {earliestShowTime && (
                                                <p className="mt-2 text-xs text-gray-500">
                                                    Suất gần nhất: {normalizeDate(earliestShowTime.releaseDate)} |{" "}
                                                    {formatTime(earliestShowTime.startTime)}
                                                </p>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    <div className="mb-10 flex flex-wrap items-center justify-center gap-2">
                        <button
                            type="button"
                            className="px-3 py-1.5 border rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                            disabled={currentPage === 1 || isLoading}
                        >
                            Truoc
                        </button>

                        {visiblePageButtons.map((page) => (
                            <button
                                key={page}
                                type="button"
                                className={`px-3 py-1.5 border rounded text-sm ${
                                    currentPage === page
                                        ? "bg-[#034ea2] text-white border-[#034ea2]"
                                        : "bg-white text-[#333333]"
                                }`}
                                onClick={() => setCurrentPage(page)}
                                disabled={isLoading}
                            >
                                {page}
                            </button>
                        ))}

                        <button
                            type="button"
                            className="px-3 py-1.5 border rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                            disabled={currentPage === totalPages || isLoading}
                        >
                            Sau
                        </button>
                    </div>
                </div>

                <div className="line-default"></div>
            </main>
        </div>
    );
};

export default SearchPage;
