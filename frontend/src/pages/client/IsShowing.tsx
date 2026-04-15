import { useEffect, useMemo, useState } from "react";
import Location from "../../components/icon/location";
import CardHome from "../../components/ui/CardHome";
import { showTimeService } from "../../services/showtimeService";
import { useAppDispatch, useAppSelector } from "../../stores/hooks";
import { fetchProvincesThunk } from "../../stores/slices/provinceSlice";
import type { Movie } from "../../types/product";

const PAGE_SIZE = 2;

const getTodayAsLocalDate = () => {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
};

const IsShowing = () => {
    const dispatch = useAppDispatch();
    const provinces = useAppSelector((state) => state.province.provinces);
    const [activeTab, setActiveTab] = useState(0);
    const [selectedProvinceId, setSelectedProvinceId] = useState<number | undefined>(undefined);
    const [moviesFromShowtimes, setMoviesFromShowtimes] = useState<Movie[]>([]);
    const [isLoadingMovies, setIsLoadingMovies] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        dispatch(fetchProvincesThunk("ACTIVE"));
    }, [dispatch]);

    useEffect(() => {
        let isMounted = true;

        const fetchTodayShowtimes = async () => {
            try {
                setIsLoadingMovies(true);

                const response = await showTimeService.getTodayShowTimesByProvince(getTodayAsLocalDate(), {
                    provinceId: selectedProvinceId,
                    status: "SCHEDULED",
                    page: currentPage,
                    size: PAGE_SIZE,
                    sortBy: "startTime",
                    direction: "ASC",
                });

                if (!isMounted) return;
                if (response.code !== "SUCCESS") {
                    setMoviesFromShowtimes([]);
                    setTotalPages(1);
                    return;
                }

                const items = response.result?.items ?? [];
                setMoviesFromShowtimes(items);
                setTotalPages(response.result?.totalPages ?? 1);
            } catch {
                if (!isMounted) return;
                setMoviesFromShowtimes([]);
                setTotalPages(1);
            } finally {
                if (isMounted) {
                    setIsLoadingMovies(false);
                }
            }
        };

        fetchTodayShowtimes();

        return () => {
            isMounted = false;
        };
    }, [currentPage, selectedProvinceId]);

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

    return (
        <div>
            <main className="home-main min-h[100vh]">
                <div className="pb-12 pt-6 my-0 mx-auto xl:max-w-screen-xl lg:max-w-4xl md:max-w-4xl md:px-4 sm:px-[45px] px-[16px]">
                    <div className="flex w-full md:justify-start justify-between gap-5 items-center mb-10">
                        <div className="flex">
                            <div className="hidden md:block">
                                <span className="border-l-4 border-solid border-[#034ea2] mr-2"></span>
                                <h1 className="mr-10 text-xl font-bold not-italic uppercase inline">Phim</h1>
                            </div>

                            <div className="flex flex-wrap">
                                <div className="w-full">
                                    <ul className="flex mb-0 list-none flex-wrap flex-row">
                                        <li
                                            onClick={() => setActiveTab(0)}
                                            className="-mb-px mr-3 md:mr-8 text-[#333333] last:mr-0 flex-auto text-center hover:text-[#034EA2] transition-all duration-300 ease-in-out cursor-pointer relative"
                                        >
                                            <a
                                                className={`md:text-base sm:text-sm text-[12px] font-bold not-italic block leading-normal transition-all duration-300 ease-in-out cursor-pointer relative ${
                                                    activeTab === 0
                                                        ? "text-[rgb(3,78,162)] tab__active opacity-100"
                                                        : "text-black-10 opacity-50"
                                                }`}
                                            >
                                                Dang chieu
                                            </a>
                                        </li>

                                        <li
                                            onClick={() => setActiveTab(1)}
                                            className="-mb-px mr-3 md:mr-8 text-[#333333] last:mr-0 flex-auto text-center hover:text-[#034EA2] transition-all duration-300 ease-in-out cursor-pointer relative"
                                        >
                                            <a
                                                className={`md:text-base sm:text-sm text-[12px] font-bold not-italic block leading-normal transition-all duration-300 ease-in-out cursor-pointer relative ${
                                                    activeTab === 1
                                                        ? "text-[rgb(3,78,162)] tab__active opacity-100"
                                                        : "text-black-10 opacity-50"
                                                }`}
                                            >
                                                Sap chieu
                                            </a>
                                        </li>

                                        <li
                                            onClick={() => setActiveTab(2)}
                                            className="-mb-px mr-2 text-[#333333] last:mr-0 flex-auto text-center hover:text-[#034EA2] transition-all duration-300 ease-in-out cursor-pointer relative"
                                        >
                                            <a
                                                className={`md:text-base sm:text-sm text-[12px] font-bold not-italic block leading-normal transition-all duration-300 ease-in-out cursor-pointer relative ${
                                                    activeTab === 2
                                                        ? "text-[rgb(3,78,162)] tab__active opacity-100"
                                                        : "text-black-10 opacity-50"
                                                }`}
                                            >
                                                Phim IMAX
                                            </a>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        <div className="text-[#034ea2] cursor-pointer md:text-base sm:text-[12px] text-xs mb-1.25 flex items-center justify-center">
                            <Location />
                            <select
                                name="provinceId"
                                id="provinceId"
                                value={selectedProvinceId ?? ""}
                                onChange={(event) => {
                                    const value = event.target.value;
                                    setSelectedProvinceId(value ? Number(value) : undefined);
                                    setCurrentPage(1);
                                }}
                            >
                                <option value="">Toan quoc</option>
                                {provinces.map((province) => (
                                    <option key={province.provinceId} value={province.provinceId}>
                                        {province.provinceName}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="tabs__content">
                        <div>
                            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 xl:grid-cols-4 gap-6 mb-10">
                                {isLoadingMovies ? (
                                    <p className="col-span-full text-sm text-gray-500">
                                        Dang tai phim...
                                    </p>
                                ) : moviesFromShowtimes.length > 0 ? (
                                    moviesFromShowtimes.map((movie, index) => (
                                        <CardHome key={`${movie.movieId}-${index}`} movie={movie} />
                                    ))
                                ) : (
                                    <p className="col-span-full text-sm text-gray-500">
                                        Chua co phim theo suat chieu hom nay.
                                    </p>
                                )}
                            </div>

                            {totalPages > 0 && (
                                <div className="mb-10 flex items-center justify-center gap-2">
                                    <button
                                        type="button"
                                        className="px-3 py-1.5 border rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                        onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                                        disabled={currentPage === 1 || isLoadingMovies}
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
                                            disabled={isLoadingMovies}
                                        >
                                            {page}
                                        </button>
                                    ))}

                                    <button
                                        type="button"
                                        className="px-3 py-1.5 border rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                        onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                                        disabled={currentPage === totalPages || isLoadingMovies}
                                    >
                                        Sau
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="seo__description">
                    <div className="pb-12 pt-6 my-0 mx-auto xl:max-w-screen-xl lg:max-w-4xl md:max-w-4xl md:px-4 sm:px-[45px] px-[16px]">
                        <div className="mb-8">
                            <span className="border-l-4 border-solid border-[rgb(3,78,162)] mr-2"></span>
                            <h1 className="md:mb-4 text-xl inline-block uppercase font-medium">Phim Dang Chieu</h1>
                        </div>

                        <div className="leading-5 content__data__full">
                            <div className="text-sm">
                                {moviesFromShowtimes.slice(0, 5).map((movie, index) => (
                                    <div key={`${movie.movieId}-${index}-seo`}>
                                        <p style={{ marginBottom: "11px" }}>
                                            <a href="">
                                                <strong>
                                                    <span
                                                        className="text-[#485fc7]"
                                                        style={{
                                                            fontSize: "14px",
                                                            lineHeight: "107%",
                                                            background: "white",
                                                            letterSpacing: ".15pt",
                                                        }}
                                                    >
                                                        {`${index + 1}. ${movie.movieName} - ${movie.movieType?.movieTypeName}`}
                                                    </span>
                                                </strong>
                                            </a>
                                        </p>

                                        <p style={{ marginBottom: "11px" }} className="text-[#4a4a4a]">
                                            <a href="" className="text-[#485fc7]">
                                                <strong>
                                                    <span
                                                        style={{
                                                            fontSize: "14px",
                                                            lineHeight: "107%",
                                                            background: "white",
                                                            letterSpacing: ".15pt",
                                                        }}
                                                    >
                                                        {movie.movieName}
                                                    </span>
                                                </strong>
                                            </a>{" "}
                                            <span
                                                className="text-[#4a4a4a]"
                                                style={{
                                                    fontSize: "14px",
                                                    fontFamily: "Arial,Helvetica,sans-serif",
                                                    lineHeight: "107%",
                                                    background: "white",
                                                    letterSpacing: ".15pt",
                                                }}
                                            >
                                                {movie.description || "Chua co mo ta"}
                                            </span>
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="line-default"></div>
            </main>
        </div>
    );
};

export default IsShowing;
