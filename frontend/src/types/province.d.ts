export type ProvinceStatus = "ACTIVE" | "INACTIVE";

export type ProvinceEntity = {
    provinceId: number;
    provinceName: string;
    status: ProvinceStatus;
};

export type ProvinceResponse = ProvinceEntity;
export type Province = ProvinceEntity;
