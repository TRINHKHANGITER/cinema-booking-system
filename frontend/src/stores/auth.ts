import { create } from "zustand";
import { toast } from "sonner";
// import { authService } from "@/services/authService";
import type { AuthState } from "../types/store";
import { authService } from "../services/auth.service";
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */

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

  signUp: async (fullName, password, email,phone,birthDay) => {
    try {
      set({ loading: true });

      //  gọi api
      await authService.signUp(fullName,password,email ,phone,birthDay);

      toast.success(
        "Đăng ký thành công!."
      );
    } catch (error :any) {
        
      console.error(error);
       if (error?.response?.status === 409) {
            
            toast.error("Email đã được sử dụng");
       }
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  signIn: async (username, password) => {
    try {
      set({ loading: true });

      const { accessToken } = await authService.signIn(username, password);
      get().setAccessToken(accessToken);

      await get().fetchMe();

      toast.success("Đăng nhập thành công");
    } catch (error: any) {
      console.error(error);
      if (error?.response?.status === 400 || error?.response?.status === 401) {
            
            toast.error("Email hoặc password không đúng");
       }
    } finally {
      set({ loading: false });
    }
  },

  signOut: async () => {
    try {
      get().clearState();
      await authService.signOut();
      toast.success("Logout thành công!");
    } catch (error) {
      console.error(error);
      toast.error("Lỗi xảy ra khi logout. Hãy thử lại!");
    }
  },

  fetchMe: async () => {
    try {
      set({ loading: true });
      const user = await authService.fetchMe();

      set({ user });
    } catch (error) {
      console.error(error);
      set({ user: null, accessToken: null });
      toast.error("Lỗi xảy ra khi lấy dữ liệu người dùng. Hãy thử lại!");
    } finally {
      set({ loading: false });
    }
  },

  refresh: async () => {
    try {
      set({ loading: true });
      const { user, fetchMe, setAccessToken } = get();
      const accessToken = await authService.refresh();

      setAccessToken(accessToken);

      if (!user) {
        await fetchMe();
      }
    } catch (error: any) {
      console.error(error);
      get().clearState();
    } finally {
      set({ loading: false });
    }
  },
}));