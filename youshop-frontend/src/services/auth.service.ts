import apiClient, { handleApiError } from '@/lib/api-client';
import { User, AuthTokens, LoginCredentials, RegisterData, ApiResponse } from '@/types';

const AUTH_PREFIX = '/auth';

export const authApi = {
  // Login
  login: async (credentials: LoginCredentials): Promise<{ user: User; tokens: AuthTokens }> => {
    try {
      const response = await apiClient.post<ApiResponse<{ user: User; tokens: AuthTokens }>>(
        `${AUTH_PREFIX}/login`,
        credentials
      );
      
      const { tokens } = response.data.data;
      
      // Store tokens
      localStorage.setItem('accessToken', tokens.accessToken);
      localStorage.setItem('refreshToken', tokens.refreshToken);
      
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Register
  register: async (data: RegisterData): Promise<{ user: User; tokens: AuthTokens }> => {
    try {
      const response = await apiClient.post<ApiResponse<{ user: User; tokens: AuthTokens }>>(
        `${AUTH_PREFIX}/register`,
        data
      );
      
      const { tokens } = response.data.data;
      
      // Store tokens
      localStorage.setItem('accessToken', tokens.accessToken);
      localStorage.setItem('refreshToken', tokens.refreshToken);
      
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Logout
  logout: async (): Promise<void> => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        await apiClient.post(`${AUTH_PREFIX}/logout`, { refreshToken });
      }
    } catch (error) {
      // Ignore errors during logout
      console.error('Logout error:', error);
    } finally {
      // Always clear tokens
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
  },

  // Get current user profile
  getProfile: async (): Promise<User> => {
    try {
      const response = await apiClient.get<ApiResponse<User>>(`${AUTH_PREFIX}/profile`);
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Update profile
  updateProfile: async (data: Partial<User>): Promise<User> => {
    try {
      const response = await apiClient.patch<ApiResponse<User>>(
        `${AUTH_PREFIX}/profile`,
        data
      );
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Change password
  changePassword: async (currentPassword: string, newPassword: string): Promise<void> => {
    try {
      await apiClient.post(`${AUTH_PREFIX}/change-password`, {
        currentPassword,
        newPassword,
      });
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Forgot password
  forgotPassword: async (email: string): Promise<void> => {
    try {
      await apiClient.post(`${AUTH_PREFIX}/forgot-password`, { email });
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Reset password
  resetPassword: async (token: string, newPassword: string): Promise<void> => {
    try {
      await apiClient.post(`${AUTH_PREFIX}/reset-password`, {
        token,
        newPassword,
      });
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Verify email
  verifyEmail: async (token: string): Promise<void> => {
    try {
      await apiClient.post(`${AUTH_PREFIX}/verify-email`, { token });
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Resend verification email
  resendVerificationEmail: async (): Promise<void> => {
    try {
      await apiClient.post(`${AUTH_PREFIX}/resend-verification`);
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Refresh tokens
  refreshTokens: async (refreshToken: string): Promise<AuthTokens> => {
    try {
      const response = await apiClient.post<ApiResponse<AuthTokens>>(
        `${AUTH_PREFIX}/refresh`,
        { refreshToken }
      );
      
      const tokens = response.data.data;
      
      // Update stored tokens
      localStorage.setItem('accessToken', tokens.accessToken);
      localStorage.setItem('refreshToken', tokens.refreshToken);
      
      return tokens;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Check if tokens exist
  hasTokens: (): boolean => {
    if (typeof window === 'undefined') return false;
    return !!localStorage.getItem('accessToken');
  },

  // Get stored access token
  getAccessToken: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('accessToken');
  },
};

// Helper exports for direct imports
export const updateProfile = authApi.updateProfile;
export const changePassword = authApi.changePassword;
