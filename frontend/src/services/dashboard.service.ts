import api from "../lib/axios";
import type { ApiResponse } from "../types/api";
import type {
    CinemaRevenueItem,
    ComboRevenueItem,
    DashboardCinemaRevenueFilter,
    DashboardComboRevenueFilter,
    DashboardDateFilter,
    DashboardMovieRevenueFilter,
    DashboardMovieTypeRevenueFilter,
    DashboardOrderStatistics,
    DashboardOrderStatisticsFilter,
    DashboardOverview,
    MovieRevenueItem,
    MovieTypeRevenueItem,
    RevenueRankingResponse,
} from "../types/dashboard";

export const dashboardService = {
    getOverview: async (params: DashboardDateFilter) => {
        const res = await api.get<ApiResponse<DashboardOverview>>("/dashboard/overview", { params });
        return res.data;
    },

    getCustomerCount: async () => {
        const res = await api.get<ApiResponse<number>>("/dashboard/customers/count");
        return res.data;
    },

    getMovieCount: async () => {
        const res = await api.get<ApiResponse<number>>("/dashboard/movies/count");
        return res.data;
    },

    getCinemaCount: async () => {
        const res = await api.get<ApiResponse<number>>("/dashboard/cinemas/count");
        return res.data;
    },

    getRevenueByCinema: async (params: DashboardCinemaRevenueFilter) => {
        const res = await api.get<ApiResponse<RevenueRankingResponse<CinemaRevenueItem>>>(
            "/dashboard/revenue/cinemas",
            {
                params,
            }
        );
        return res.data;
    },

    getRevenueByMovie: async (params: DashboardMovieRevenueFilter) => {
        const res = await api.get<ApiResponse<RevenueRankingResponse<MovieRevenueItem>>>(
            "/dashboard/revenue/movies",
            {
                params,
            }
        );
        return res.data;
    },

    getRevenueByMovieType: async (params: DashboardMovieTypeRevenueFilter) => {
        const res = await api.get<ApiResponse<RevenueRankingResponse<MovieTypeRevenueItem>>>(
            "/dashboard/revenue/movie-types",
            {
                params,
            }
        );
        return res.data;
    },

    getRevenueByCombo: async (params: DashboardComboRevenueFilter) => {
        const res = await api.get<ApiResponse<RevenueRankingResponse<ComboRevenueItem>>>(
            "/dashboard/revenue/combos",
            {
                params,
            }
        );
        return res.data;
    },

    getOrderStatistics: async (params: DashboardOrderStatisticsFilter) => {
        const res = await api.get<ApiResponse<DashboardOrderStatistics>>("/dashboard/orders/statistics", {
            params,
        });
        return res.data;
    },
};
