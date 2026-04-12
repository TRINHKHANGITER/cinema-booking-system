import { create } from "zustand";
import { toast } from "sonner";
import type { AuthState } from "../types/store";
import { authService } from "../services/auth.service";
/* eslint-disable @typescript-eslint/no-explicit-any */

export const useAuthStore = create<AuthState>((set, get) => ({
  accessToken: null,
  user: null,
  loading: false,

  setAccessToken: (accessToken) => {
    set({ accessToken });
  },

  clearState: () => {
    set({ accessToken: null, user: null, loading: false });
  },

  signUp: async (fullName, password, email, phone, birthDay) => {
    try {
      set({ loading: true });
      await authService.signUp(fullName, password, email, phone, birthDay);
      toast.success("Ðang ký thành công.");
    } catch (error: any) {
      console.error(error);
      if (error?.response?.status === 409) {
        toast.error("Email ho?c username dã du?c s? d?ng");
      } else {
        toast.error("Ðang ký th?t b?i");
      }
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  signIn: async (emailOrUsername, password) => {
    try {
      set({ loading: true });

      const loginResult = await authService.signIn(emailOrUsername, password);

      if (!loginResult?.authenticated || !loginResult?.accessToken) {
        throw new Error("Login failed");
      }

      get().setAccessToken(loginResult.accessToken);
      set({ user: loginResult.user });

      toast.success("Ðang nh?p thành công");
    } catch (error: any) {
      console.error(error);
      if (error?.response?.status === 400 || error?.response?.status === 401) {
        toast.error("Email/username ho?c password không dúng");
      } else {
        toast.error("Ðang nh?p th?t b?i");
      }
    } finally {
      set({ loading: false });
    }
  },

  signOut: async () => {
    get().clearState();
    await authService.signOut();
    toast.success("Ðang xu?t thành công");
  },

  fetchMe: async () => {
    return;
  },

  refresh: async () => {
    return;
  },
}));
