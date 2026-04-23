import type { ApiResponse } from "./../types/api";
import api from "../lib/axios";
import type { Order, OrderCreationRequest, OrderStatus, OrderUpdateRequest } from "../types/order";

export const orderService = {
    createOrder: async (request: OrderCreationRequest) => {
        const res = await api.post(`/order`, request);
        return res.data;
    },

    updateOrder: async (orderId: number, request: OrderUpdateRequest) => {
        const res = await api.patch(`/order/${orderId}`, request);
        return res.data;
    },

    getOrderByOrderId: async (orderId: number) => {
        const res = await api.get(`/order/${orderId}`);
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
};
