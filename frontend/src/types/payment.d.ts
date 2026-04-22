export type PaymentMethod =
    | "CASH"
    | "CARD"
    | "BANK_TRANSFER"
    | "E_WALLET"
    | string;

export const PaymentMethodDescription: Record<PaymentMethod, string>;

export type PaymentStatus =
    | "PENDING"
    | "SUCCESS"
    | "FAILED"
    | "EXPIRED"
    | "CANCELLED";

export const PaymentStatusDescription: Record<PaymentStatus, string>;

export type PaymentEntity = {
    paymentId: number;
    orderId: number;
    amount: number;
    method: PaymentMethod;
    bankCode?: string | null;
    bankTransactionNo?: string | null;
    transactionId: string | null;
    infoTransaction: string | null;
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
