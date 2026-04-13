export type SeatTypeStatus = "ACTIVE" | "INACTIVE";

export type SeatTypeCreationRequest = {
    seatTypeName: string;
    description: string;
};

export type SeatTypeUpdateRequest = {
    seatTypeName?: string;
    description?: string;
};

export type SeatTypeResponse = {
    seatTypeId: number;
    seatTypeName: string;
    description: string | null;
    status: SeatTypeStatus;
};

export type SeatType = SeatTypeResponse;
