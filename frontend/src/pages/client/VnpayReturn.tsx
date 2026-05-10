import { Link, useLocation } from "react-router-dom";
import type { Location } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { orderService } from "../../services/order.service";
import { checkoutService } from "../../services/checkout.service";
import type { Order } from "../../types/order";
import { showTimeService } from "../../services/showtimeService";
import type { User } from "../../types/user";
import type { Showtime } from "../../types/showtime";

type CheckoutContext = {
    source?: "ADMIN" | "CLIENT";
    orderId?: number;
};

export default function VnpayReturn() {
    const [order, setOrder] = useState<Order | null>(null);
    const location: Location = useLocation();

    const params = new URLSearchParams(location.search);
    const txnRef = params.get("vnp_TxnRef");
    const orderId = useMemo(() => {
        if (!txnRef) return null;
        const matched = txnRef.match(/^\d+/);
        if (!matched) return null;
        const parsedOrderId = Number.parseInt(matched[0], 10);
        return Number.isNaN(parsedOrderId) ? null : parsedOrderId;
    }, [txnRef]);

    const isAdminCheckout = useMemo(() => {
        try {
            const raw = sessionStorage.getItem("ORDER_CHECKOUT_CONTEXT");
            if (!raw || !orderId) return false;
            const context = JSON.parse(raw) as CheckoutContext;
            return context.source === "ADMIN" && context.orderId === orderId;
        } catch {
            return false;
        }
    }, [orderId]);

    useEffect(() => {
        if (!orderId) return;

        let timeoutId: ReturnType<typeof setTimeout>;
        let isMounted = true;

        const getOrder = async () => {
            const response = await orderService.getOrderByOrderId(orderId);
            return response.result;
        };

        const pollOrder = async () => {
            try {
                const orderData = await getOrder();
                if (!isMounted) return;
                setOrder(orderData);
                if (orderData?.status === "PAYING") {
                    timeoutId = setTimeout(pollOrder, 3000);
                }
            } catch {
                if (isMounted) {
                    timeoutId = setTimeout(pollOrder, 3000);
                }
            }
        };

        const syncReturnThenPoll = async () => {
            try {
                await checkoutService.handleReturn(location.search);
            } catch {}
            await pollOrder();
        };

        void syncReturnThenPoll();

        return () => {
            isMounted = false;
            if (timeoutId) clearTimeout(timeoutId);
        };
    }, [location.search, orderId]);

    useEffect(() => {
        if (!order) return;
        sessionStorage.removeItem("ORDER_CHECKOUT_CONTEXT");
    }, [order]);

    const orderParams = useMemo(() => {
        if (!order) return [];
        return Object.entries(order).map(([key, value]) => ({
            key,
            value: String(value),
        }));
    }, [order]);

    if (!order) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="rounded-xl bg-white px-8 py-6 border border-gray-200 shadow-sm">
                    <p className="text-sm font-medium text-gray-500 animate-pulse">
                        Đang tải thông tin đơn hàng...
                    </p>
                </div>
            </div>
        );
    }

    const isPaid = order.status === "PAID";

    return (
        <div className="min-h-screen bg-gray-50 py-10 px-4">
            <div className="mx-auto max-w-4xl">
                <div className="overflow-hidden rounded-2xl bg-white border border-gray-200 shadow-sm">

                    {/* Header */}
                    <div className="bg-gray-50 border-b border-gray-200 px-8 py-5">
                        <h1 className="text-lg font-medium text-gray-900">
                            Kết quả thanh toán VNPAY
                        </h1>
                        <p className="mt-1 text-sm text-gray-500">
                            Thông tin chi tiết đơn hàng sau khi thanh toán
                        </p>
                    </div>

                    <div className="px-8 py-6">

                        {/* Status badge */}
                        <div
                            className={`mb-6 inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium ${
                                isPaid
                                    ? "bg-green-50 text-green-700 border border-green-200"
                                    : "bg-yellow-50 text-yellow-700 border border-yellow-200"
                            }`}
                        >
                            {isPaid
                                ? "Đơn hàng đã được thanh toán thành công."
                                : "Giao dịch thất bại hoặc đã hết hạn."}
                        </div>

                        {/* Order detail table */}
                        <div className="overflow-hidden rounded-xl border border-gray-200 mb-8">
                            <table className="min-w-full divide-y divide-gray-200">
                                <tbody className="divide-y divide-gray-100 bg-white">
                                    {orderParams.map((item, index) => (
                                        <tr
                                            key={item.key}
                                            className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}
                                        >
                                            <td className="w-1/3 px-5 py-3 text-sm font-medium text-gray-500">
                                                {item.key}
                                            </td>
                                            <td className="px-5 py-3 text-sm text-gray-900 break-all">
                                                {item.value}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Action buttons */}
                        <div className="flex flex-col gap-3 sm:flex-row">
                            <Link
                                to="/"
                                className="inline-flex items-center justify-center rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800"
                            >
                                Về trang chủ
                            </Link>

                            <Link
                                to="/phim-dang-chieu"
                                className="inline-flex items-center justify-center rounded-xl border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                            >
                                Tạo giao dịch mới
                            </Link>

                            {isAdminCheckout && (
                                <Link
                                    to="/admin/orders"
                                    className="inline-flex items-center justify-center rounded-xl border border-orange-400 bg-white px-5 py-2.5 text-sm font-medium text-orange-500 transition hover:bg-orange-500 hover:text-white hover:border-orange-500"
                                >
                                    Về quản lý đơn hàng
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}