import api from "../lib/axios";


export const authService = {
  signUp: async (
    fullName: string,
    password: string,
    email: string,
    phone: string,
    dateOfBirth: string
  ) => {
    const res = await api.post(
      "/auth/sign-up",
      { fullName, password, email, phone, dateOfBirth },
      { withCredentials: true }
    );

    return res.data;
  },

  signIn: async (username: string, password: string) => {
    const res = await api.post(
      "auth/sign-in",
      { username, password },
      { withCredentials: true }
    );
    return res.data; // access token
  },

  signOut: async () => {
    return api.post("/auth/sign-out", { withCredentials: true });
  },

  fetchMe: async () => {
    const res = await api.get("/me", { withCredentials: true });
    return res.data.user;
  },

  refresh: async () => {
    const res = await api.post("/auth/refresh", { withCredentials: true });
    return res.data.accessToken;
  },
};