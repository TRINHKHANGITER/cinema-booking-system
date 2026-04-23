import { useCallback, useEffect, useMemo, useState } from "react";
import { showTimeSeatService } from "../../services/showtimeSeat.service";
import type { ShowTimeSeat } from "../../types/showtime-seat";
import type { Seat } from "../../types/seat";
import { formatTime, seatUnitPrice } from "../../utils/utils";
import { toast } from "sonner";
import axios from "axios";

type Props = {
    startTime: string;
    showTimeId: number;
    userId?: number;
    orderId: number | null;
    orderExpiredAt?: string | null;
    selectedSeats: Seat[];
    onSelectedSeatsChange: (seats: Seat[]) => void;
    onOrderChange: (orderId: number, expiredAt?: string) => void;
    onOrderExpired: () => void;
};

const ChoiceSeat = ({
    startTime,
    showTimeId,
    userId,
    orderId,
    orderExpiredAt,
    selectedSeats,
    onSelectedSeatsChange,
    onOrderChange,
    onOrderExpired,
}: Props) => {
    const [seatMap, setSeatMap] = useState<ShowTimeSeat[]>([]);
    const [loading, setLoading] = useState(false);

    const selectedIds = useMemo(() => new Set(selectedSeats.map((s) => s.seatId)), [selectedSeats]);

    const toSeat = useCallback((item: ShowTimeSeat): Seat => {
        const isPrimary = item.seatTypeId === 3 ? item.seatColumn % 2 !== 0 : true;
        return {
            seatId: item.seatId,
            seatRow: item.seatRow,
            seatColumn: item.seatColumn,
            seatTypeId: item.seatTypeId,
            status: "ACTIVE",
            isPrimary,
        } as Seat;
    }, []);

    const fetchSeatMap = useCallback(async () => {
        setLoading(true);
        try {
            const response = await showTimeSeatService.getSeatMap(showTimeId);
            const data = response.result ?? [];
            setSeatMap(data);

            if (orderId) {
                const heldByCurrentOrder = data.filter(
                    (item) => item.status === "HELD" && item.orderId === orderId
                );
                if (heldByCurrentOrder.length > 0) {
                    const mapped = heldByCurrentOrder
                        .sort((a, b) => {
                            if (a.seatRow === b.seatRow) return a.seatColumn - b.seatColumn;
                            return a.seatRow.localeCompare(b.seatRow);
                        })
                        .map((item) => toSeat(item));
                    onSelectedSeatsChange(mapped);
                } else {
                    onSelectedSeatsChange([]);
                }
            }
        } finally {
            setLoading(false);
        }
    }, [onSelectedSeatsChange, orderId, showTimeId, toSeat]);

    useEffect(() => {
        fetchSeatMap();
    }, [fetchSeatMap]);

    const grouped = useMemo(() => {
        return seatMap.reduce<Record<string, ShowTimeSeat[]>>((acc, seat) => {
            if (!acc[seat.seatRow]) acc[seat.seatRow] = [];
            acc[seat.seatRow].push(seat);
            return acc;
        }, {});
    }, [seatMap]);

    const applyHoldResponse = useCallback(
        (orderResult: { orderId: number; expiredAt: string; heldSeats: ShowTimeSeat[] }) => {
            onOrderChange(orderResult.orderId, orderResult.expiredAt);

            const normalized = [...(orderResult.heldSeats ?? [])].sort((a, b) => {
                if (a.seatRow === b.seatRow) return a.seatColumn - b.seatColumn;
                return a.seatRow.localeCompare(b.seatRow);
            });

            const mapped = normalized.map((item) => toSeat(item));
            onSelectedSeatsChange(mapped);
        },
        [onOrderChange, onSelectedSeatsChange, toSeat]
    );

    const toggle = async (seatIds: number[]) => {
        const isAllSelected = seatIds.every((id) => selectedIds.has(id));
        const isExpiredNow =
            !!orderExpiredAt && new Date(orderExpiredAt).getTime() <= Date.now();

        if (isExpiredNow) {
            toast.error("Đơn giữ ghế đã hết hạn, vui lòng chọn lại ghế.");
            onOrderExpired();
            return;
        }

        try {
            if (isAllSelected) {
                if (!orderId) return;

                const response = await showTimeSeatService.releaseSeats({ orderId, seatIds });
                if (response.result) {
                    applyHoldResponse(response.result);
                }
                await fetchSeatMap();
                return;
            }

            const response = await showTimeSeatService.holdSeats({
                userId,
                showTimeId,
                orderId,
                seatIds,
            });

            if (response.result) {
                applyHoldResponse(response.result);
            }
            await fetchSeatMap();
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const data = error.response?.data as { code?: string; message?: string } | undefined;
                if (
                    data?.code === "ORDER_EXPIRED" ||
                    data?.code === "ORDER_STATUS_INVALID" ||
                    data?.code === "ORDER_NOT_FOUND"
                ) {
                    toast.error("Đơn giữ ghế đã hết hạn, vui lòng chọn lại ghế.");
                    onOrderExpired();
                    await fetchSeatMap();
                    return;
                }
                toast.error(data?.message || "Không thể cập nhật ghế. Vui lòng thử lại.");
                return;
            }
            toast.error("Không thể cập nhật ghế. Vui lòng thử lại.");
        }
    };

    return (
        <div>
            <div className="bg-white px-6 py-4 rounded md:mb-8 mb-4 w-full">
                <div className="flex gap-8 items-center">
                    <label className="text-sm font-semibold">Suất chiếu</label>
                    <button className="py-2 px-4 border border-gray-300 rounded text-sm bg-[#034ea2] text-white">
                        {formatTime(startTime)}
                    </button>
                </div>
            </div>

            <div className="bg-white py-6 px-4 rounded md:mb-8 w-full">
                <div className="flex flex-col items-center mb-8">
                    <div className="w-3/5 h-1 bg-[#034ea2] rounded-full opacity-50" />
                    <p className="text-xs text-gray-400 mt-2 tracking-widest">Màn hình</p>
                </div>

                {loading && (
                    <div className="text-center text-sm text-gray-500 mb-4">Đang tải sơ đồ ghế...</div>
                )}

                <div className="flex flex-col items-center gap-1.5 overflow-auto">
                    {Object.entries(grouped)
                        .sort(([a], [b]) => a.localeCompare(b))
                        .map(([row, rowSeats]) => {
                            const sorted = [...rowSeats].sort((a, b) => a.seatColumn - b.seatColumn);
                            const typeId = sorted[0]?.seatTypeId;
                            const isCouple = typeId === 3;
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
                                                ? ([seat.seatId, next?.seatId].filter(Boolean) as number[])
                                                : [seat.seatId];

                                            const isHeldByOther =
                                                seat.status === "HELD" &&
                                                orderId !== null &&
                                                !!seat.orderId &&
                                                seat.orderId !== orderId;
                                            const isBlocked =
                                                seat.status === "SOLD" ||
                                                seat.status === "BLOCKED" ||
                                                isHeldByOther;
                                            const isSelected = selectedIds.has(seat.seatId);

                                            const seatClass = isBlocked
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
                                                <div key={seat.seatId}>
                                                    {i === mid && <div className="w-3 flex-shrink-0" />}
                                                    <button
                                                        disabled={isBlocked}
                                                        onClick={() => toggle(ids)}
                                                        title={`${seat.seatRow}${seat.seatColumn} - ${seatUnitPrice({ seatTypeId: seat.seatTypeId } as Seat).toLocaleString()}d`}
                                                        className={`h-7 rounded-t-md rounded-b-sm border-[1.5px] text-[10px] font-medium transition-all duration-150 flex-shrink-0 ${isCouple ? "w-16" : "w-7"} ${seatClass}`}
                                                    >
                                                        {isCouple
                                                            ? `${seat.seatRow}${seat.seatColumn}-${next?.seatRow ?? ""}${next?.seatColumn ?? ""}`
                                                            : `${seat.seatRow}${seat.seatColumn}`}
                                                    </button>
                                                </div>
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

                <div className="mt-8 pt-4 border-t border-gray-100 flex md:flex-row flex-col-reverse justify-between items-center gap-3">
                    <div className="flex gap-4 flex-wrap justify-center">
                        <div className="flex items-center gap-1.5">
                            <span className="w-5 h-5 rounded bg-gray-100 border border-gray-200 inline-block" />
                            <span className="text-xs text-gray-500">Đã bán / Đang giữ</span>
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
