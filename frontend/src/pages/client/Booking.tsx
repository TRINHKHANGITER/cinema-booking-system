import React, { useEffect, useMemo, useState } from "react";
import Header from "../../layouts/header";
import Footer from "../../layouts/footer";
import ChoiceSeat from "../../components/ui/ChoiceSeat";
import { useLocation } from "react-router-dom";
import useBookingStore from "../../stores/booking";
import useSeatStore from "../../stores/seat";
import {
  calculateTotalPrice,
  formatTime,
  groupSelectedSeats,
} from "../../utils/utils";
import ChoiceFood from "../../components/ui/ChoiceFood";
import Pay from "../../components/ui/Pay";

const STEPS = [
  "Chọn phim / Rạp / Suất",
  "Chọn ghế",
  "Chọn thức ăn",
  "Thanh toán",
  "Xác nhận",
];
const Booking = () => {
  const { state } = useLocation();
  
  const { showDetail, fetchShowDetail, resetBooking, selectedCombos } =
    useBookingStore();
  const { selectedSeats, resetSeats } = useSeatStore();
  const [step, setStep] = useState<1 | 2 | 3>(1);

  useEffect(() => {
    fetchShowDetail(state.showId);
    return () => {
      resetBooking();
      resetSeats();
    };
  }, []);
  // group theo ghế trên 1 hàng
  const groupedSelected = useMemo(
    () => groupSelectedSeats(selectedSeats),
    [selectedSeats],
  );
  const handleNext = () => {
    if (step < 3) setStep((s) => (s + 1) as 1 | 2 | 3);
  };

  const handleBack = () => {
    if (step > 1) setStep((s) => (s - 1) as 1 | 2 | 3);
  };
  return (
    <div>
      <Header />
      <div
        className="block border-b border-[#f4f4f4]"
        style={{ transform: "matrix(1, 0, 0, -1, 0, 0)" }}
      />

      <main className="booking__wrapper bg-[rgb(249,249,249)] md:pb-0">
        {/* Progress bar */}
        <div className="booking__progress-bar flex justify-center items-center flex-nowrap bg-white relative md:mb-8 mb-0 w-full overflow-auto">
          <ul className="flex justify-center items-center text-grey-20 md:text-base text-[12px] font-semibold w-full flex-nowrap">
            {STEPS.map((label, i) => (
              <li
                key={label}
                className="pt-4 mb-4 pl-0"
                style={{
                  color:
                    i === step || i < step
                      ? "rgb(3,78,162)"
                      : i === 0
                        ? "rgb(88,142,202)"
                        : "#d3d0d0",
                }}
              >
                <button className="md:mx-3 mx-1">{label}</button>
                <div
                  className={`relative mt-4 h-0.5 before:content-[''] before:absolute before:left-0 before:w-full before:h-0.75 before:bg-[#e9ecef] ${i <= step ? "after:content-[''] after:absolute after:left-0 after:w-full after:h-0.75 after:bg-[#034ea2]" : ""}`}
                />
              </li>
            ))}
          </ul>
        </div>

        <div className="md:container md:mx-auto xl:max-w-[1390px] lg:max-w-4xl md:max-w-4xl md:px-0 sm:px-[45px] grid xl:grid-cols-3 grid-cols-1">
          {/* Bên trái — sơ đồ ghế */}
          <div className="col-span-2 xl:order-first order-last xl:h-full h-full overflow-hidden xl:overflow-auto xl:pb-10 md:pb-32 pb-10">
            {step === 1 && showDetail && (
              <ChoiceSeat
                startTime={showDetail.startTime}
                roomId={showDetail.room.roomId}
              />
            )}
            {step === 2 && <ChoiceFood />}
            {step === 3 && <Pay />}
          </div>

          {/* Bên phải — tóm tắt */}
          <div className="col-span-1 xl:pl-4 xl:order-0 order-first py-4">
            <div className="booking__summary md:mb-4">
              <div className="h-[6px] bg-[rgb(245,128,32)] rounded-t-lg" />
              <div className="bg-white p-4 grid grid-cols-3 xl:gap-2 items-center">
                {/* Ảnh phim */}
                <div className="row-span-2 md:row-span-1 xl:row-span-2 block md:hidden xl:block">
                  <img
                    src={showDetail?.movie.imagePortrait}
                    alt={showDetail?.movie.movieName}
                    width={100}
                    height={150}
                    className="xl:w-full xl:h-full w-[78px] h-[110px] rounded object-cover"
                    style={{ color: "transparent" }}
                  />
                </div>
                <div className="row-span-2 md:row-span-1 xl:row-span-2 hidden md:block xl:hidden">
                  <img
                    src={showDetail?.movie.imagePortrait}
                    alt={showDetail?.movie.movieName}
                    width={100}
                    height={150}
                    className="w-[220px] h-[150px] rounded object-cover"
                    style={{ color: "transparent" }}
                  />
                </div>

                {/* Thông tin phim */}
                <div className="flex-1 col-span-2 md:col-span-1 xl:col-span-2">
                  <h3 className="text-sm xl:text-base font-bold xl:mb-2">
                    {showDetail?.movie.movieName}
                  </h3>
                  <p className="text-sm inline-block">
                    {showDetail?.room.roomtype.roomTypeName}
                  </p>
                  {showDetail?.movie?.age > 0 && (
                    <span className="inline-flex items-center justify-center w-[38px] h-7 bg-[rgb(245,128,32)] rounded text-sm text-white font-bold ml-2">
                      T{showDetail?.movie.age}
                    </span>
                  )}
                </div>

                {/* Rạp + suất */}
                <div className="col-span-2 md:col-span-1 xl:col-span-3">
                  <div className="xl:mt-4 text-sm xl:text-base">
                    <strong>{showDetail?.room.cinema.cinemaName}</strong>
                    <span> - </span>
                    <span>{showDetail?.room.roomName}</span>
                  </div>
                  <div className="xl:mt-2 text-sm xl:text-base">
                    <span>Suất: </span>
                    <strong>{formatTime(showDetail?.startTime ?? "")}</strong>
                    <span> - </span>
                    {showDetail?.releaseDate && (
                      <span className="capitalize text-sm">
                        {new Date(showDetail.releaseDate).toLocaleDateString(
                          "vi-VN",
                          {
                            weekday: "long",
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            timeZone: "Asia/Ho_Chi_Minh",
                          },
                        )}
                      </span>
                    )}
                  </div>

                  {/* Danh sách ghế đã chọn */}
                  <div className="xl:block hidden">
                    {groupedSelected.length > 0 && (
                      <>
                        <div className="my-4 border-t border-dashed border-gray-200" />
                        {groupedSelected.map((group) => (
                          <div
                            key={group.label}
                            className="flex justify-between text-sm mt-2"
                          >
                            <div>
                              <strong>{group.count}x </strong>
                              <span>{group.label}</span>
                              <div>
                                <span>Ghế: </span>
                                <strong>{group.seatLabel}</strong>
                              </div>
                            </div>
                            <span className="font-bold">
                              {group.price.toLocaleString("vi-VN")} ₫
                            </span>
                          </div>
                        ))}
                      </>
                    )}
                    {selectedCombos.length > 0 && (
                      <>
                        <div className="my-4 border-t border-dashed border-gray-200" />
                        {selectedCombos.map((combo) => (
                          <div
                            key={combo.comboId}
                            className="flex justify-between text-sm mt-2"
                          >
                            <div>
                              <strong>{combo.quantity}x </strong>
                              <span>{combo.comboName}</span>
                            </div>
                            <span className="font-bold">
                              {(
                                Number(combo.price) * combo.quantity
                              ).toLocaleString("vi-VN")}{" "}
                              ₫
                            </span>
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                  {/*  */}
                  <div className="my-4 border-t border-dashed border-gray-300 xl:block hidden" />
                </div>

                {/* Tổng tiền desktop */}
                <div className="xl:flex hidden justify-between col-span-3">
                  <strong className="text-base">Tổng cộng</strong>
                  <span className="font-bold text-[rgb(245,128,32)]">
                    {calculateTotalPrice(
                      selectedSeats,
                      selectedCombos,
                    ).toLocaleString("vi-VN")}
                    &nbsp;₫
                  </span>
                </div>
              </div>

              {/* Nút desktop */}
              <div className="mt-8 xl:flex hidden gap-2">
                <button
                  className="w-1/2 py-2 text-[rgb(245,128,32)]"
                  onClick={handleBack}
                  disabled={step === 1}
                >
                  Quay lại
                </button>
                <button
                  disabled={selectedSeats.length === 0}
                  onClick={handleNext}
                  className="w-1/2 py-2 bg-[rgb(245,128,32)] text-white border rounded-md hover:bg-orange-500 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {step === 3 ? "Xác nhận" : "Tiếp tục"}
                </button>
              </div>
            </div>

            {/* Thanh bottom mobile */}
            <div className="fixed bottom-0 left-0 w-full z-50 bg-white xl:hidden border border-[#DFDFDF] rounded-t-xl pb-12 pt-2">
              <div className="px-4 mb-2">
                {groupedSelected.length > 0 ? (
                  groupedSelected.map((group) => (
                    <div
                      key={group.label}
                      className="flex justify-between text-sm mt-2"
                    >
                      <div>
                        <strong>{group.count}x </strong>
                        <span>{group.label}</span>
                        <div>
                          <span>Ghế: </span>
                          <strong>{group.seatLabel}</strong>
                        </div>
                      </div>
                      <span className="font-bold">
                        {group.price.toLocaleString("vi-VN")} ₫
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-400 text-center py-2">
                    Chưa chọn ghế
                  </p>
                )}
                {selectedCombos.length > 0 && (
                  <>
                    <div className="my-4 border-t border-dashed border-gray-200" />
                    {selectedCombos.map((combo) => (
                      <div
                        key={combo.comboId}
                        className="flex justify-between text-sm mt-2"
                      >
                        <div>
                          <strong>{combo.quantity}x </strong>
                          <span>{combo.comboName}</span>
                        </div>
                        <span className="font-bold">
                          {(
                            Number(combo.price) * combo.quantity
                          ).toLocaleString("vi-VN")}{" "}
                          ₫
                        </span>
                      </div>
                    ))}
                  </>
                )}
              </div>

              {/* Fixed bottom bar */}
              <div className="fixed bottom-0 left-0 right-0 h-14 bg-white flex items-center justify-between px-4 border-t border-gray-100">
                <div className="flex items-center gap-1">
                  <span className="text-sm text-gray-500">Tổng cộng:</span>
                  <span className="font-bold text-[rgb(245,128,32)]">
                    {calculateTotalPrice(
                      selectedSeats,
                      selectedCombos,
                    ).toLocaleString("vi-VN")}{" "}
                    ₫
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    className="px-4 h-10 text-[rgb(245,128,32)] text-sm"
                    onClick={handleBack}
                    disabled={step === 1}
                  >
                    Quay lại
                  </button>
                  <button
                    disabled={selectedSeats.length === 0}
                    onClick={handleNext}
                    className="px-4 h-10 bg-[rgb(245,128,32)] text-white text-sm rounded-md disabled:opacity-40"
                  >
                    {step === 3 ? "Xác nhận" : "Tiếp tục"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Booking;
