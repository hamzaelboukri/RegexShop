import apiClient, { handleApiError } from '@/lib/api-client';
import { Order, PaginatedResponse, ApiResponse, PaymentIntent } from '@/types';

const ORDERS_PREFIX = '/orders';

// Simplified address type for order creation (without id and isDefault)
export interface OrderAddressInput {
  firstName: string;
  lastName: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
}

export interface CreateOrderData {
  items: {
    productId: string;
    quantity: number;
    price?: number;
  }[];
  shippingAddress: OrderAddressInput;
  billingAddress?: OrderAddressInput;
  paymentMethodId?: string;
  couponCode?: string;
  notes?: string;
}

export const ordersApi = {
  // Get user's orders
  getMyOrders: async (page = 1, limit = 10): Promise<PaginatedResponse<Order>> => {
    try {
      const response = await apiClient.get<PaginatedResponse<Order>>(
        `${ORDERS_PREFIX}/my-orders`,
        { params: { page, limit } }
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Get single order by ID
  getById: async (id: string): Promise<Order> => {
    try {
      const response = await apiClient.get<ApiResponse<Order>>(`${ORDERS_PREFIX}/${id}`);
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Get order by order number
  getByOrderNumber: async (orderNumber: string): Promise<Order> => {
    try {
      const response = await apiClient.get<ApiResponse<Order>>(
        `${ORDERS_PREFIX}/number/${orderNumber}`
      );
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Create new order
  create: async (data: CreateOrderData): Promise<Order> => {
    try {
      const response = await apiClient.post<ApiResponse<Order>>(ORDERS_PREFIX, data);
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Cancel order
  cancel: async (id: string, reason?: string): Promise<Order> => {
    try {
      const response = await apiClient.post<ApiResponse<Order>>(
        `${ORDERS_PREFIX}/${id}/cancel`,
        { reason }
      );
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Admin: Get all orders
  getAll: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    paymentStatus?: string;
    search?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<PaginatedResponse<Order>> => {
    try {
      const response = await apiClient.get<PaginatedResponse<Order>>(ORDERS_PREFIX, { params });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Admin: Update order status
  updateStatus: async (id: string, status: string): Promise<Order> => {
    try {
      const response = await apiClient.patch<ApiResponse<Order>>(
        `${ORDERS_PREFIX}/${id}/status`,
        { status }
      );
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Admin: Update payment status
  updatePaymentStatus: async (id: string, paymentStatus: string): Promise<Order> => {
    try {
      const response = await apiClient.patch<ApiResponse<Order>>(
        `${ORDERS_PREFIX}/${id}/payment-status`,
        { paymentStatus }
      );
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Admin: Add tracking info
  addTracking: async (id: string, trackingNumber: string, carrier: string): Promise<Order> => {
    try {
      const response = await apiClient.patch<ApiResponse<Order>>(
        `${ORDERS_PREFIX}/${id}/tracking`,
        { trackingNumber, carrier }
      );
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
};

// Payment API
const PAYMENT_PREFIX = '/payments';

export const paymentsApi = {
  // Create payment intent for order
  createPaymentIntent: async (orderId: string): Promise<PaymentIntent> => {
    try {
      const response = await apiClient.post<ApiResponse<PaymentIntent>>(
        `${PAYMENT_PREFIX}/create-intent`,
        { orderId }
      );
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Confirm payment
  confirmPayment: async (paymentIntentId: string): Promise<void> => {
    try {
      await apiClient.post(`${PAYMENT_PREFIX}/confirm`, { paymentIntentId });
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Get payment by order ID
  getByOrderId: async (orderId: string): Promise<PaymentIntent> => {
    try {
      const response = await apiClient.get<ApiResponse<PaymentIntent>>(
        `${PAYMENT_PREFIX}/order/${orderId}`
      );
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Admin: Get all payments
  getAll: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<PaginatedResponse<PaymentIntent>> => {
    try {
      const response = await apiClient.get<PaginatedResponse<PaymentIntent>>(
        PAYMENT_PREFIX,
        { params }
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Admin: Refund payment
  refund: async (paymentId: string, amount?: number): Promise<void> => {
    try {
      await apiClient.post(`${PAYMENT_PREFIX}/${paymentId}/refund`, { amount });
    } catch (error) {
      throw handleApiError(error);
    }
  },
};

// Helper exports for direct imports
export const createOrder = ordersApi.create;
