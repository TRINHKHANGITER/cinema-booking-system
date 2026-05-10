import type { ProvinceEntity, ProvinceResponse } from "./province";

export type CinemaStatus = "ACTIVE" | "INACTIVE" | "UNDER_MAINTENANCE";

export type CinemaEntity = {
    cinemaId: number;
    cinemaName: string;
    province: ProvinceEntity;
    addressText: string;
    description: string | null;
    status: CinemaStatus;
};

export type CinemaCreationRequest = {
    cinemaName: string;
    provinceId: number;
    addressText: string;
    description?: string | null;
    status?: CinemaStatus;
};

export type CinemaUpdateRequest = {
    cinemaName?: string;
    provinceId?: number;
    addressText?: string;
    description?: string | null;
    status?: CinemaStatus;
};

export type CinemaFilterParams = {
    cinemaId?: number;
    name?: string;
    provinceId?: number;
    status?: CinemaStatus | "";
    page?: number;
    size?: number;
};

export type CinemaResponse = CinemaEntity & {
    provinceId?: number;
    provinceName?: string;
    province?: ProvinceResponse;
};

export type Cinema = CinemaResponse;
