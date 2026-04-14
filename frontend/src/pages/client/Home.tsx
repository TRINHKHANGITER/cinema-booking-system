import React, { useEffect, useState } from "react";

import HeroSlider from "../../layouts/carousel";
import Location from "../../components/icon/location";

import CardHome from "../../components/ui/CardHome";
import ArrowRight from "../../components/icon/arrowRight";
import useMovieStore from "../../stores/slices/movieSlice";

const Home = () => {
    const [activeTab, setActiveTab] = useState(0);
    const { movies, fetchMovies } = useMovieStore();

    useEffect(() => {
        fetchMovies();
    }, []);
    return (
        <div>
            <main className="home-main min-h[100vh]">
                <HeroSlider />
                {/* main content */}
                <div className="pb-12 pt-6 my-0 mx-auto xl:max-w-screen-xl lg:max-w-4xl md:max-w-4xl md:px-4 sm:px-[45px] px-[16px]">
                    {/* top */}
                    <div className="flex w-full md:justify-start justify-between gap-5 items-center mb-10">
                        <div className="flex">
                            <div className="hidden md:block">
                                <span className="border-l-4 border-solid border-[#034ea2] mr-2"></span>
                                <h1 className="mr-10 text-xl font-bold not-italic uppercase inline">
                                    Phim
                                </h1>
                            </div>
                            <div className="flex flex-wrap">
                                <div className="w-full">
                                    <ul className="flex mb-0 list-none flex-wrap flex-row">
                                        {/* Đang chiếu */}
                                        <li
                                            onClick={() => setActiveTab(0)}
                                            className="-mb-px mr-3 md:mr-8 text-[#333333] last:mr-0 flex-auto text-center hover:text-[#034EA2] transition-all duration-300 ease-in-out cursor-pointer relative"
                                        >
                                            <a
                                                className={`md:text-base sm:text-sm text-[12px] font-bold not-italic block leading-normal transition-all duration-300 ease-in-out cursor-pointer relative
          ${
              activeTab === 0
                  ? "text-[rgb(3,78,162)] tab__active opacity-100"
                  : "text-black-10 opacity-50"
          }
          `}
                                            >
                                                Đang chiếu
                                            </a>
                                        </li>

                                        {/* Sắp chiếu */}
                                        <li
                                            onClick={() => setActiveTab(1)}
                                            className="-mb-px mr-3 md:mr-8 text-[#333333] last:mr-0 flex-auto text-center hover:text-[#034EA2] transition-all duration-300 ease-in-out cursor-pointer relative"
                                        >
                                            <a
                                                className={`md:text-base sm:text-sm text-[12px] font-bold not-italic block leading-normal transition-all duration-300 ease-in-out cursor-pointer relative
          ${
              activeTab === 1
                  ? "text-[rgb(3,78,162)] tab__active opacity-100"
                  : "text-black-10 opacity-50"
          }
          `}
                                            >
                                                Sắp chiếu
                                            </a>
                                        </li>

                                        {/* Phim IMAX */}
                                        <li
                                            onClick={() => setActiveTab(2)}
                                            className="-mb-px mr-2 text-[#333333] last:mr-0 flex-auto text-center hover:text-[#034EA2] transition-all duration-300 ease-in-out cursor-pointer relative"
                                        >
                                            <a
                                                className={`md:text-base sm:text-sm text-[12px] font-bold not-italic block leading-normal transition-all duration-300 ease-in-out cursor-pointer relative
          ${
              activeTab === 2
                  ? "text-[rgb(3,78,162)] tab__active opacity-100"
                  : "text-black-10 opacity-50"
          }
          `}
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
                            <span className="inline-block ml-1">Toàn quốc</span>
                        </a>
                    </div>
                    {/* Content */}
                    <div className="tabs__content">
                        <div>
                            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 xl:grid-cols-4 gap-6 mb-10">
                                {movies.slice(0, 8).map((movie) => (
                                    <CardHome key={movie.movieId} movie={movie} />
                                ))}
                            </div>

                            <div className="film__footer text-center transition-all duration-300">
                                <a
                                    href="/phim-dang-chieu"
                                    className="text-[#f26b38] hover:text-white w-40 border border-[#fb9440] hover:bg-[#fb9440] transition-all duration-300 focus:ring-1 focus:outline-none focus:ring-[#fb9440] rounded text-sm px-5 py-2.5 text-center inline-flex items-center dark:hover:bg-[#fb9440] dark:focus:ring-[#fb9440] mr-2 mb-2 justify-center"
                                >
                                    Xem thêm
                                    <ArrowRight />
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                {/* line */}
                <div className="line-default"></div>
            </main>
        </div>
    );
};

export default Home;
