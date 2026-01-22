'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ordersApi, paymentsApi, CreateOrderData } from '@/services/orders.service';

// Query Keys
export const orderKeys = {
  all: ['orders'] as const,
  lists: () => [...orderKeys.all, 'list'] as const,
  list: (params: Record<string, unknown>) => [...orderKeys.lists(), params] as const,
  myOrders: (page: number, limit: number) => [...orderKeys.all, 'my', page, limit] as const,
  details: () => [...orderKeys.all, 'detail'] as const,
  detail: (id: string) => [...orderKeys.details(), id] as const,
  byNumber: (orderNumber: string) => [...orderKeys.all, 'number', orderNumber] as const,
};

export const paymentKeys = {
  all: ['payments'] as const,
  lists: () => [...paymentKeys.all, 'list'] as const,
  byOrder: (orderId: string) => [...paymentKeys.all, 'order', orderId] as const,
};

// Order Hooks
export function useMyOrders(page = 1, limit = 10) {
  return useQuery({
    queryKey: orderKeys.myOrders(page, limit),
    queryFn: () => ordersApi.getMyOrders(page, limit),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

export function useOrder(id: string) {
  return useQuery({
    queryKey: orderKeys.detail(id),
    queryFn: () => ordersApi.getById(id),
    staleTime: 1000 * 60 * 1, // 1 minute
    enabled: !!id,
  });
}

export function useOrderByNumber(orderNumber: string) {
  return useQuery({
    queryKey: orderKeys.byNumber(orderNumber),
    queryFn: () => ordersApi.getByOrderNumber(orderNumber),
    staleTime: 1000 * 60 * 1, // 1 minute
    enabled: !!orderNumber,
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateOrderData) => ordersApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orderKeys.all });
    },
  });
}

export function useCancelOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) => ordersApi.cancel(id, reason),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: orderKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
    },
  });
}

// Admin Order Hooks
export function useOrders(params?: {
  page?: number;
  limit?: number;
  status?: string;
  paymentStatus?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
}) {
  return useQuery({
    queryKey: orderKeys.list(params || {}),
    queryFn: () => ordersApi.getAll(params),
    staleTime: 1000 * 60 * 1, // 1 minute
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      ordersApi.updateStatus(id, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: orderKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
    },
  });
}

export function useUpdatePaymentStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, paymentStatus }: { id: string; paymentStatus: string }) =>
      ordersApi.updatePaymentStatus(id, paymentStatus),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: orderKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
    },
  });
}

export function useAddTracking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      trackingNumber,
      carrier,
    }: {
      id: string;
      trackingNumber: string;
      carrier: string;
    }) => ordersApi.addTracking(id, trackingNumber, carrier),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: orderKeys.detail(variables.id) });
    },
  });
}

// Payment Hooks
export function useCreatePaymentIntent() {
  return useMutation({
    mutationFn: (orderId: string) => paymentsApi.createPaymentIntent(orderId),
  });
}

export function useConfirmPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (paymentIntentId: string) => paymentsApi.confirmPayment(paymentIntentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orderKeys.all });
    },
  });
}

export function usePaymentByOrder(orderId: string) {
  return useQuery({
    queryKey: paymentKeys.byOrder(orderId),
    queryFn: () => paymentsApi.getByOrderId(orderId),
    enabled: !!orderId,
  });
}

export function useRefundPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ paymentId, amount }: { paymentId: string; amount?: number }) =>
      paymentsApi.refund(paymentId, amount),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: paymentKeys.all });
      queryClient.invalidateQueries({ queryKey: orderKeys.all });
    },
  });
}
