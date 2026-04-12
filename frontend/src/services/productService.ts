import api from "../lib/axios";
import type { ApiResponse, PagingDto } from "../types/api";
import type { Movie } from "../types/product";

const MOVIE_LIST_PATH = "/movie/all/0";

export const productService = {
  getProduct: async (params?: {
    page?: number;
    size?: number;
    status?: string;
    movieTypeId?: number;
    cinemaId?: number;
  }) => {
    const res = await api.get<ApiResponse<PagingDto<Movie>>>(MOVIE_LIST_PATH, {
      params: {
        page: params?.page ?? 1,
        size: params?.size ?? 100,
        status: params?.status ?? "ACTIVE",
        movieTypeId: params?.movieTypeId,
        cinemaId: params?.cinemaId,
      },
    });

    return res.data.result?.items ?? [];
  },

  getProductById: async (movieId: number) => {
    const res = await api.get<ApiResponse<Movie>>(`/movie/${movieId}`);
    return res.data.result;
  },

  getProductBySlug: async (slug: string) => {
    if (/^\d+$/.test(slug)) {
      return productService.getProductById(Number(slug));
    }

    const movies = await productService.getProduct({ size: 500 });
    const movie = movies.find((item) => item.slug === slug);

    if (!movie) {
      throw new Error("Movie not found");
    }

    return movie;
  },
};
