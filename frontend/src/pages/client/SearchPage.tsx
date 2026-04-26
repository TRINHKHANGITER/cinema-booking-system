import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import CardShowtime from "../../components/ui/CardShowtime";
import { provinceService } from "../../services/province.service";
import { showTimeService } from "../../services/showtimeService";
import type { Province } from "../../types/province";
import type { FullShowtimeMovieResponse } from "../../types/showtime";
import { formatTime } from "../../utils/utils";

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
        const trimmedKeyword = keyword.trim();
        const hasProvince = Boolean(provinceId);
        const hasDay = Boolean(day);

        const effectiveDay = hasDay ? day : today;
        const releaseDateCondition = hasDay ? "EQ" : "GTE";

        setIsLoading(true);

        try {
            const response = await showTimeService.getGroupedShowTimesByFilters({
                movieName: trimmedKeyword || undefined,
                provinceId: hasProvince ? Number(provinceId) : undefined,
                releaseDate: effectiveDay,
                releaseDateCondition,
                status: "SELLING",
                page: 1,
                size: 200,
                sortBy: "showtime",
                direction: "ASC",
            });

            if (response.code !== "SUCCESS") {
                setResults([]);
                return;
            }

            setResults(response.result?.items ?? []);
        } catch {
            setResults([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        void fetchResults();
        // Initial load only.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

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
        if (!day && provinceId) {
            return `Dang ap dung: khu vuc da chon, ngay >= ${today}`;
        }

        if (day && !provinceId) {
            return `Dang ap dung: ngay ${day}, tat ca khu vuc`;
        }

        if (day && provinceId) {
            return "Dang ap dung: khu vuc + ngay cu the";
        }

        return `Dang ap dung: tat ca khu vuc, ngay >= ${today}`;
    }, [day, provinceId, today]);

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        void fetchResults();
    };

    return (
        <div>
            <main className="home-main min-h[100vh]">
                <div className="pb-12 pt-6 my-0 mx-auto xl:max-w-screen-xl lg:max-w-4xl md:max-w-4xl md:px-4 sm:px-[45px] px-[16px]">
                    <div className="flex w-full md:justify-start justify-between gap-5 items-center mb-8">
                        <div className="hidden md:block">
                            <span className="border-l-4 border-solid border-[#034ea2] mr-2"></span>
                            <h1 className="mr-10 text-xl font-bold not-italic uppercase inline">
                                Tim Suat Chieu
                            </h1>
                        </div>
                        <h1 className="md:hidden text-base font-bold uppercase">Tim Suat Chieu</h1>
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
                                    Khu vuc
                                </label>
                                <select
                                    value={provinceId}
                                    onChange={(event) => setProvinceId(event.target.value)}
                                    className="w-full h-10 border border-[#D0D0D0] rounded px-3 outline-none focus:border-[#034EA2]"
                                >
                                    <option value="">Tat ca</option>
                                    {provinces.map((province) => (
                                        <option key={province.provinceId} value={province.provinceId}>
                                            {province.provinceName}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-semibold text-[#333333] mb-1">
                                    Ngay chieu
                                </label>
                                <input
                                    type="date"
                                    value={day}
                                    onChange={(event) => setDay(event.target.value)}
                                    className="w-full h-10 border border-[#D0D0D0] rounded px-3 outline-none focus:border-[#034EA2]"
                                />
                            </div>

                            <div className="md:col-span-1 md:self-end">
                                <button
                                    type="submit"
                                    className="h-10 w-full text-white bg-[#f26b38] hover:bg-[#fb9440] rounded transition-all duration-300"
                                >
                                    Tim
                                </button>
                            </div>
                        </div>
                    </form>

                    <p className="text-sm text-gray-500 mb-4">{filterMessage}</p>

                    <div className="space-y-4">
                        {isLoading ? (
                            <p className="text-sm text-gray-500">Dang tai ket qua...</p>
                        ) : sortedResults.length === 0 ? (
                            <p className="text-sm text-gray-500">Khong co suat chieu phu hop.</p>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 xl:grid-cols-4 gap-6 mb-10">
                                {sortedResults.map((item) => {
                                    const earliestShowTime = resolveEarliestShowTime(item);

                                    return (
                                        <div key={item.movie.movieId}>
                                            <CardShowtime movie={item.movie} />
                                            {earliestShowTime && (
                                                <p className="mt-2 text-xs text-gray-500">
                                                    Suat gan nhat: {normalizeDate(earliestShowTime.releaseDate)} |{" "}
                                                    {formatTime(earliestShowTime.startTime)}
                                                </p>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                <div className="line-default"></div>
            </main>
        </div>
    );
};

export default SearchPage;
