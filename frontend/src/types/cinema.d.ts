import type { ProvinceResponse } from "./province";

export type CinemaStatus = "ACTIVE" | "INACTIVE" | "UNDER_MAINTENANCE";

export type CinemaCreationRequest = {
    cinemaName: string;
    provinceId: number;
    address: string;
    description?: string | null;
};

export type CinemaUpdateRequest = {
    cinemaName?: string;
    provinceId?: number;
    address?: string;
    description?: string | null;
};

export type CinemaResponse = {
    cinemaId: number;
    cinemaName: string;
    province: ProvinceResponse;
    provinceId: number;
    provinceName: string;
    addressText: string;
    description: string | null;
    status: CinemaStatus;
};

export type Cinema = CinemaResponse;
