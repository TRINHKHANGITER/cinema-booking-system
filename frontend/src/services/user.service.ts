import api from "../lib/axios";
import type { ApiResponse, ItemListDto, PagingDto } from "../types/api";
import type {
    AdminUserCreationRequest,
    AdminUserUpdateRequest,
    Role,
    UserCreationRequest,
    UserFilterParams,
    UserResponse,
    UserStatus,
} from "../types/user";

export const userService = {
    createUser: async (request: UserCreationRequest) => {
        const res = await api.post<ApiResponse<UserResponse>>("/user", request);
        return res.data;
    },

    createUserByAdmin: async (request: AdminUserCreationRequest) => {
        const res = await api.post<ApiResponse<UserResponse>>("/user/admin", request);
        return res.data;
    },

    updateUserByAdmin: async (userId: number, request: AdminUserUpdateRequest) => {
        const res = await api.patch<ApiResponse<UserResponse>>(`/user/admin/${userId}`, request);
        return res.data;
    },

    deleteUserByAdmin: async (userId: number) => {
        const res = await api.delete<ApiResponse<boolean>>(`/user/admin/${userId}`);
        return res.data;
    },

    getUserById: async (userId: number) => {
        const res = await api.get<ApiResponse<UserResponse>>(`/user/${userId}`);
        return res.data;
    },

    getUserByEmail: async (email: string) => {
        const res = await api.get<ApiResponse<UserResponse>>(
            `/user/email/${encodeURIComponent(email)}`
        );
        return res.data;
    },

    filterUsers: async (params: UserFilterParams) => {
        const query = new URLSearchParams();
        if (params.name?.trim()) query.set("name", params.name.trim());
        if (params.role) query.set("role", params.role);
        if (params.status) query.set("status", params.status);
        query.set("page", String(params.page ?? 1));
        query.set("size", String(params.size ?? 10));

        const res = await api.get<ApiResponse<PagingDto<UserResponse>>>(
            `/user/admin?${query.toString()}`
        );
        return res.data;
    },

    getAllRoles: async () => {
        const res = await api.get<ApiResponse<ItemListDto<Role>>>("/user/roles");
        return res.data;
    },

    getAllUserStatuses: async () => {
        const res = await api.get<ApiResponse<ItemListDto<UserStatus>>>("/user/statuses");
        return res.data;
    },
};

