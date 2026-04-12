import { create } from "zustand";
import type { MovieState } from "../types/store";
import { productService } from "../services/productService";
import { toast } from "sonner";
/* eslint-disable @typescript-eslint/no-explicit-any */

const useMovieStore = create<MovieState>((set) => ({
  movies: [],
  selectedMovie: null,
  loading: false,
  error: null,

  fetchMovies: async () => {
    set({ loading: true, error: null });
    try {
      const movies = await productService.getProduct();
      set({ movies, loading: false });
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Có l?i x?y ra, vui lòng th? l?i";

      toast.error(message);
      set({ loading: false });
      throw error;
    }
  },

  fetchMovieBySlug: async (slug: string) => {
    set({ loading: true, error: null });
    try {
      const movie = await productService.getProductBySlug(slug);
      set({ selectedMovie: movie ?? null, loading: false });
      return movie ?? null;
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Có l?i x?y ra, vui lòng th? l?i";

      toast.error(message);
      set({ loading: false });
      throw error;
    }
  },
}));

export default useMovieStore;
