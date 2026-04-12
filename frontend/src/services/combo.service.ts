import api from "../lib/axios";
import type { ApiResponse, PagingDto } from "../types/api";
import type { comboFood } from "../types/combo";

type TicketTypeItem = {
  ticketTypeId: number;
  ticketTypeName: string;
  description: string | null;
  status: string;
};

export const comboService = {
  getCombo: async (): Promise<comboFood[]> => {
    const res = await api.get<ApiResponse<PagingDto<TicketTypeItem>>>(
      "/ticket-type/all",
      {
        params: {
          status: "ACTIVE",
          page: 1,
          size: 100,
        },
      },
    );

    const items = res.data.result?.items ?? [];

    return items.map((item) => ({
      comboId: item.ticketTypeId,
      comboName: item.ticketTypeName,
      description: item.description ?? "",
      price: 0,
      status: item.status,
    }));
  },
};
