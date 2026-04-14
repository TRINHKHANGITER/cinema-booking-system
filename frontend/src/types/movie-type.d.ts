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
};

export type MovieTypeUpdateRequest = {
    movieTypeName?: string;
    description?: string;
};

export type MovieTypeResponse = MovieTypeEntity;
export type MovieType = MovieTypeEntity;
