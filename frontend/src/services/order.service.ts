import api from "../lib/axios";
import type { ApiResponse, ItemListDto, PagingDto } from "../types/api";
import type {
    Order,
    OrderCreationRequest,
    OrderDetail,
    OrderFilterParams,
    OrderStatus,
    OrderStatusUpdateRequest,
    OrderUpdateRequest,
} from "../types/order";

export const orderService = {
    createOrder: async (request: OrderCreationRequest) => {
        const res = await api.post<ApiResponse<Order>>(`/order`, request);
        return res.data;
    },

    updateOrder: async (orderId: number, request: OrderUpdateRequest) => {
        const res = await api.patch<ApiResponse<Order>>(`/order/${orderId}`, request);
        return res.data;
    },

    updateOrderStatus: async (orderId: number, request: OrderStatusUpdateRequest) => {
        const res = await api.patch<ApiResponse<Order>>(`/order/${orderId}/status`, request);
        return res.data;
    },

    getOrderByOrderId: async (orderId: number) => {
        const res = await api.get<ApiResponse<Order>>(`/order/${orderId}`);
        return res.data;
    },

    getOrderDetailByOrderId: async (orderId: number) => {
        const res = await api.get<ApiResponse<OrderDetail>>(`/order/${orderId}/detail`);
        return res.data;
    },

    getOrders: async (status?: OrderStatus) => {
        const res = await api.get<ApiResponse<Order[]>>(`/order`, {
            params: {
                status,
            },
        });
        return res.data;
    },

    filterOrders: async (params: OrderFilterParams) => {
        const query = new URLSearchParams();
        if (params.orderId) query.set("orderId", String(params.orderId));
        if (params.customerName?.trim()) query.set("customerName", params.customerName.trim());
        if (params.email?.trim()) query.set("email", params.email.trim());
        if (params.phone?.trim()) query.set("phone", params.phone.trim());
        if (params.showTimeId) query.set("showTimeId", String(params.showTimeId));
        if (params.status) query.set("status", params.status);
        query.set("page", String(params.page ?? 1));
        query.set("size", String(params.size ?? 10));

        const res = await api.get<ApiResponse<PagingDto<Order>>>(
            `/order/filter?${query.toString()}`
        );
        return res.data;
    },

    getAllOrderStatuses: async () => {
        const res = await api.get<ApiResponse<ItemListDto<OrderStatus>>>("/order/statuses");
        return res.data;
    },
};
