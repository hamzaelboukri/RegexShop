import apiClient, { handleApiError } from '@/lib/api-client';
import { ApiResponse, DashboardStats, RevenueData, TopProduct } from '@/types';

const ADMIN_PREFIX = '/admin';

export const adminApi = {
  // Get dashboard stats
  getDashboardStats: async (): Promise<DashboardStats> => {
    try {
      const response = await apiClient.get<ApiResponse<DashboardStats>>(
        `${ADMIN_PREFIX}/dashboard/stats`
      );
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Get revenue data
  getRevenueData: async (period: '7d' | '30d' | '90d' = '7d'): Promise<RevenueData[]> => {
    try {
      const response = await apiClient.get<ApiResponse<RevenueData[]>>(
        `${ADMIN_PREFIX}/dashboard/revenue`,
        { params: { period } }
      );
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Get top products
  getTopProducts: async (limit = 5): Promise<TopProduct[]> => {
    try {
      const response = await apiClient.get<ApiResponse<TopProduct[]>>(
        `${ADMIN_PREFIX}/dashboard/top-products`,
        { params: { limit } }
      );
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Get low stock products
  getLowStockProducts: async (threshold = 10): Promise<{ id: string; name: string; stock: number }[]> => {
    try {
      const response = await apiClient.get<ApiResponse<{ id: string; name: string; stock: number }[]>>(
        `${ADMIN_PREFIX}/inventory/low-stock`,
        { params: { threshold } }
      );
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Update stock
  updateStock: async (productId: string, quantity: number): Promise<void> => {
    try {
      await apiClient.patch(`${ADMIN_PREFIX}/inventory/${productId}/stock`, { quantity });
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Get recent activity
  getRecentActivity: async (limit = 10): Promise<{
    id: string;
    type: string;
    message: string;
    createdAt: string;
  }[]> => {
    try {
      const response = await apiClient.get<ApiResponse<{
        id: string;
        type: string;
        message: string;
        createdAt: string;
      }[]>>(
        `${ADMIN_PREFIX}/activity`,
        { params: { limit } }
      );
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Upload image
  uploadImage: async (file: File): Promise<string> => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await apiClient.post<ApiResponse<{ url: string }>>(
        `${ADMIN_PREFIX}/upload`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data.data.url;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Delete image
  deleteImage: async (url: string): Promise<void> => {
    try {
      await apiClient.delete(`${ADMIN_PREFIX}/upload`, { data: { url } });
    } catch (error) {
      throw handleApiError(error);
    }
  },
};

// Helper exports for direct imports
export const uploadImage = adminApi.uploadImage;
