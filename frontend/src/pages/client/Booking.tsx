import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import ChoiceFood from "../../components/ui/ChoiceFood";
import Pay from "../../components/ui/Pay";
import ChoiceSeat from "../../components/ui/ChoiceSeat";
import type { SelectedCombo } from "../../types/combo";
import type { Seat } from "../../types/seat";
import { useAppDispatch, useAppSelector } from "../../stores/hooks";
import { clearCurrentShowtime, fetchShowTimeByIdThunk } from "../../stores/slices/showtimeSlice";
import { calculateTotalPrice, formatTime, groupSelectedSeats } from "../../utils/utils";
import { checkoutService } from "../../services/checkout.service";
import { bookingService } from "../../services/booking.service";
import { orderService } from "../../services/order.service";
import { toast } from "sonner";
import axios from "axios";

const STEPS = ["Chọn phim / Rạp / Suất", "Chọn ghế", "Chọn thức ăn", "Thanh toán", "Xác nhận"];

const formatCountdown = (totalSeconds: number) => {
    const safeSeconds = Math.max(0, totalSeconds);
    const hours = Math.floor(safeSeconds / 3600);
    const minutes = Math.floor((safeSeconds % 3600) / 60);
    const seconds = safeSeconds % 60;

    return [hours, minutes, seconds].map((unit) => String(unit).padStart(2, "0")).join(":");
};

