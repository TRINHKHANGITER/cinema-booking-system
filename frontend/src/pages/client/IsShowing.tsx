import { useEffect, useMemo, useState } from "react";
import Location from "../../components/icon/location";
import CardHome from "../../components/ui/CardHome";
import { useAppDispatch, useAppSelector } from "../../stores/hooks";
import { fetchCinemasThunk } from "../../stores/slices/cinemaSlice";
import { fetchMoviesThunk } from "../../stores/slices/movieSlice";

const IsShowing = () => {
    const dispatch = useAppDispatch();
    const cinemas = useAppSelector((state) => state.cinema.cinemas);
    const movies = useAppSelector((state) => state.movie.movies);
    const [activeTab, setActiveTab] = useState(0);

    const movieStatus = useMemo(() => {
        if (activeTab === 1) return "INACTIVE" as const;
        return "ACTIVE" as const;
    }, [activeTab]);

    useEffect(() => {
        dispatch(fetchCinemasThunk({ isShowing: true, status: "ACTIVE" }));
    }, [dispatch]);

    useEffect(() => {
        const cinemaId = cinemas[0]?.cinemaId ?? 1;
        dispatch(
            fetchMoviesThunk({
                cinemaId,
                params: {
                    cinemaId,
                    status: movieStatus,
                    page: 1,
                    size: 50,
                },
            })
        );
    }, [cinemas, dispatch, movieStatus]);

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

                        <a
                            href=""
                            className="text-[#034ea2] cursor-pointer md:text-base sm:text-[12px] text-xs mb-1.25 flex items-center justify-center"
                        >
                            <Location />
                            <span className="inline-block ml-1">Toan quoc</span>
                        </a>
                    </div>

                    <div className="tabs__content">
                        <div>
                            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 xl:grid-cols-4 gap-6 mb-10">
                                {movies.map((movie) => (
                                    <CardHome key={movie.movieId} movie={movie} />
                                ))}
                            </div>
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
                                {movies.slice(0, 5).map((movie, index) => (
                                    <div key={movie.movieId}>
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
