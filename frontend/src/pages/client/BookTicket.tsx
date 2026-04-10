import React, { useEffect, useState } from "react";
import Header from "../../layouts/header";
import Footer from "../../layouts/footer";
import Clock from "../../components/icon/clock";
import Calendar from "../../components/icon/calendar";
import Vote from "../../components/icon/vote";
import DateSlider from "../../layouts/slick";
import Dropdown from "../../layouts/dropdown";
import Card from "../../components/ui/Card";
import ArrowRight from "../../components/icon/arrowRight";
import useMovieStore from "../../stores/product";
import { Link, useParams } from "react-router-dom";
import useShowtimeStore from "../../stores/showtime";
import {
  filterShowtimesByDate,
  formatTime,
  groupShowtimesByCinema,
} from "../../utils/utils";
import { useAuthStore } from "../../stores/auth";
import Signin from "../../layouts/signin";


const BookTicket = () => {
  
  const user = useAuthStore(s=>s.user)
  const { slug } = useParams();
const [openSignIn, setOpenSignIn] = useState(false);

  const { fetchMovieBySlug, selectedMovie, fetchMovies, movies } =
    useMovieStore();
  const { fetchShowtimeByMovie, showtimes, selectedDate } = useShowtimeStore();

  useEffect(() => {
    if (slug) {
      fetchMovieBySlug(slug);
      fetchShowtimeByMovie(slug);
    }
    fetchMovies();
  }, [slug]);
  const filteredShowtimes = filterShowtimesByDate(showtimes, selectedDate);
  const grouped = groupShowtimesByCinema(filteredShowtimes);
  return (
    <div>
      <div>
        <Header />
        <div className="mb-4">
          <div className="relative bg-black flex justify-center w-full h-full">
            <div className="absolute w-full h-full z-[10] bg-[#0003]"></div>
            <div className="relative h-full">
              <div className="absolute top-0 left-0 z-[100]">
                <img
                  src="/images/blur-left.png"
                  className="w-full lg:h-[500px] object-cover lg:block hidden"
                />
              </div>
              <div className="relative">
                <img
                  src={selectedMovie?.imageLandscape}
                  className="w-[860px] h-full lg:h-[500px] object-cover"
                />
                <button className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[200] cursor-pointer">
                  <img
                    src="/images/button-play.png"
                    className="w-[40px] h-[40px] lg:w-[64px] lg:h-[64px]"
                  />
                </button>
              </div>
              <div className="absolute top-0 right-0 z-[100] lg:block hidden">
                <img
                  src="/images/blur-right.png"
                  className="w-full lg:h-[500px] object-cover"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-7 my-0 mx-auto xl:max-w-7xl lg:max-w-4xl md:max-w-4xl gap-8 py-7 md:px-4 px-4">
            <div className="book__left lg:col-span-5 w-full">
              <div className="flex flex-col">
                {/* Desktop movie info */}
                <div className="movie__info relative lg:grid hidden grid-cols-3 lg:gap-5 gap-3 lg:items-end">
                  <div className="movie__thumbnail lg:-translate-y-16 col-span-1 drop-shadow-2xl z-[500]">
                    <img
                      alt={selectedMovie?.movieName}
                      loading="lazy"
                      width="220"
                      height="280"
                      src={selectedMovie?.imagePortrait}
                      className="border-2 rounded border-white lg:w-[320px] lg:h-100 w-full h-full object-cover duration-500 ease-in-out scale-100 blur-0 grayscale-0"
                      style={{ color: "transparent" }}
                    />
                  </div>
                  <div className="col-span-2 lg:-translate-y-16 flex flex-col justify-end">
                    <div className="item__title flex items-center">
                      <h1 className="text-[20px] md:text-[24px] lg:text-[28px] font-bold text-black-10 mr-4">
                        {selectedMovie?.movieName}
                      </h1>
                      <span className="inline-flex items-center justify-center w-[38px] h-7 bg-[rgb(245,128,32)] rounded text-sm text-center text-white font-bold">
                        T{selectedMovie?.age}
                      </span>
                    </div>

                    <div className="flex items-center">
                      <div className="text-sm flex items-center font-semibold">
                        <Clock />
                        <span>{selectedMovie?.duration} Phút</span>
                      </div>
                      <div className="text-sm ml-4 flex items-center font-semibold">
                        <Calendar />
                        {new Date(
                          selectedMovie?.createdAt || "",
                        ).toLocaleDateString("vi-VN")}
                      </div>
                    </div>

                    <div className="mt-2">
                      <a className="text-[20px] hover:text-[rgb(245,128,32)] transition duration-500 cursor-pointer flex items-center">
                        <Vote />
                        <span className="mr-1">{selectedMovie?.rate}</span>
                        <span className="text-sm text-gray-500">
                          ({selectedMovie?.totalVotes})
                        </span>
                      </a>
                    </div>

                    <div className="flex flex-col gap-1 mt-2">
                      <div className="flex text-sm mb-2">
                        <span className="text-gray-500">Quốc gia:</span>
                        <span className="ml-4">{selectedMovie?.country}</span>
                      </div>
                      <div className="flex text-sm mb-2">
                        <span className="text-gray-500">Nhà sản xuất:</span>
                        <span className="ml-4">{selectedMovie?.producer}</span>
                      </div>
                      <div className="flex text-sm">
                        <span className="text-gray-500 w-[70px]">
                          Thể loại:
                        </span>
                        <div className="flex gap-2 ml-2">
                          <span className="border border-gray-300 px-3 py-1 rounded-lg hover:border-[rgb(245,128,32)]">
                            {selectedMovie?.movietype.movieTypeName}
                          </span>
                        </div>
                      </div>
                      <div className="flex text-sm">
                        <span className="text-gray-500 w-[70px]">
                          Đạo diễn:
                        </span>
                        <span className="ml-2 border border-gray-300 px-3 py-1 rounded-lg hover:border-[rgb(245,128,32)]">
                          {selectedMovie?.director}
                        </span>
                      </div>
                      <div className="flex text-sm">
                        <span className="text-gray-500 w-[70px]">
                          Diễn viên:
                        </span>
                        <div className="flex flex-wrap gap-2 ml-2">
                          {selectedMovie?.actors?.map((actor, index) => (
                            <span
                              key={index}
                              className="border border-gray-300 px-3 py-1 rounded-lg hover:border-[rgb(245,128,32)]"
                            >
                              {actor}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Mobile movie info */}
              <div className="movie__info relative lg:hidden grid grid-cols-1 grid-flow-row md:-mt-16">
                <div className="movie__thumbnail grid grid-cols-3 gap-3 grid-flow-col">
                  <img
                    alt={selectedMovie?.movieName}
                    loading="lazy"
                    width="220"
                    height="280"
                    src={selectedMovie?.imagePortrait}
                    className="border-2 rounded border-white lg:w-[320px] lg:h-[400px] md:w-full md:h-full w-[120px] h-[160px] object-cover col-span-1 duration-500 ease-in-out"
                    style={{ color: "transparent" }}
                  />
                  <div className="col-span-2 flex flex-col justify-center">
                    <div className="item__title flex items-center">
                      <h1 className="text-[20px] md:text-[24px] lg:text-[28px] font-bold text-black-10 mr-4">
                        {selectedMovie?.movieName}
                      </h1>
                      <span className="inline-flex items-center justify-center w-[38px] h-7 bg-[rgb(245,128,32)] rounded text-sm text-white font-bold">
                        T{selectedMovie?.age}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <div className="text-sm flex items-center font-semibold">
                        <Clock />
                        <span>{selectedMovie?.duration} Phút</span>
                      </div>
                      <div className="text-sm ml-4 flex items-center font-semibold">
                        <Calendar />
                        <span>
                          {new Date(
                            selectedMovie?.createdAt || "",
                          ).toLocaleDateString("vi-VN")}
                        </span>
                      </div>
                    </div>
                    <div className="mt-2 flex items-center text-[20px]">
                      <Vote />
                      <span className="mr-1">{selectedMovie?.rate}</span>
                      <span className="text-sm text-gray-500">
                        ({selectedMovie?.totalVotes})
                      </span>
                    </div>
                    <div className="flex flex-nowrap text-sm">
                      <span className="h-8 py-[6px] text-gray-500">
                        Quốc gia:
                      </span>
                      <span className="h-8 ml-4 py-[6px]">
                        {selectedMovie?.country}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex flex-col gap-1">
                    <div className="flex flex-nowrap items-center text-sm">
                      <span className="inline-block h-8 py-[6px] text-gray-500">
                        Nhà sản xuất:
                      </span>
                      <ul className="ml-2 flex flex-wrap flex-1">
                        <li className="text-sm cursor-pointer hover:text-[rgb(245,128,32)] transition duration-500 ease-in-out">
                          <span className="mr-[5px]">
                            {selectedMovie?.producer}
                          </span>
                        </li>
                      </ul>
                    </div>
                    <div className="flex flex-nowrap items-center text-sm">
                      <span className="inline-block h-8 py-[6px] text-gray-500 w-[70px]">
                        Thể loại:
                      </span>
                      <ul className="ml-2 flex flex-wrap gap-1 flex-1">
                        <li className="inline-block">
                          <a className="text-black text-sm inline-flex h-8 border border-gray-300 hover:border-[rgb(245,128,32)] rounded-lg px-4 py-2 capitalize items-center">
                            {selectedMovie?.movietype.movieTypeName}
                          </a>
                        </li>
                      </ul>
                    </div>
                    <div className="flex flex-nowrap items-start text-sm">
                      <span className="inline-block h-8 py-[6px] text-gray-500 w-[70px]">
                        Đạo diễn:
                      </span>
                      <ul className="ml-2 flex flex-wrap gap-1 flex-1">
                        <li className="inline-block">
                          <a className="text-black text-sm inline-flex h-8 border border-gray-300 hover:border-[rgb(245,128,32)] rounded-lg px-4 py-2 capitalize items-center">
                            {selectedMovie?.director}
                          </a>
                        </li>
                      </ul>
                    </div>
                    <div className="flex flex-nowrap items-start text-sm">
                      <span className="inline-block h-8 py-[6px] text-gray-500 w-[70px]">
                        Diễn viên:
                      </span>
                      <ul className="ml-2 flex flex-wrap gap-1 flex-1">
                        {selectedMovie?.actors?.map((actor, index) => (
                          <li key={index} className="inline-block">
                            <a className="text-black text-sm inline-flex h-8 border border-gray-300 hover:border-[rgb(245,128,32)] rounded-lg px-4 py-2 capitalize items-center">
                              {actor}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Nội dung phim */}
              <div className="movie__content mt-3 mb-1 lg:mt-0">
                <span className="border-l-4 border-solid border-blue-800 mr-2"></span>
                <h1 className="mb-4 text-base inline-block capitalize font-bold">
                  Nội dung phim
                </h1>
                <div className="text-black-10 text-sm font-normal content-text">
                  <p className="mb-1">
                    <span style={{ fontSize: "15px", lineHeight: "1.6" }}>
                      <strong className="text-[#485fc7]">
                        {selectedMovie?.movieName}
                      </strong>{" "}
                      {selectedMovie?.description}
                    </span>
                  </p>
                </div>
              </div>

              {/* Lịch chiếu */}
              <div className="show__time">
                <div className="movie__showtime-header">
                  <span className="border-l-4 border-solid border-blue-800 mr-2" />
                  <h1 className="mb-4 text-base inline-block capitalize font-bold">
                    Lịch chiếu
                  </h1>
                </div>
                <div className="movie__filter grid grid-cols-1 sm:grid-cols-6 lg:grid-cols-5 xl:grid-cols-12 items-center justify-center">
                  <div className="filter__date order-2 sm:order-1 sm:col-span-3 md:col-span-3 xl:col-span-7 lg:col-span-3 px-7 mt-6 md:mt-0 sm:mt-0 sm:px-4">
                    <DateSlider />
                  </div>
                  <div className="filter__location order-1 sm:order-2 sm:col-span-3 md:col-span-3 xl:col-span-5 lg:col-span-2 grid grid-cols-2 ml-2 gap-1">
                    <div className="col-span-1">
                      <Dropdown />
                    </div>
                    <div className="col-span-1">
                      <Dropdown />
                    </div>
                  </div>
                </div>
                <div className="w-full h-0.5 bg-[#034ea2] my-4"></div>

                {/* Showtime list */}
                <div className="showtime__list">
                  {Object.entries(grouped).map(
                    ([cinemaName, roomTypes], cinemaIndex) => (
                      <div
                        key={cinemaName}
                        className={`showtime__cinema md:py-8 py-4 px-3 ${
                          cinemaIndex % 2 === 0 ? "bg-white" : "bg-[#FDFBFA]"
                        }`}
                      >
                        <h1 className="text-base font-bold mb-4">
                          {cinemaName}
                        </h1>
                        {Object.entries(roomTypes).map(([roomType, shows]) => (
                          <div
                            key={roomType}
                            className="showtime__bundle flex md:flex-row flex-col gap-2 items-start mb-6"
                          >
                            <label className="text-sm font-semibold text-grey-10 mt-2 w-[150px]">
                              {roomType} Phụ Đề
                            </label>
                            <div className="time__show flex flex-1 flex-row gap-x-3 gap-y-1 flex-wrap">
                               <Signin open={openSignIn} setOpen={setOpenSignIn} />
                              {shows
                                .sort((a, b) =>
                                  a.startTime.localeCompare(b.startTime),
                                )
                                .map((show) => (
                                  <Link
                                    onClick={(e)=>{
                                      if(!user) {
                                           e.preventDefault();
            setOpenSignIn(true); 
                                      }
                                    }}
                                    state={show}
                                    to={`/dat-ve/${slug}`}
                                    // key={show.showId}
                                    className="py-2 md:px-8 px-6 border border-gray-300 rounded text-sm font-normal text-black-10 active:bg-[#034ea2] transition-all duration-500 ease-in-out hover:text-white hover:bg-[#034ea2]"
                                  >
                                    {formatTime(show.startTime)}
                                  </Link>
                                ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    ),
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="book__right hidden xl:block lg:col-span-2 w-full overflow-hidden">
              <div className="mb-4">
                <span className="border-l-4 border-solid border-blue-10 mr-2" />
                <h1 className="text-xl inline-block uppercase font-semibold">
                  Phim đang chiếu
                </h1>
              </div>
              <div className="movie__content">
                <div className="flex flex-col gap-12 justify-between">
                  {movies.slice(0, 4).map((movie, index) => (
                    <Card key={index} w={400} h={250} movie={movie} />
                  ))}
                </div>
              </div>
              <div className="film__footer text-center transition-all duration-300 mt-15">
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
        <Footer />
      </div>
    </div>
  );
};

export default BookTicket;
