import { create } from "zustand";
import type { MovieState } from "../types/store";
import { productService } from "../services/productService";
import { toast } from "sonner";
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
const useMovieStore = create<MovieState>((set) => ({
  movies: [],
  selectedMovie: null,
  loading: false,
  error: null,

  fetchMovies: async () => {
    set({ loading: true, error: null });
    try {
      const products = await productService.getProduct();
      set({ movies: products.data, loading: false });
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Có lỗi xảy ra, vui lòng thử lại";

      toast.error(message);
      set({ loading: false });
      throw error;
    }
  },

  fetchMovieBySlug: async (slug: string) => {
    set({ loading: true, error: null });
    try {
      const product = await productService.getProductBySlug(slug);
      set({ selectedMovie: product.data, loading: false });
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Có lỗi xảy ra, vui lòng thử lại";

      toast.error(message);
      set({ loading: false });
      throw error;
    }
  },
}));

export default useMovieStore;
