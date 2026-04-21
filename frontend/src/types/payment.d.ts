export type PaymentMethod =
    | "CASH"
    | "CARD"
    | "BANK_TRANSFER"
    | "E_WALLET";

export const PaymentMethodDescription: Record<PaymentMethod, string>;

export type PaymentStatus =
    | "PENDING"
    | "PAID"
    | "FAILED"
    | "EXPIRED"
    | "CANCELLED";

export const PaymentStatusDescription: Record<PaymentStatus, string>;

export type PaymentEntity = {
    paymentId: number;
    orderId: number;
    amount: number;
    method: PaymentMethod;
    transactionId: string | null;
    infoTransaction: string | null;
    providerPayload: string | null;
    paidAt: string | null;
    createdAt: string;
    updatedAt: string;
    status: PaymentStatus;
};

export type PaymentCreationRequest = {
    orderId: number;
    amount: number;
};

export type PaymentUpdateRequest = {
    orderId: number;
};

export type Payment = PaymentEntity;
export type PaymentResponse = PaymentEntity;
