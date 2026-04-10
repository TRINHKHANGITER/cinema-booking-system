import React, { useEffect, useMemo } from "react";
import useSeatStore from "../../stores/seat";
import { formatTime, groupSeatsByRow } from "../../utils/utils";

type Props = {
  startTime: string;
  roomId: number;
};

const ChoiceSeat = ({ startTime, roomId }: Props) => {
  const { seats, fetchSeats, selectedSeats, toggleSeat } = useSeatStore();

  useEffect(() => {
    fetchSeats(roomId);
  }, [roomId]);

  const grouped = useMemo(() => groupSeatsByRow(seats), [seats]);

  const selectedIds = new Set(selectedSeats.map((s) => s.seatId));

  const toggle = (seatIds: number[]) => {
    const firstSeat = seats.find((s) => s.seatId === seatIds[0]);
    if (firstSeat) toggleSeat(firstSeat, seats);
  };

  return (
    <div>
      {/* Suất chiếu */}
      <div className="bg-white px-6 py-4 rounded md:mb-8 mb-4 w-full">
        <div className="flex gap-8 items-center">
          <label className="text-sm font-semibold">Suất chiếu</label>
          <button className="py-2 px-4 border border-gray-300 rounded text-sm bg-[#034ea2] text-white">
            {formatTime(startTime)}
          </button>
        </div>
      </div>

      {/* Sơ đồ ghế */}
      <div className="bg-white py-6 px-4 rounded md:mb-8 w-full">
        {/* Màn hình */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-3/5 h-1 bg-[#034ea2] rounded-full opacity-50" />
          <p className="text-xs text-gray-400 mt-2 tracking-widest">Màn hình</p>
        </div>

        {/* Ghế */}
        <div className="flex flex-col items-center gap-1.5 overflow-auto">
          {Object.entries(grouped)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([row, rowSeats]) => {
              const isCouple = rowSeats[0].seatTypeId === 3;
              const sorted = [...rowSeats].sort(
                (a, b) => a.seatColumn - b.seatColumn,
              );
              const mid = Math.floor(sorted.length / 2);

              return (
                <div key={row} className="flex items-center gap-1">
                  <span className="w-4 text-[11px] text-gray-400 text-center flex-shrink-0">
                    {row}
                  </span>
                  <div className="flex gap-1 items-center">
                    {sorted.map((seat, i) => {
                      if (isCouple && i % 2 !== 0) return null;
                      const next = isCouple ? sorted[i + 1] : null;
                      const ids = isCouple
                        ? ([seat.seatId, next?.seatId].filter(
                            Boolean,
                          ) as number[])
                        : [seat.seatId];
                      const isBooked = !seat.status;
                      const isSelected = selectedIds.has(seat.seatId);

                      const seatClass = isBooked
                        ? "bg-gray-100 border-gray-200 text-gray-300 cursor-not-allowed"
                        : isSelected
                          ? seat.seatTypeId === 2
                            ? "bg-[#BA7517] border-[#854F0B] text-[#FAEEDA] scale-110"
                            : seat.seatTypeId === 3
                              ? "bg-[#D4537E] border-[#993556] text-[#FBEAF0] scale-105"
                              : "bg-[#034ea2] border-[#023a7a] text-white scale-110"
                          : seat.seatTypeId === 2
                            ? "bg-[#FAEEDA] border-[#EF9F27] text-[#854F0B] hover:bg-[#FAC775]"
                            : seat.seatTypeId === 3
                              ? "bg-[#FBEAF0] border-[#ED93B1] text-[#72243E] hover:bg-[#F4C0D1]"
                              : "bg-white border-gray-300 text-gray-600 hover:border-[#034ea2] hover:text-[#034ea2]";

                      return (
                        <React.Fragment key={seat.seatId}>
                          {i === mid && <div className="w-3 flex-shrink-0" />}
                          <button
                            disabled={isBooked}
                            onClick={() => toggle(ids)}
                            title={`${seat.seatRow}${seat.seatColumn} - ${seat.prices?.[0]?.price?.toLocaleString() ?? ""}₫`}
                            className={`h-7 rounded-t-md rounded-b-sm border-[1.5px] text-[10px] font-medium transition-all duration-150 flex-shrink-0 ${isCouple ? "w-16" : "w-7"} ${seatClass}`}
                          >
                            {isCouple
                              ? `${seat.seatRow}${seat.seatColumn}·${next?.seatRow ?? ""}${next?.seatColumn ?? ""}`
                              : `${seat.seatRow}${seat.seatColumn}`}
                          </button>
                        </React.Fragment>
                      );
                    })}
                  </div>
                  <span className="w-4 text-[11px] text-gray-400 text-center flex-shrink-0">
                    {row}
                  </span>
                </div>
              );
            })}
        </div>

        {/* Chú thích */}
        <div className="mt-8 pt-4 border-t border-gray-100 flex md:flex-row flex-col-reverse justify-between items-center gap-3">
          <div className="flex gap-4 flex-wrap justify-center">
            <div className="flex items-center gap-1.5">
              <span className="w-5 h-5 rounded bg-gray-100 border border-gray-200 inline-block" />
              <span className="text-xs text-gray-500">Đã bán</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-5 h-5 rounded bg-[#034ea2] inline-block" />
              <span className="text-xs text-gray-500">Đang chọn</span>
            </div>
          </div>
          <div className="flex gap-4 flex-wrap justify-center">
            <div className="flex items-center gap-1.5">
              <span className="w-5 h-5 rounded border border-gray-300 bg-white inline-block" />
              <span className="text-xs text-gray-500">Ghế đơn</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-5 h-5 rounded bg-[#FAEEDA] border border-[#EF9F27] inline-block" />
              <span className="text-xs text-gray-500">VIP</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-10 h-5 rounded border border-[#ED93B1] bg-[#FBEAF0] inline-block" />
              <span className="text-xs text-gray-500">Ghế đôi</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChoiceSeat;
