import type { ComboStatus } from "./combo";
import type { MovieStatus } from "./movie";
import type { MovieTypeStatus } from "./movie-type";
import type { OrderStatus } from "./order";

export type DashboardOverview = {
    startDate: string;
    endDate: string;
    totalRevenue: number;
    totalOrderCount: number;
    customerCount: number;
    movieCount: number;
    cinemaCount: number;
};

export type RevenueRankingResponse<T> = {
    startDate: string;
    endDate: string;
    totalRevenue: number;
    topN: number | null;
    sortDirection: "ASC" | "DESC";
    chartItems: T[];
    items: T[];
    totalItems: number;
    currentPage: number;
    pageSize: number;
    totalPages: number;
};

export type CinemaRevenueItem = {
    cinemaId: number;
    cinemaName: string;
    provinceId: number;
    provinceName: string;
    revenue: number;
    paidOrderCount: number;
};

export type MovieRevenueItem = {
    movieId: number;
    movieName: string;
    movieTypeId: number;
    movieTypeName: string;
    releaseDate: string | null;
    endDate: string | null;
    status: MovieStatus;
    revenue: number;
    paidOrderCount: number;
};

export type MovieTypeRevenueItem = {
    movieTypeId: number;
    movieTypeName: string;
    description: string | null;
    status: MovieTypeStatus;
    revenue: number;
    paidOrderCount: number;
};

export type ComboRevenueItem = {
    comboId: number;
    comboName: string;
    description: string | null;
    image: string | null;
    price: number;
    status: ComboStatus;
    revenue: number;
    soldQuantity: number;
    paidOrderCount: number;
};

export type OrderStatisticItem = {
    orderId: number;
    customerName: string;
    movieName: string;
    showDate: string;
    showTime: string;
    ticketQuantity: number;
    totalAmount: number;
    status: OrderStatus;
    orderCreatedAt: string;
};

export type DashboardOrderStatistics = {
    fromDate: string;
    toDate: string;
    status: OrderStatus | null;
    totalAmount: number;
    items: OrderStatisticItem[];
    totalItems: number;
    currentPage: number;
    pageSize: number;
    totalPages: number;
};

export type DashboardDateFilter = {
    startDate: string;
    endDate: string;
};

export type DashboardCinemaRevenueFilter = DashboardDateFilter & {
    provinceId?: number;
    cinemaId?: number;
    n?: number;
    sort?: "ASC" | "DESC";
    page?: number;
    size?: number;
};

export type DashboardMovieRevenueFilter = DashboardDateFilter & {
    movieId?: number;
    n?: number;
    sort?: "ASC" | "DESC";
    page?: number;
    size?: number;
};

export type DashboardMovieTypeRevenueFilter = DashboardDateFilter & {
    categoryId?: number;
    n?: number;
    sort?: "ASC" | "DESC";
    page?: number;
    size?: number;
};

export type DashboardComboRevenueFilter = DashboardDateFilter & {
    comboId?: number;
    n?: number;
    sort?: "ASC" | "DESC";
    page?: number;
    size?: number;
};

export type DashboardOrderStatisticsFilter = {
    fromDate: string;
    toDate: string;
    status?: OrderStatus;
    page?: number;
    size?: number;
};
