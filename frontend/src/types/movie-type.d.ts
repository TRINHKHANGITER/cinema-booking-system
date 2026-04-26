export type MovieTypeStatus = "ACTIVE" | "INACTIVE";

export type MovieTypeEntity = {
    movieTypeId: number;
    movieTypeName: string;
    description: string | null;
    status: MovieTypeStatus;
};

export type MovieTypeCreationRequest = {
    movieTypeName: string;
    description: string;
    status?: MovieTypeStatus;
};

export type MovieTypeUpdateRequest = {
    movieTypeName?: string;
    description?: string;
    status?: MovieTypeStatus;
};

export type MovieTypeFilterParams = {
    name?: string;
    status?: MovieTypeStatus | "";
    page?: number;
    size?: number;
};

export type MovieTypeResponse = MovieTypeEntity;
export type MovieType = MovieTypeEntity;
