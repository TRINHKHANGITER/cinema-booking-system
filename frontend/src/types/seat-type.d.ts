export type SeatTypeStatus = "ACTIVE" | "INACTIVE";

export type SeatTypeEntity = {
    seatTypeId: number;
    seatTypeName: string;
    description: string | null;
    status: SeatTypeStatus;
};

export type SeatTypeCreationRequest = {
    seatTypeName: string;
    description: string;
    status?: SeatTypeStatus;
};

export type SeatTypeUpdateRequest = {
    seatTypeName?: string;
    description?: string;
    status?: SeatTypeStatus;
};

export type SeatTypeFilterParams = {
    name?: string;
    status?: SeatTypeStatus | "";
    page?: number;
    size?: number;
};

export type SeatTypeResponse = SeatTypeEntity;
export type SeatType = SeatTypeEntity;