const Booking = () => {
    const dispatch = useAppDispatch();
    const { state } = useLocation();

    const user = useAppSelector((store) => store.auth.user);
    const showDetail = useAppSelector((store) => store.showtime.currentShowtime);

    const [selectedSeats, setSelectedSeats] = useState<Seat[]>([]);
    const [selectedCombos, setSelectedCombos] = useState<SelectedCombo[]>([]);
    const [orderId, setOrderId] = useState<number | null>(null);
    const [orderExpiredAt, setOrderExpiredAt] = useState<string | null>(null);
    const [holdRemainingSeconds, setHoldRemainingSeconds] = useState<number | null>(null);
    const [step, setStep] = useState<1 | 2 | 3>(1);

    const showTimeId = useMemo(() => {
        if (!state || typeof state !== "object") return null;

        const maybeState = state as {
            showTimeId?: number | string;
            showtimeId?: number | string;
        };

        const raw = maybeState.showTimeId ?? maybeState.showtimeId;
        if (typeof raw === "number") return raw;
        if (typeof raw === "string" && /^[0-9]+$/.test(raw)) return Number(raw);
        return null;
    }, [state]);

    const orderStorageKey = useMemo(
        () => (showTimeId ? `BOOKING_ORDER_${showTimeId}` : null),
        [showTimeId]
    );

    const clearOrderSession = useCallback(() => {
        if (orderStorageKey) {
            sessionStorage.removeItem(orderStorageKey);
        }
    }, [orderStorageKey]);

    const resetBookingState = useCallback(() => {
        setSelectedSeats([]);
        setSelectedCombos([]);
        setOrderId(null);
        setOrderExpiredAt(null);
        setHoldRemainingSeconds(null);
        setStep(1);
        clearOrderSession();
    }, [clearOrderSession]);

    const extractApiError = (error: unknown): { code?: string; message?: string } => {
        if (!axios.isAxiosError(error)) return {};
        const payload = error.response?.data as { code?: string; message?: string } | undefined;
        return payload ?? {};
    };

    useEffect(() => {
        let isCancelled = false;

        if (showTimeId) {
            dispatch(fetchShowTimeByIdThunk(showTimeId));
        }

        setSelectedSeats([]);
        setSelectedCombos([]);
        setStep(1);

        const clearPersistedOrder = () => {
            if (orderStorageKey) {
                sessionStorage.removeItem(orderStorageKey);
            }

            if (!isCancelled) {
                setOrderId(null);
                setOrderExpiredAt(null);
                setHoldRemainingSeconds(null);
            }
        };

        const hydratePersistedOrder = async () => {
            if (!orderStorageKey) {
                clearPersistedOrder();
                return;
            }

            const raw = sessionStorage.getItem(orderStorageKey);
            if (!raw) {
                clearPersistedOrder();
                return;
            }

            try {
                const parsed = JSON.parse(raw) as { orderId?: number; expiredAt?: string };
                const hasRequiredFields = !!parsed.orderId && !!parsed.expiredAt;
                const isNotExpired =
                    hasRequiredFields && new Date(parsed.expiredAt as string).getTime() > Date.now();

                if (!hasRequiredFields || !isNotExpired) {
                    clearPersistedOrder();
                    return;
                }

                const response = await orderService.getOrderByOrderId(parsed.orderId as number);
                if (isCancelled) return;

                const currentOrder = response?.result;
                const nextExpiredAt = currentOrder?.expiredAt ?? parsed.expiredAt ?? null;
                const nextOrderId = currentOrder?.orderId ?? parsed.orderId ?? null;
                const isPayingOrder = currentOrder?.status === "PAYING";
                const nextExpiredAtMs = nextExpiredAt ? new Date(nextExpiredAt).getTime() : NaN;
                const hasValidExpiry = !Number.isNaN(nextExpiredAtMs) && nextExpiredAtMs > Date.now();

                if (!nextOrderId || !isPayingOrder || !hasValidExpiry) {
                    clearPersistedOrder();
                    return;
                }

                setOrderId(nextOrderId);
                setOrderExpiredAt(nextExpiredAt);
                sessionStorage.setItem(
                    orderStorageKey,
                    JSON.stringify({ orderId: nextOrderId, expiredAt: nextExpiredAt })
                );
            } catch {
                clearPersistedOrder();
            }
        };

        void hydratePersistedOrder();

        return () => {
            isCancelled = true;
            dispatch(clearCurrentShowtime());
        };
    }, [dispatch, orderStorageKey, showTimeId]);

    const selectedShowTime = useMemo(() => {
        if (!showDetail) return null;
        if (!showTimeId) return showDetail.showTimes?.[0] ?? null;

        return (
            showDetail.showTimes?.find((showTime) => showTime.showTimeId === showTimeId) ??
            showDetail.showTimes?.[0] ??
            null
        );
    }, [showDetail, showTimeId]);

    const groupedSelected = useMemo(() => groupSelectedSeats(selectedSeats), [selectedSeats]);

    const handleOrderChange = useCallback(
        (id: number, expiredAt?: string) => {
            const normalizedExpiredAt = expiredAt ?? null;
            setOrderId(id);
            setOrderExpiredAt(normalizedExpiredAt);

            if (orderStorageKey && normalizedExpiredAt) {
                sessionStorage.setItem(
                    orderStorageKey,
                    JSON.stringify({ orderId: id, expiredAt: normalizedExpiredAt })
                );
            }
        },
        [orderStorageKey]
    );

    const handleOrderExpired = useCallback(() => {
        resetBookingState();
    }, [resetBookingState]);

    useEffect(() => {
        if (!orderExpiredAt) return;

        const expiredAtMs = new Date(orderExpiredAt).getTime();
        if (Number.isNaN(expiredAtMs)) return;

        const timer = setInterval(() => {
            if (Date.now() >= expiredAtMs) {
                toast.error("Đơn giữ ghế đã hết hạn, vui lòng chọn lại ghế.");
                handleOrderExpired();
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [handleOrderExpired, orderExpiredAt]);

    useEffect(() => {
        if (!orderExpiredAt) {
            setHoldRemainingSeconds(null);
            return;
        }

        const expiredAtMs = new Date(orderExpiredAt).getTime();
        if (Number.isNaN(expiredAtMs)) {
            setHoldRemainingSeconds(null);
            return;
        }

        const updateRemainingTime = () => {
            const remainingSeconds = Math.max(0, Math.ceil((expiredAtMs - Date.now()) / 1000));
            setHoldRemainingSeconds(remainingSeconds);
        };

        updateRemainingTime();
        const timer = setInterval(updateRemainingTime, 1000);

        return () => clearInterval(timer);
    }, [orderExpiredAt]);

    const syncCombosToOrder = async () => {
        if (!orderId) return true;

        try {
            await bookingService.updateOrderCombos(orderId, {
                combos: selectedCombos
                    .filter((combo) => combo.quantity > 0)
                    .map((combo) => ({ comboId: combo.comboId, quantity: combo.quantity })),
            });
            return true;
        } catch (error) {
            const { code, message } = extractApiError(error);
            if (
                code === "ORDER_EXPIRED" ||
                code === "ORDER_STATUS_INVALID" ||
                code === "ORDER_NOT_FOUND"
            ) {
                toast.error("Đơn giữ ghế đã hết hạn, vui lòng chọn lại ghế.");
                handleOrderExpired();
                return false;
            }
            toast.error(message || "Không cập nhật được combo. Vui lòng thử lại.");
            return false;
        }
    };

    const createCheckout = async () => {
        if (!orderId) return null;

        try {
            const res = await checkoutService.createCheckout({ orderId });
            return res.result;
        } catch (error) {
            const { code, message } = extractApiError(error);
            if (
                code === "ORDER_EXPIRED" ||
                code === "ORDER_STATUS_INVALID" ||
                code === "ORDER_NOT_FOUND"
            ) {
                toast.error("Đơn giữ ghế đã hết hạn, vui lòng chọn lại ghế.");
                handleOrderExpired();
                return null;
            }
            toast.error(message || "Không tạo được giao dịch thanh toán.");
            return null;
        }
    };

    const handleNext = async () => {
        if (step === 1) {
            if (selectedSeats.length === 0 || !orderId) return;
            setStep(2);
            return;
        }

        if (step === 2) {
            const synced = await syncCombosToOrder();
            if (!synced) return;
            setStep(3);
            return;
        }

        if (orderExpiredAt && new Date(orderExpiredAt).getTime() <= Date.now()) {
            toast.error("Đơn giữ ghế đã hết hạn, vui lòng chọn lại ghế.");
            handleOrderExpired();
            return;
        }

        const urlPayment = await createCheckout();
        if (!urlPayment) return;
        window.location.href = urlPayment;
    };

    const handleBack = () => {
        if (step > 1) {
            setStep((current) => (current - 1) as 1 | 2 | 3);
        }
    };

    return (
        <div>
            <div
                className="block border-b border-[#f4f4f4]"
                style={{ transform: "matrix(1, 0, 0, -1, 0, 0)" }}
            />

            <main className="booking__wrapper bg-[rgb(249,249,249)] md:pb-0">
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
                                    className={`relative mt-4 h-0.5 before:content-[''] before:absolute before:left-0 before:w-full before:h-0.75 before:bg-[#e9ecef] ${
                                        i <= step
                                            ? "after:content-[''] after:absolute after:left-0 after:w-full after:h-0.75 after:bg-[#034ea2]"
                                            : ""
                                    }`}
                                />
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="md:container md:mx-auto xl:max-w-[1390px] lg:max-w-4xl md:max-w-4xl md:px-0 sm:px-[45px] grid xl:grid-cols-3 grid-cols-1">
                    <div className="col-span-2 xl:order-first order-last xl:h-full h-full overflow-hidden xl:overflow-auto xl:pb-10 md:pb-32 pb-10">
                        {!showDetail && (
                            <div className="bg-white p-6 rounded">
                                Đang tải thông tin suất chiếu...
                            </div>
                        )}

                        {step === 1 && showDetail && selectedShowTime && showTimeId && (
                            <ChoiceSeat
                                startTime={selectedShowTime.startTime}
                                showTimeId={showTimeId}
                                userId={user?.userId}
                                orderId={orderId}
                                orderExpiredAt={orderExpiredAt}
                                selectedSeats={selectedSeats}
                                onSelectedSeatsChange={setSelectedSeats}
                                onOrderChange={handleOrderChange}
                                onOrderExpired={handleOrderExpired}
                            />
                        )}
                        {step === 2 && (
                            <ChoiceFood
                                selectedCombos={selectedCombos}
                                onChange={setSelectedCombos}
                            />
                        )}
                        {step === 3 && <Pay />}
                    </div>

                    <div className="col-span-1 xl:pl-4 xl:order-0 order-first py-4">
                        {orderExpiredAt && (
                            <div className="xl:mt-2 text-center text-xl font-semibold text-orange-500">
                                Giữ ghế còn:{" "}
                                {holdRemainingSeconds !== null
                                    ? formatCountdown(holdRemainingSeconds)
                                    : "--:--:--"}
                            </div>
                        )}
                        <div className="booking__summary md:mb-4">
                            <div className="h-[6px] bg-[rgb(245,128,32)] rounded-t-lg" />
                            <div className="bg-white p-4 grid grid-cols-3 xl:gap-2 items-center">
                                <div className="row-span-2 md:row-span-1 xl:row-span-2 block md:hidden xl:block">
                                    <img
                                        src={showDetail?.imagePortrait ?? undefined}
                                        alt={showDetail?.movieName}
                                        width={100}
                                        height={150}
                                        className="xl:w-full xl:h-full w-[78px] h-[110px] rounded object-cover"
                                        style={{ color: "transparent" }}
                                    />
                                </div>

                                <div className="flex-1 col-span-2 md:col-span-1 xl:col-span-2">
                                    <h3 className="text-sm xl:text-base font-bold xl:mb-2">
                                        {showDetail?.movieName}
                                    </h3>
                                    <p className="text-sm inline-block">
                                        {selectedShowTime?.room?.roomType?.roomTypeName}
                                    </p>
                                    {(showDetail?.minimumAge ?? 0) > 0 && (
                                        <span className="inline-flex items-center justify-center w-[38px] h-7 bg-[rgb(245,128,32)] rounded text-sm text-white font-bold ml-2">
                                            T{showDetail?.minimumAge}
                                        </span>
                                    )}
                                </div>

                                <div className="col-span-2 md:col-span-1 xl:col-span-3">

                                    
                                    <div className="xl:mt-4 text-sm xl:text-base">
                                        <strong>
                                            {selectedShowTime?.room?.cinema?.cinemaName}
                                        </strong>
                                        <span> - </span>
                                        <span>{selectedShowTime?.room?.roomName}</span>
                                    </div>
                                    <div className="xl:mt-2 text-sm xl:text-base">
                                        <span>Suất: </span>
                                        <strong>
                                            {formatTime(selectedShowTime?.startTime ?? "")}
                                        </strong>
                                    </div>
                                   

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
                                                        {group.price.toLocaleString("vi-VN")} d
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
                                                        d
                                                    </span>
                                                </div>
                                            ))}
                                        </>
                                    )}
                                </div>

                                <div className="xl:flex hidden justify-between col-span-3">
                                    <strong className="text-base">Tổng cộng</strong>
                                    <span className="font-bold text-[rgb(245,128,32)]">
                                        {calculateTotalPrice(
                                            selectedSeats,
                                            selectedCombos
                                        ).toLocaleString("vi-VN")}{" "}
                                        d
                                    </span>
                                </div>
                            </div>

                            <div className="mt-8 xl:flex hidden gap-2">
                                <button
                                    className="w-1/2 py-2 text-[rgb(245,128,32)]"
                                    onClick={handleBack}
                                    disabled={step === 1}
                                >
                                    Quay lại
                                </button>
                                <button
                                    disabled={selectedSeats.length === 0 && step === 1}
                                    onClick={handleNext}
                                    className="w-1/2 py-2 bg-[rgb(245,128,32)] text-white border rounded-md hover:bg-orange-500 disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    {step === 3 ? "Xác nhận" : "Tiếp tục"}
                                </button>
                            </div>
                        </div>

                        <div className="fixed bottom-0 left-0 right-0 h-14 bg-white flex items-center justify-between px-4 border-t border-gray-100 xl:hidden">
                            <div className="flex items-center gap-1">
                                <span className="text-sm text-gray-500">Tổng cộng:</span>
                                <span className="font-bold text-[rgb(245,128,32)]">
                                    {calculateTotalPrice(
                                        selectedSeats,
                                        selectedCombos
                                    ).toLocaleString("vi-VN")}{" "}
                                    d
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
                                    disabled={selectedSeats.length === 0 && step === 1}
                                    onClick={handleNext}
                                    className="px-4 h-10 bg-[rgb(245,128,32)] text-white text-sm rounded-md disabled:opacity-40"
                                >
                                    {step === 3 ? "Xác nhận" : "Tiếp tục"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Booking;
