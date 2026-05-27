import { create } from "zustand";
import { axiosInstance } from "./axios";

export interface User {
  id: string;
  email: string;
  display_name: string | null;
  avatar_url: string | null;
  email_verified: boolean;
  phone: string | null;
  phone_verified: boolean;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isHydrating: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
  hydrate: () => Promise<void>;
  setUser: (user: User) => void;
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isHydrating: false,
  login: (user, token) => {
    localStorage.setItem("auth_token", token);
    set({ user, isAuthenticated: true });
  },
  logout: () => {
    localStorage.removeItem("auth_token");
    set({ user: null, isAuthenticated: false });
  },
  hydrate: async () => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      set({ isHydrating: false });
      return;
    }

    set({ isHydrating: true });
    try {
      const response = await axiosInstance.get<User>("/users/me");
      set({ user: response.data, isAuthenticated: true, isHydrating: false });
    } catch {
      localStorage.removeItem("auth_token");
      set({ user: null, isAuthenticated: false, isHydrating: false });
    }
  },
  setUser: (user) => {
    set({ user });
  },
}));
