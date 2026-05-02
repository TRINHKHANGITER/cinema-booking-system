import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { bookingService } from "../../services/booking.service";
import { orderService } from "../../services/order.service";
import { useAppSelector } from "../../stores/hooks";
import type { Order, OrderDetail, OrderStatus } from "../../types/order";
import { formatTime } from "../../utils/utils";

type TabKey = "all" | "paying";

type OrderHistoryItem = {
    summary: Order;
    detail: OrderDetail | null;
};

const TABS: Array<{ key: TabKey; label: string }> = [
    { key: "paying", label: "Dang cho thanh toan" },
    { key: "all", label: "Tat ca" },
];

const STATUS_LABEL: Record<OrderStatus, string> = {
    PAYING: "Dang cho thanh toan",
    PAID: "Da thanh toan",
    CANCELLED: "Da huy",
    REFUNDED: "Da hoan tien",
    EXPIRED: "Da het han",
};

const STATUS_STYLE: Record<OrderStatus, string> = {
    PAYING: "bg-amber-100 text-amber-700 border-amber-200",
    PAID: "bg-emerald-100 text-emerald-700 border-emerald-200",
    CANCELLED: "bg-rose-100 text-rose-700 border-rose-200",
    REFUNDED: "bg-sky-100 text-sky-700 border-sky-200",
    EXPIRED: "bg-slate-100 text-slate-600 border-slate-200",
};

const toDateText = (value?: string | null) => {
    if (!value) return "Dang cap nhat";
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return value;
    return parsed.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    });
};

const toDateTimeText = (value?: string | null) => {
    if (!value) return "Dang cap nhat";
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return value;
    return parsed.toLocaleString("vi-VN");
};

const formatMoney = (value?: number | null) => {
    return `${Number(value ?? 0).toLocaleString("vi-VN")} d`;
};

const parseTab = (value: string | null): TabKey => {
    if (value === "paying") return "paying";
    return "all";
};

const toMovieSlug = (movieName?: string | null, fallbackId?: number | null) => {
    const normalizedName = String(movieName ?? "")
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\u0111/g, "d")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

    if (normalizedName) return normalizedName;
    return fallbackId ? String(fallbackId) : "";
};

const lineStatusLabel = (status?: string | null) => {
    if (!status) return "ACTIVE";
    return status;
};

