import api from "../lib/axios";
import type { Payment, PaymentStatus, PaymentUpdateRequest } from "../types/payment";

export const paymentService = {
    createPayment: async (request: Payment) => {
        const res = await api.post(`/payment`, request);
        return res.data;
    },

    updatePayment: async (paymentId: number, request: PaymentUpdateRequest) => {
        const res = await api.patch(`/payment/${paymentId}`, request);
        return res.data;
    },

    getPaymentByPaymentId: async (paymentId: number) => {
        const res = await api.get(`/payment/${paymentId}`);
        return res.data;
    },

    getPayments: async (status?: PaymentStatus) => {
        const res = await api.get(`/payment`, {
            params: {
                status,
            },
        });
        return res.data;
    },
};
