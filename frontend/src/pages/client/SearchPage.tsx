import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { useSearchParams } from "react-router-dom";
import CardShowtime from "../../components/ui/CardShowtime";
import { movieTypeService } from "../../services/movieType.service";
import { provinceService } from "../../services/province.service";
import { showTimeService } from "../../services/showtimeService";
import type { MovieTypeResponse } from "../../types/movie-type";
import type { Province } from "../../types/province";
import type { FullShowtimeMovieResponse } from "../../types/showtime";
import { formatTime } from "../../utils/utils";

type SearchFilters = {
    keyword: string;
    provinceId: string;
    movieTypeId: string;
    day: string;
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

const normalizeDate = (value?: string | null) => {
    if (!value) return "";
    return value.length >= 10 ? value.slice(0, 10) : value;
};

const normalizeIdParam = (value: string | null) => {
    if (!value) return "";
    const trimmedValue = value.trim();
    return /^\d+$/.test(trimmedValue) ? trimmedValue : "";
};

const normalizeKeywordParam = (value: string | null) => value?.trim() ?? "";

const normalizeDayParam = (value: string | null) => {
    if (!value) return "";
    const trimmedValue = value.trim();
    return /^\d{4}-\d{2}-\d{2}$/.test(trimmedValue) ? trimmedValue : "";
};

const buildSearchParams = (filters: SearchFilters) => {
    const params = new URLSearchParams();
    if (filters.keyword) {
        params.set("keyword", filters.keyword);
    }
    if (filters.provinceId) {
        params.set("provinceId", filters.provinceId);
    }
    if (filters.movieTypeId) {
        params.set("movieTypeId", filters.movieTypeId);
    }
    if (filters.day) {
        params.set("day", filters.day);
    }
    return params;
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
    const [searchParams, setSearchParams] = useSearchParams();
    const keywordFromQuery = normalizeKeywordParam(searchParams.get("keyword"));
    const provinceIdFromQuery = normalizeIdParam(searchParams.get("provinceId"));
    const movieTypeIdFromQuery = normalizeIdParam(searchParams.get("movieTypeId"));
    const dayFromQuery = normalizeDayParam(searchParams.get("day"));

    const [keyword, setKeyword] = useState(keywordFromQuery);
    const [provinceId, setProvinceId] = useState<string>(provinceIdFromQuery);
    const [movieTypeId, setMovieTypeId] = useState<string>(movieTypeIdFromQuery);
    const [day, setDay] = useState(dayFromQuery);

    const [provinces, setProvinces] = useState<Province[]>([]);
    const [movieTypes, setMovieTypes] = useState<MovieTypeResponse[]>([]);
    const [results, setResults] = useState<FullShowtimeMovieResponse[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [appliedFilters, setAppliedFilters] = useState<SearchFilters>({
        keyword: keywordFromQuery,
        provinceId: provinceIdFromQuery,
        movieTypeId: movieTypeIdFromQuery,
        day: dayFromQuery,
    });

    const today = useMemo(() => getTodayAsLocalDate(), []);

    useEffect(() => {
        setKeyword((currentValue) =>
            currentValue === keywordFromQuery ? currentValue : keywordFromQuery
        );
        setProvinceId((currentValue) =>
            currentValue === provinceIdFromQuery ? currentValue : provinceIdFromQuery
        );
        setMovieTypeId((currentValue) =>
            currentValue === movieTypeIdFromQuery ? currentValue : movieTypeIdFromQuery
        );
        setDay((currentValue) => (currentValue === dayFromQuery ? currentValue : dayFromQuery));

        setCurrentPage(1);
        setAppliedFilters((currentFilters) => {
            if (
                currentFilters.keyword === keywordFromQuery &&
                currentFilters.provinceId === provinceIdFromQuery &&
                currentFilters.movieTypeId === movieTypeIdFromQuery &&
                currentFilters.day === dayFromQuery
            ) {
                return currentFilters;
            }

            return {
                keyword: keywordFromQuery,
                provinceId: provinceIdFromQuery,
                movieTypeId: movieTypeIdFromQuery,
                day: dayFromQuery,
            };
        });
    }, [dayFromQuery, keywordFromQuery, movieTypeIdFromQuery, provinceIdFromQuery]);

    useEffect(() => {
        let isUnmounted = false;

        const fetchFilterOptions = async () => {
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

            const fetchMovieTypeOptions = async () => {
                try {
                    const response = await movieTypeService.getMovieTypeItemList("ACTIVE");
                    if (isUnmounted) return;

                    if (response.code === "SUCCESS") {
                        setMovieTypes(response.result?.items ?? []);
                        return;
                    }

                    setMovieTypes([]);
                } catch {
                    if (!isUnmounted) {
                        setMovieTypes([]);
                    }
                }
            };

            await Promise.all([fetchProvinceOptions(), fetchMovieTypeOptions()]);
        };

        void fetchFilterOptions();

        return () => {
            isUnmounted = true;
        };
    }, []);

    const fetchResults = async () => {
        const trimmedKeyword = appliedFilters.keyword.trim();
        const hasProvince = Boolean(appliedFilters.provinceId);
        const hasMovieType = Boolean(appliedFilters.movieTypeId);
        const safeDay =
            appliedFilters.day && appliedFilters.day >= today ? appliedFilters.day : "";
        const hasDay = Boolean(safeDay);

        const effectiveDay = hasDay ? safeDay : today;
        const startTimeFilter = effectiveDay === today ? getCurrentLocalTime() : undefined;

        setIsLoading(true);

        try {
            const response = await showTimeService.getGroupedShowTimesByFilters({
                movieName: trimmedKeyword || undefined,
                provinceId: hasProvince ? Number(appliedFilters.provinceId) : undefined,
                movieTypeId: hasMovieType ? Number(appliedFilters.movieTypeId) : undefined,
                releaseFromDate: effectiveDay,
                releaseToDate: hasDay ? effectiveDay : undefined,
                startTime: startTimeFilter,
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

    const selectedProvinceName = useMemo(() => {
        if (!appliedFilters.provinceId) return null;

        return (
            provinces.find((province) => String(province.provinceId) === appliedFilters.provinceId)
                ?.provinceName ?? null
        );
    }, [appliedFilters.provinceId, provinces]);

    const selectedMovieTypeName = useMemo(() => {
        if (!appliedFilters.movieTypeId) return null;

        return (
            movieTypes.find((type) => String(type.movieTypeId) === appliedFilters.movieTypeId)
                ?.movieTypeName ?? null
        );
    }, [appliedFilters.movieTypeId, movieTypes]);

    const filterMessage = useMemo(() => {
        const provinceLabel = selectedProvinceName
            ? `Khu vực: ${selectedProvinceName}`
            : "Khu vực: Tất cả";
        const movieTypeLabel = selectedMovieTypeName
            ? `Thể loại: ${selectedMovieTypeName}`
            : "Thể loại: Tất cả";
        const dayLabel = appliedFilters.day
            ? `Ngày chiếu: ${appliedFilters.day}`
            : `Ngày chiếu từ: ${today}`;

        return `Đang áp dụng: ${provinceLabel}, ${movieTypeLabel}, ${dayLabel}`;
    }, [appliedFilters.day, selectedProvinceName, selectedMovieTypeName, today]);

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
        const normalizedFilters: SearchFilters = {
            keyword: keyword.trim(),
            provinceId,
            movieTypeId,
            day: normalizedDay,
        };

        setKeyword(normalizedFilters.keyword);
        setDay(normalizedDay);
        setCurrentPage(1);
        setAppliedFilters(normalizedFilters);
        setSearchParams(buildSearchParams(normalizedFilters));
    };

    return (
        <div>
            <main className="home-main min-h-[100vh]">
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
                            <div className="md:col-span-4">
                                <label className="block text-sm font-semibold text-[#333333] mb-1">
                                    Tên phim
                                </label>
                                <input
                                    type="text"
                                    value={keyword}
                                    onChange={(event) => setKeyword(event.target.value)}
                                    placeholder="Nhập tên phim"
                                    className="w-full h-10 border border-[#D0D0D0] rounded px-3 outline-none focus:border-[#034EA2]"
                                />
                            </div>

                            <div className="md:col-span-2">
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

                            <div className="md:col-span-3">
                                <label className="block text-sm font-semibold text-[#333333] mb-1">
                                    Thể loại phim
                                </label>
                                <select
                                    value={movieTypeId}
                                    onChange={(event) => setMovieTypeId(event.target.value)}
                                    className="w-full h-10 border border-[#D0D0D0] rounded px-3 outline-none focus:border-[#034EA2]"
                                >
                                    <option value="">Tất cả thể loại</option>
                                    {movieTypes.map((movieType) => (
                                        <option key={movieType.movieTypeId} value={movieType.movieTypeId}>
                                            {movieType.movieTypeName}
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
                        <span className="text-xs text-gray-500">Tổng: {totalItems}</span>
                        <label className="flex items-center gap-2 text-xs text-gray-500">
                            <span>Mỗi trang</span>
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
                            Trước
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
