'use client';

import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/services/admin.service';

// Query Keys
export const adminKeys = {
  all: ['admin'] as const,
  dashboard: () => [...adminKeys.all, 'dashboard'] as const,
  stats: () => [...adminKeys.dashboard(), 'stats'] as const,
  revenue: (period: string) => [...adminKeys.dashboard(), 'revenue', period] as const,
  topProducts: (limit: number) => [...adminKeys.dashboard(), 'topProducts', limit] as const,
  lowStock: (threshold: number) => [...adminKeys.all, 'lowStock', threshold] as const,
  activity: (limit: number) => [...adminKeys.all, 'activity', limit] as const,
};

// Dashboard Hooks
export function useDashboardStats() {
  return useQuery({
    queryKey: adminKeys.stats(),
    queryFn: () => adminApi.getDashboardStats(),
    staleTime: 1000 * 60 * 1, // 1 minute
    refetchInterval: 1000 * 60 * 5, // Refetch every 5 minutes
  });
}

export function useRevenueData(period: '7d' | '30d' | '90d' = '7d') {
  return useQuery({
    queryKey: adminKeys.revenue(period),
    queryFn: () => adminApi.getRevenueData(period),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useTopProducts(limit = 5) {
  return useQuery({
    queryKey: adminKeys.topProducts(limit),
    queryFn: () => adminApi.getTopProducts(limit),
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

export function useLowStockProducts(threshold = 10) {
  return useQuery({
    queryKey: adminKeys.lowStock(threshold),
    queryFn: () => adminApi.getLowStockProducts(threshold),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useRecentActivity(limit = 10) {
  return useQuery({
    queryKey: adminKeys.activity(limit),
    queryFn: () => adminApi.getRecentActivity(limit),
    staleTime: 1000 * 60 * 1, // 1 minute
    refetchInterval: 1000 * 30, // Refetch every 30 seconds
  });
}
