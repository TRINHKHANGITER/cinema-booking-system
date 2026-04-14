import type { OrderEntity } from "./orders";

export type PaymentMethod =
    | "CASH"
    | "CREDIT_CARD"
    | "DEBIT_CARD"
    | "BANK_TRANSFER"
    | "E_WALLET"
    | "QR_CODE";

export type PaymentStatus = "PENDING" | "SUCCESS" | "FAILED" | "REFUNDED";

export type PaymentEntity = {
    paymentId: number;
    order: OrderEntity;
    amount: number;
    method: PaymentMethod;
    transactionId: string | null;
    providerResponse: string | null;
    paidAt: string | null;
    createdAt: string;
    updatedAt: string;
    status: PaymentStatus;
};

export type Payment = PaymentEntity;