const OrderHistoryPage = () => {
    const navigate = useNavigate();
    const user = useAppSelector((state) => state.auth.user);
    const [searchParams, setSearchParams] = useSearchParams();

    const [loading, setLoading] = useState(false);
    const [items, setItems] = useState<OrderHistoryItem[]>([]);
    const [runningOrderId, setRunningOrderId] = useState<number | null>(null);
    const [expandedOrderIds, setExpandedOrderIds] = useState<number[]>([]);

    const activeTab = useMemo(() => parseTab(searchParams.get("tab")), [searchParams]);

    const fetchOrders = useCallback(async () => {
        if (!user?.userId) {
            setItems([]);
            return;
        }

        setLoading(true);
        try {
            const status = activeTab === "paying" ? "PAYING" : undefined;
            const response = await orderService.getOrders(status);
            const orders = (response.result ?? [])
                .filter((order) => order.userId === user.userId)
                .sort((first, second) => {
                    return new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime();
                });

            const detailResults = await Promise.all(
                orders.map(async (order) => {
                    try {
                        const detailResponse = await orderService.getOrderDetailByOrderId(order.orderId);
                        return {
                            summary: order,
                            detail: detailResponse.result ?? null,
                        } as OrderHistoryItem;
                    } catch {
                        return {
                            summary: order,
                            detail: null,
                        } as OrderHistoryItem;
                    }
                })
            );

            setItems(detailResults);
            setExpandedOrderIds((prev) =>
                prev.filter((orderId) => detailResults.some((item) => item.summary.orderId === orderId))
            );
        } catch {
            setItems([]);
            toast.error("Khong the tai lich su dat ve.");
        } finally {
            setLoading(false);
        }
    }, [activeTab, user?.userId]);

    useEffect(() => {
        void fetchOrders();
    }, [fetchOrders]);

    const handleChangeTab = (tab: TabKey) => {
        const next = new URLSearchParams(searchParams);
        if (tab === "all") {
            next.delete("tab");
        } else {
            next.set("tab", tab);
        }
        setSearchParams(next);
    };

    const toggleDetail = (orderId: number) => {
        setExpandedOrderIds((prev) =>
            prev.includes(orderId) ? prev.filter((id) => id !== orderId) : [...prev, orderId]
        );
    };

    const handleCancelOrder = async (orderId: number) => {
        const confirmed = window.confirm("Ban co chac muon huy don nay khong?");
        if (!confirmed) return;

        setRunningOrderId(orderId);
        try {
            await bookingService.cancelOrder(orderId);
            toast.success("Da huy don thanh cong.");
            await fetchOrders();
        } catch {
            toast.error("Khong the huy don. Vui long thu lai.");
        } finally {
            setRunningOrderId(null);
        }
    };

    const handleContinueOrder = (item: OrderHistoryItem) => {
        const showTimeId = item.detail?.showTime?.showTimeId ?? item.summary.showTimeId;
        const movieId = item.detail?.showTime?.movieId ?? showTimeId;
        const movieSlug = toMovieSlug(item.detail?.showTime?.movieName, movieId);
        if (!showTimeId) {
            toast.error("Khong tim thay thong tin suat chieu de tiep tuc.");
            return;
        }

        navigate(`/dat-ve/${movieSlug || movieId}/showtime/${showTimeId}`, {
            state: {
                showTimeId,
                resumeOrderId: item.summary.orderId,
                resumeOrderExpiredAt: item.summary.expiredAt,
                orderDetail: item.detail,
                resumeFromHistory: true,
            },
        });
    };

    if (!user) {
        return (
            <div className="mx-auto w-full max-w-4xl px-4 py-12">
                <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
                    <h1 className="text-2xl font-bold text-slate-800">Lich su dat ve</h1>
                    <p className="mt-3 text-slate-500">
                        Vui long dang nhap de xem lich su don hang cua ban.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-[#f7f8fb] py-8">
            <div className="mx-auto w-full max-w-6xl px-4">
                <div className="mb-6 rounded-2xl bg-gradient-to-r from-[#034ea2] to-[#0f6dd3] p-6 text-white shadow-lg">
                    <h1 className="text-2xl font-bold md:text-3xl">Lich su dat ve</h1>
                    <p className="mt-2 text-sm text-blue-100 md:text-base">
                        Quan ly don hang, tiep tuc thanh toan hoac huy don cho.
                    </p>
                </div>

                <div className="mb-6 flex flex-wrap gap-3">
                    {TABS.map((tab) => {
                        const active = activeTab === tab.key;
                        return (
                            <button
                                key={tab.key}
                                type="button"
                                onClick={() => handleChangeTab(tab.key)}
                                className={[
                                    "rounded-full border px-4 py-2 text-sm font-semibold transition",
                                    active
                                        ? "border-[#034ea2] bg-[#034ea2] text-white"
                                        : "border-slate-200 bg-white text-slate-700 hover:border-[#034ea2] hover:text-[#034ea2]",
                                ].join(" ")}
                            >
                                {tab.label}
                            </button>
                        );
                    })}
                </div>

                {loading ? (
                    <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500">
                        Dang tai lich su don hang...
                    </div>
                ) : items.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">
                        Khong co don hang phu hop voi bo loc hien tai.
                    </div>
                ) : (
                    <div className="space-y-5">
                        {items.map((item) => {
                            const order = item.summary;
                            const detail = item.detail;
                            const seats = detail?.seats ?? [];
                            const combos = detail?.combos ?? [];
                            const activeSeatCount = seats.filter(
                                (seat) => seat.ticketStatus === null || seat.ticketStatus === "ACTIVE"
                            ).length;
                            const activeComboQuantity = combos
                                .filter((combo) => combo.status === null || combo.status === "ACTIVE")
                                .reduce((sum, combo) => sum + combo.quantity, 0);
                            const isExpanded = expandedOrderIds.includes(order.orderId);
                            const isRunning = runningOrderId === order.orderId;

                            return (
                                <article
                                    key={order.orderId}
                                    className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-md"
                                >
                                    <div className="absolute left-0 top-0 h-full w-2 bg-gradient-to-b from-[#f58020] to-[#fbb26f]" />
                                    <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr]">
                                        <div className="p-5 md:p-6">
                                            <div className="mb-4 flex flex-wrap items-center gap-3">
                                                <span className="text-sm font-semibold text-slate-500">
                                                    Ma don #{order.orderId}
                                                </span>
                                                <span
                                                    className={[
                                                        "rounded-full border px-3 py-1 text-xs font-semibold",
                                                        STATUS_STYLE[order.status],
                                                    ].join(" ")}
                                                >
                                                    {STATUS_LABEL[order.status]}
                                                </span>
                                                <span className="text-xs text-slate-400">
                                                    Tao luc: {toDateTimeText(order.createdAt)}
                                                </span>
                                            </div>

                                            <h2 className="text-xl font-bold text-slate-800">
                                                {detail?.showTime.movieName ?? `Phim #${order.showTimeId}`}
                                            </h2>

                                            <div className="mt-4 grid grid-cols-1 gap-3 text-sm text-slate-600 md:grid-cols-2">
                                                <p>
                                                    <strong>Rap:</strong>{" "}
                                                    {detail?.showTime.cinemaName ?? "Dang cap nhat"}
                                                </p>
                                                <p>
                                                    <strong>Phong:</strong>{" "}
                                                    {detail?.showTime.roomName ?? "Dang cap nhat"}
                                                </p>
                                                <p>
                                                    <strong>Ngay chieu:</strong>{" "}
                                                    {toDateText(detail?.showTime.releaseDate)}
                                                </p>
                                                <p>
                                                    <strong>Gio chieu:</strong>{" "}
                                                    {formatTime(detail?.showTime.startTime ?? "") || "Dang cap nhat"}
                                                </p>
                                                <p>
                                                    <strong>So luong ve active:</strong> {activeSeatCount}
                                                </p>
                                                <p>
                                                    <strong>So luong combo active:</strong> {activeComboQuantity}
                                                </p>
                                            </div>

                                            {isExpanded && (
                                                <div className="mt-4 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
                                                    <p className="font-semibold text-slate-700">Thong tin ve</p>
                                                    {seats.length === 0 ? (
                                                        <p className="mt-1 text-slate-500">Khong co ve.</p>
                                                    ) : (
                                                        <ul className="mt-2 space-y-1">
                                                            {seats.map((seat) => (
                                                                <li
                                                                    key={`seat-${seat.ticketId ?? seat.seatId}`}
                                                                    className="flex items-center justify-between gap-3"
                                                                >
                                                                    <span>
                                                                        {seat.seatLabel} - {seat.seatTypeName}
                                                                    </span>
                                                                    <span className="text-xs font-semibold text-slate-500">
                                                                        {lineStatusLabel(seat.ticketStatus)}
                                                                    </span>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    )}
                                                    <p className="mt-3 font-semibold text-slate-700">
                                                        Thong tin combo
                                                    </p>
                                                    {combos.length === 0 ? (
                                                        <p className="mt-1 text-slate-500">Khong co combo.</p>
                                                    ) : (
                                                        <ul className="mt-2 space-y-1">
                                                            {combos.map((combo) => (
                                                                <li
                                                                    key={`combo-${combo.orderComboId}`}
                                                                    className="flex items-center justify-between gap-3"
                                                                >
                                                                    <span>
                                                                        {combo.quantity}x {combo.comboName}
                                                                    </span>
                                                                    <span className="text-xs font-semibold text-slate-500">
                                                                        {lineStatusLabel(combo.status)}
                                                                    </span>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        <div className="border-t border-dashed border-slate-200 bg-[#fff9f3] p-5 md:border-l md:border-t-0 md:p-6">
                                            <div className="text-sm text-slate-500">
                                                <p className="flex items-center justify-between">
                                                    <span>Tien ve</span>
                                                    <strong>{formatMoney(detail?.ticketTotal ?? order.ticketTotal)}</strong>
                                                </p>
                                                <p className="mt-2 flex items-center justify-between">
                                                    <span>Tien combo</span>
                                                    <strong>{formatMoney(detail?.comboTotal ?? order.comboTotal)}</strong>
                                                </p>
                                                <p className="mt-2 flex items-center justify-between">
                                                    <span>Giam gia</span>
                                                    <strong>
                                                        {formatMoney(detail?.discountAmount ?? order.discountAmount)}
                                                    </strong>
                                                </p>
                                            </div>

                                            <div className="my-4 border-t border-dashed border-slate-300" />

                                            <p className="flex items-end justify-between">
                                                <span className="text-sm font-semibold text-slate-600">Tong tien</span>
                                                <span className="text-2xl font-extrabold text-[#f58020]">
                                                    {formatMoney(detail?.netAmount ?? order.netAmount)}
                                                </span>
                                            </p>

                                            <div className="mt-4 grid grid-cols-1 gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => toggleDetail(order.orderId)}
                                                    className="rounded-lg border border-[#034ea2] bg-white px-3 py-2 text-sm font-semibold text-[#034ea2] transition hover:bg-[#034ea2] hover:text-white"
                                                >
                                                    {isExpanded ? "An chi tiet" : "Xem chi tiet"}
                                                </button>

                                                {order.status === "PAYING" && (
                                                    <>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleCancelOrder(order.orderId)}
                                                            disabled={isRunning}
                                                            className="rounded-lg border border-rose-200 bg-white px-3 py-2 text-sm font-semibold text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
                                                        >
                                                            Huy don
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleContinueOrder(item)}
                                                            disabled={isRunning}
                                                            className="rounded-lg bg-[#f58020] px-3 py-2 text-sm font-semibold text-white transition hover:bg-[#de6f13] disabled:cursor-not-allowed disabled:opacity-60"
                                                        >
                                                            Tiep tuc thanh toan
                                                        </button>
                                                        <p className="text-xs text-slate-500">
                                                            Het han giu cho: {toDateTimeText(order.expiredAt)}
                                                        </p>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrderHistoryPage;
