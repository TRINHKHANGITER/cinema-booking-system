import api from "../lib/axios";
import type { ApiResponse, ItemListDto, PagingDto } from "../types/api";
import type {
    Combo,
    ComboCreationRequest,
    ComboFilterParams,
    ComboResponse,
    ComboStatus,
    ComboUpdateRequest,
} from "../types/combo";

const appendIfDefined = (form: FormData, key: string, value: unknown) => {
    if (value === undefined || value === null) return;

    if (value instanceof File) {
        form.append(key, value);
        return;
    }

    form.append(key, String(value));
};

const toComboFormData = (request: ComboCreationRequest | ComboUpdateRequest) => {
    const form = new FormData();
    appendIfDefined(form, "comboName", request.comboName);
    appendIfDefined(form, "description", request.description);
    appendIfDefined(form, "price", request.price);
    appendIfDefined(form, "status", request.status);
    appendIfDefined(form, "image", request.image);
    return form;
};

export const comboService = {
    getComboById: async (comboId: number) => {
        const res = await api.get<ApiResponse<ComboResponse>>(`/combo/${comboId}`);
        return res.data;
    },

    getCombos: async (status?: ComboStatus) => {
        const res = await api.get<ApiResponse<Combo[]>>(`/combo`, {
            params: { status },
        });
        return res.data;
    },

    filterCombos: async (params: ComboFilterParams) => {
        const query = new URLSearchParams();
        if (params.comboId) query.set("comboId", String(params.comboId));
        if (params.name?.trim()) query.set("name", params.name.trim());
        if (params.status) query.set("status", params.status);
        query.set("page", String(params.page ?? 1));
        query.set("size", String(params.size ?? 10));

        const res = await api.get<ApiResponse<PagingDto<ComboResponse>>>(
            `/combo/filter?${query.toString()}`
        );
        return res.data;
    },

    getAllComboStatuses: async () => {
        const res = await api.get<ApiResponse<ItemListDto<ComboStatus>>>("/combo/statuses");
        return res.data;
    },

    createCombo: async (request: ComboCreationRequest | FormData) => {
        const payload = request instanceof FormData ? request : toComboFormData(request);
        const res = await api.post<ApiResponse<ComboResponse>>("/combo", payload, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        return res.data;
    },

    updateCombo: async (comboId: number, request: ComboUpdateRequest | FormData) => {
        const payload = request instanceof FormData ? request : toComboFormData(request);
        const res = await api.patch<ApiResponse<ComboResponse>>(`/combo/${comboId}`, payload, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        return res.data;
    },

    deleteCombo: async (comboId: number) => {
        const res = await api.delete<ApiResponse<boolean>>(`/combo/${comboId}`);
        return res.data;
    },
};
