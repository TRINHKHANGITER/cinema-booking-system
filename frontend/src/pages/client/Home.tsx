import { useEffect, useMemo, useState } from "react";
import ArrowRight from "../../components/icon/arrowRight";
import Location from "../../components/icon/location";
import CardShowtime from "../../components/ui/CardShowtime";
import HeroSlider from "../../layouts/carousel";
import { showTimeService } from "../../services/showtimeService";
import { useAppDispatch, useAppSelector } from "../../stores/hooks";
import { fetchProvincesThunk } from "../../stores/slices/provinceSlice";
import type { FullShowtimeMovieResponse } from "../../types/showtime";
import { Link } from "react-router-dom";

const getTodayAsLocalDate = () => {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
};

const Home = () => {
    const dispatch = useAppDispatch();
    const provinces = useAppSelector((state) => state.province.provinces);
    const [activeTab, setActiveTab] = useState(0);
    const [selectedProvinceId, setSelectedProvinceId] = useState<number | undefined>(undefined);
    const [movieShowtimeGroups, setMovieShowtimeGroups] =
        useState<FullShowtimeMovieResponse[]>([]);
    const [isLoadingMovies, setIsLoadingMovies] = useState(false);

    useEffect(() => {
        dispatch(fetchProvincesThunk("ACTIVE"));
    }, [dispatch]);

    useEffect(() => {
        let isMounted = true;

        const fetchShowtimesByTab = async () => {
            try {
                setIsLoadingMovies(true);

                const filters = {
                    provinceId: selectedProvinceId,
                    status: "SELLING",
                    page: 1,
                    size: 200,
                    sortBy: "startTime",
                    direction: "ASC",
                } as const;
                const releaseDate = getTodayAsLocalDate();

                const response =
                    activeTab === 1
                        ? await showTimeService.getUpcomingGroupedShowTimesByProvince(
                              releaseDate,
                              filters
                          )
                        : await showTimeService.getTodayGroupedShowTimesByProvince(
                              releaseDate,
                              filters
                          );

                if (!isMounted) return;
                if (response.code !== "SUCCESS") {
                    setMovieShowtimeGroups([]);
                    return;
                }

                setMovieShowtimeGroups(response.result?.items ?? []);
            } catch {
                if (!isMounted) return;
                setMovieShowtimeGroups([]);
            } finally {
                if (isMounted) {
                    setIsLoadingMovies(false);
                }
            }
        };

        void fetchShowtimesByTab();

        return () => {
            isMounted = false;
        };
    }, [activeTab, selectedProvinceId]);

    const displayedMovies = useMemo(
        () => movieShowtimeGroups.map((item) => item.movie).slice(0, 8),
        [movieShowtimeGroups]
    );
    const emptyMessage =
        activeTab === 1
            ? "Chưa có phim sắp chiếu theo suất chiếu."
            : "Chưa có phim theo suất chiếu hôm nay.";

    return (
        <div>
            <main className="home-main min-h[100vh]">
                <HeroSlider />

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
                                                Đang chiếu
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
                                                Sắp chiếu
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
                                                {/* Phim IMAX */}
                                            </a>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        <a className="text-[#034ea2] cursor-pointer md:text-base sm:text-[12px] text-xs mb-1.25 flex items-center justify-center">
                            <Location />
                            <select
                                name="provinceId"
                                id="provinceId"
                                value={selectedProvinceId ?? ""}
                                onChange={(event) => {
                                    const value = event.target.value;
                                    setSelectedProvinceId(value ? Number(value) : undefined);
                                }}
                            >
                                <option value="">Toàn quốc</option>
                                {provinces.map((province) => (
                                    <option key={province.provinceId} value={province.provinceId}>
                                        {province.provinceName}
                                    </option>
                                ))}
                            </select>
                        </a>
                    </div>

                    <div className="tabs__content">
                        <div>
                            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 xl:grid-cols-4 gap-6 mb-10">
                                {isLoadingMovies ? (
                                    <p className="col-span-full text-sm text-gray-500">Đang tải phim...</p>
                                ) : displayedMovies.length > 0 ? (
                                    displayedMovies.map((movie) => (
                                        <CardShowtime key={movie.movieId} movie={movie} />
                                    ))
                                ) : (
                                    <p className="col-span-full text-sm text-gray-500">{emptyMessage}</p>
                                )}
                            </div>

                            <div className="film__footer text-center transition-all duration-300">
                                <Link
                                    to="/phim-dang-chieu"
                                    className="text-[#f26b38] hover:text-white w-40 border border-[#fb9440] hover:bg-[#fb9440] transition-all duration-300 focus:ring-1 focus:outline-none focus:ring-[#fb9440] rounded text-sm px-5 py-2.5 text-center inline-flex items-center dark:hover:bg-[#fb9440] dark:focus:ring-[#fb9440] mr-2 mb-2 justify-center"
                                >
                                    Xem thêm
                                    <ArrowRight />
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="line-default"></div>
            </main>
        </div>
    );
};

export default Home;
