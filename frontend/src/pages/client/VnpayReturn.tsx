import { Link, useLocation } from "react-router-dom";
import type { Location } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { orderService } from "../../services/order.service";
import { checkoutService } from "../../services/checkout.service";
import type { Order } from "../../types/order";

export default function VnpayReturn() {
    const [order, setOrder] = useState<Order | null>(null);
    const location: Location = useLocation();

    const params = new URLSearchParams(location.search);
    const txnRef = params.get("vnp_TxnRef");

    useEffect(() => {
        if (!txnRef) return;

        let timeoutId: ReturnType<typeof setTimeout>;
        let isMounted = true;

        const getOrder = async () => {
            const resOrder = await orderService.getOrderByOrderId(Number(txnRef));
            return resOrder.result;
        };

        const pollOrder = async () => {
            try {
                const orderData = await getOrder();
                if (!isMounted) return;
                setOrder(orderData);

                if (orderData.status === "PAYING") {
                    timeoutId = setTimeout(pollOrder, 3000);
                }
            } catch (error) {
                console.log("Lỗi kiểm tra thanh toán: ", error);
                if (isMounted) {
                    timeoutId = setTimeout(pollOrder, 3000);
                }
            }
        };

        const syncReturnThenPoll = async () => {
            try {
                await checkoutService.handleReturn(location.search);
            } catch (error) {
                console.log("Không gọi được return callback backend: ", error);
            }

            await pollOrder();
        };

        syncReturnThenPoll();

        return () => {
            isMounted = false;
            if (timeoutId) clearTimeout(timeoutId);
        };
    }, [location.search, txnRef]);

    const orderParams = useMemo(() => {
        if (!order) return [];

        return Object.entries(order).map(([key, value]) => ({
            key,
            value: String(value),
        }));
    }, [order]);

    if (!order) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="rounded-2xl bg-white px-8 py-6 shadow-lg border border-gray-200">
                    <p className="text-lg font-medium text-gray-700 animate-pulse">
                        Đang tải thông tin đơn hàng...
                    </p>
                </div>
            </div>
        );
    }

    const isPaid = order.status === "PAID";

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-100 via-gray-100 to-slate-200 py-10 px-4">
            <div className="mx-auto max-w-4xl">
                <div className="overflow-hidden rounded-3xl bg-white shadow-2xl border border-gray-200">
                    <div className="bg-slate-900 px-8 py-6 text-white">
                        <h1 className="text-2xl font-bold">Kết quả thanh toán VNPAY</h1>
                        <p className="mt-2 text-sm text-slate-300">
                            Thông tin chi tiết đơn hàng sau khi thanh toán
                        </p>
                    </div>

                    <div className="px-8 py-6">
                        <div
                            className={`mb-6 rounded-2xl px-4 py-3 text-sm font-medium ${
                                isPaid
                                    ? "bg-green-100 text-green-700 border border-green-200"
                                    : "bg-yellow-100 text-yellow-700 border border-yellow-200"
                            }`}
                        >
                            {isPaid
                                ? "Đơn hàng đã được thanh toán thành công."
                                : "Giao dịch không thành công hoặc đã hết hạn."}
                        </div>

                        <div className="overflow-hidden rounded-2xl border border-gray-200">
                            <table className="min-w-full divide-y divide-gray-200">
                                <tbody className="divide-y divide-gray-100 bg-white">
                                    {orderParams.map((item, index) => (
                                        <tr
                                            key={item.key}
                                            className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}
                                        >
                                            <td className="w-1/3 px-5 py-4 text-sm font-semibold text-gray-700">
                                                {item.key}
                                            </td>
                                            <td className="px-5 py-4 text-sm text-gray-900 break-all">
                                                {item.value}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                            <Link
                                to="/"
                                className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                            >
                                Quay lại trang chủ
                            </Link>

                            <Link
                                to="/phim-dang-chieu"
                                className="inline-flex items-center justify-center rounded-xl border border-gray-300 bg-white px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                            >
                                Tạo giao dịch mới
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
