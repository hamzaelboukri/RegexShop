import apiClient, { handleApiError } from '@/lib/api-client';
import {
  Product,
  Category,
  PaginatedResponse,
  ProductFilters,
  ApiResponse,
} from '@/types';

const CATALOG_PREFIX = '/catalog';

// Products API
export const productsApi = {
  // Get all products with filters
  getAll: async (filters?: ProductFilters): Promise<PaginatedResponse<Product>> => {
    try {
      const params = new URLSearchParams();
      
      if (filters?.category) params.append('category', filters.category);
      if (filters?.minPrice) params.append('minPrice', filters.minPrice.toString());
      if (filters?.maxPrice) params.append('maxPrice', filters.maxPrice.toString());
      if (filters?.search) params.append('search', filters.search);
      if (filters?.inStock !== undefined) params.append('inStock', filters.inStock.toString());
      if (filters?.sortBy) params.append('sortBy', filters.sortBy);
      if (filters?.page) params.append('page', filters.page.toString());
      if (filters?.limit) params.append('limit', filters.limit.toString());

      const response = await apiClient.get<PaginatedResponse<Product>>(
        `${CATALOG_PREFIX}/products?${params.toString()}`
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Get single product by ID
  getById: async (id: string): Promise<Product> => {
    try {
      const response = await apiClient.get<ApiResponse<Product>>(
        `${CATALOG_PREFIX}/products/${id}`
      );
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Get product by slug
  getBySlug: async (slug: string): Promise<Product> => {
    try {
      const response = await apiClient.get<ApiResponse<Product>>(
        `${CATALOG_PREFIX}/products/slug/${slug}`
      );
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Search products
  search: async (query: string, limit = 10): Promise<Product[]> => {
    try {
      const response = await apiClient.get<ApiResponse<Product[]>>(
        `${CATALOG_PREFIX}/products/search`,
        { params: { q: query, limit } }
      );
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Get featured products
  getFeatured: async (limit = 8): Promise<Product[]> => {
    try {
      const response = await apiClient.get<ApiResponse<Product[]>>(
        `${CATALOG_PREFIX}/products/featured`,
        { params: { limit } }
      );
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Get related products
  getRelated: async (productId: string, limit = 4): Promise<Product[]> => {
    try {
      const response = await apiClient.get<ApiResponse<Product[]>>(
        `${CATALOG_PREFIX}/products/${productId}/related`,
        { params: { limit } }
      );
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Admin: Create product
  create: async (data: Partial<Product>): Promise<Product> => {
    try {
      const response = await apiClient.post<ApiResponse<Product>>(
        `${CATALOG_PREFIX}/products`,
        data
      );
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Admin: Update product
  update: async (id: string, data: Partial<Product>): Promise<Product> => {
    try {
      const response = await apiClient.patch<ApiResponse<Product>>(
        `${CATALOG_PREFIX}/products/${id}`,
        data
      );
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Admin: Delete product
  delete: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`${CATALOG_PREFIX}/products/${id}`);
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Admin: Bulk delete products
  bulkDelete: async (ids: string[]): Promise<void> => {
    try {
      await apiClient.post(`${CATALOG_PREFIX}/products/bulk-delete`, { ids });
    } catch (error) {
      throw handleApiError(error);
    }
  },
};

// Categories API
export const categoriesApi = {
  // Get all categories
  getAll: async (): Promise<Category[]> => {
    try {
      const response = await apiClient.get<ApiResponse<Category[]>>(
        `${CATALOG_PREFIX}/categories`
      );
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Get category by ID
  getById: async (id: string): Promise<Category> => {
    try {
      const response = await apiClient.get<ApiResponse<Category>>(
        `${CATALOG_PREFIX}/categories/${id}`
      );
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Get category by slug
  getBySlug: async (slug: string): Promise<Category> => {
    try {
      const response = await apiClient.get<ApiResponse<Category>>(
        `${CATALOG_PREFIX}/categories/slug/${slug}`
      );
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Get category tree (hierarchical)
  getTree: async (): Promise<Category[]> => {
    try {
      const response = await apiClient.get<ApiResponse<Category[]>>(
        `${CATALOG_PREFIX}/categories/tree`
      );
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Admin: Create category
  create: async (data: Partial<Category>): Promise<Category> => {
    try {
      const response = await apiClient.post<ApiResponse<Category>>(
        `${CATALOG_PREFIX}/categories`,
        data
      );
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Admin: Update category
  update: async (id: string, data: Partial<Category>): Promise<Category> => {
    try {
      const response = await apiClient.patch<ApiResponse<Category>>(
        `${CATALOG_PREFIX}/categories/${id}`,
        data
      );
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Admin: Delete category
  delete: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`${CATALOG_PREFIX}/categories/${id}`);
    } catch (error) {
      throw handleApiError(error);
    }
  },
};
