'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { User, UserRole } from '@/types';
import { authApi } from '@/services/auth.service';
import { socketService } from '@/lib/socket';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  
  // Actions
  login: (email: string, password: string) => Promise<void>;
  register: (data: { email: string; password: string; firstName: string; lastName: string }) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateUser: (data: Partial<User>) => void;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      isInitialized: false,

      login: async (email: string, password: string) => {
        set({ isLoading: true });
        try {
          const { user, tokens } = await authApi.login({ email, password });
          
          // Connect to WebSocket with token
          socketService.connect(tokens.accessToken);
          
          set({ user, isAuthenticated: true, isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      register: async (data) => {
        set({ isLoading: true });
        try {
          const { user, tokens } = await authApi.register(data);
          
          // Connect to WebSocket with token
          socketService.connect(tokens.accessToken);
          
          set({ user, isAuthenticated: true, isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: async () => {
        set({ isLoading: true });
        try {
          await authApi.logout();
        } finally {
          // Disconnect WebSocket
          socketService.disconnect();
          
          set({ user: null, isAuthenticated: false, isLoading: false });
        }
      },

      refreshUser: async () => {
        try {
          const user = await authApi.getProfile();
          set({ user });
        } catch (error) {
          // If refresh fails, log out
          get().logout();
        }
      },

      updateUser: (data: Partial<User>) => {
        const { user } = get();
        if (user) {
          set({ user: { ...user, ...data } });
        }
      },

      initialize: async () => {
        if (get().isInitialized) return;
        
        set({ isLoading: true });
        
        try {
          if (authApi.hasTokens()) {
            const user = await authApi.getProfile();
            
            // Connect to WebSocket
            const token = authApi.getAccessToken();
            if (token) {
              socketService.connect(token);
            }
            
            set({ user, isAuthenticated: true });
          }
        } catch (error) {
          // Token is invalid, clear it
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
        } finally {
          set({ isLoading: false, isInitialized: true });
        }
      },
    }),
    {
      name: 'youshop-auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Custom hook for auth
export const useAuth = () => {
  const store = useAuthStore();
  
  return {
    user: store.user,
    isAuthenticated: store.isAuthenticated,
    isLoading: store.isLoading,
    isInitialized: store.isInitialized,
    isAdmin: store.user?.role?.toString().toUpperCase() === 'ADMIN',
    login: store.login,
    register: store.register,
    logout: store.logout,
    refreshUser: store.refreshUser,
    updateUser: store.updateUser,
    initialize: store.initialize,
  };
};
