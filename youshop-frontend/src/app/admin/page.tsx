'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  DollarSign,
  ShoppingCart,
  Package,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  ArrowRight,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import {
  useDashboardStats,
  useRevenueData,
  useTopProducts,
  useLowStockProducts,
  useRecentActivity,
} from '@/hooks/use-admin';
import { formatPrice, formatRelativeTime } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminDashboardPage() {
  const [revenuePeriod, setRevenuePeriod] = useState<'7d' | '30d' | '90d'>('7d');

  const { data: stats, isLoading: isLoadingStats } = useDashboardStats();
  const { data: revenueData, isLoading: isLoadingRevenue } = useRevenueData(revenuePeriod);
  const { data: topProducts, isLoading: isLoadingTopProducts } = useTopProducts(5);
  const { data: lowStockProducts, isLoading: isLoadingLowStock } = useLowStockProducts(10);
  const { data: recentActivity, isLoading: isLoadingActivity } = useRecentActivity(10);

  const statCards = [
    {
      title: 'Ventes du jour',
      value: stats?.todaySales || 0,
      format: 'currency',
      change: stats?.revenueChange || 0,
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Commandes du jour',
      value: stats?.todayOrders || 0,
      format: 'number',
      change: stats?.ordersChange || 0,
      icon: ShoppingCart,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Commandes en attente',
      value: stats?.pendingOrders || 0,
      format: 'number',
      icon: Package,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
    },
    {
      title: 'Produits en rupture',
      value: stats?.lowStockProducts || 0,
      format: 'number',
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Tableau de bord</h1>
        <p className="text-muted-foreground">
          Vue d&apos;ensemble de votre activité
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {isLoadingStats
          ? Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="mt-2 h-8 w-32" />
                  <Skeleton className="mt-2 h-4 w-16" />
                </CardContent>
              </Card>
            ))
          : statCards.map((stat) => (
              <Card key={stat.title}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </p>
                    <div className={`rounded-full p-2 ${stat.bgColor}`}>
                      <stat.icon className={`h-4 w-4 ${stat.color}`} />
                    </div>
                  </div>
                  <p className="mt-2 text-2xl font-bold">
                    {stat.format === 'currency'
                      ? formatPrice(stat.value)
                      : stat.value}
                  </p>
                  {stat.change !== undefined && (
                    <div className="mt-1 flex items-center text-sm">
                      {stat.change >= 0 ? (
                        <>
                          <TrendingUp className="mr-1 h-4 w-4 text-green-600" />
                          <span className="text-green-600">+{stat.change}%</span>
                        </>
                      ) : (
                        <>
                          <TrendingDown className="mr-1 h-4 w-4 text-red-600" />
                          <span className="text-red-600">{stat.change}%</span>
                        </>
                      )}
                      <span className="ml-1 text-muted-foreground">vs hier</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Revenue Chart */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Revenus</CardTitle>
                <CardDescription>Évolution du chiffre d&apos;affaires</CardDescription>
              </div>
              <div className="flex gap-1">
                {(['7d', '30d', '90d'] as const).map((period) => (
                  <Button
                    key={period}
                    variant={revenuePeriod === period ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setRevenuePeriod(period)}
                  >
                    {period}
                  </Button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoadingRevenue ? (
              <Skeleton className="h-[300px] w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip
                    formatter={(value: number) => [formatPrice(value), 'Revenus']}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Produits les plus vendus</CardTitle>
                <CardDescription>Top 5 des ventes</CardDescription>
              </div>
              <Link href="/admin/products">
                <Button variant="ghost" size="sm">
                  Voir tout
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {isLoadingTopProducts ? (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topProducts} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis type="number" className="text-xs" />
                  <YAxis dataKey="name" type="category" width={100} className="text-xs" />
                  <Tooltip
                    formatter={(value: number) => [value, 'Ventes']}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="sales" fill="hsl(var(--primary))" radius={4} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Bottom section */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Low Stock Alert */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-600" />
                  Alertes stock
                </CardTitle>
                <CardDescription>Produits à réapprovisionner</CardDescription>
              </div>
              <Link href="/admin/products?lowStock=true">
                <Button variant="ghost" size="sm">
                  Voir tout
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {isLoadingLowStock ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : lowStockProducts && lowStockProducts.length > 0 ? (
              <div className="space-y-3">
                {lowStockProducts.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between rounded-md border p-3"
                  >
                    <span className="font-medium">{product.name}</span>
                    <Badge
                      variant={product.stock === 0 ? 'destructive' : 'warning'}
                    >
                      {product.stock === 0 ? 'Rupture' : `${product.stock} restants`}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground">
                Aucune alerte de stock
              </p>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Activité récente</CardTitle>
            <CardDescription>Dernières actions sur la plateforme</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingActivity ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : recentActivity && recentActivity.length > 0 ? (
              <div className="space-y-3">
                {recentActivity.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-center justify-between rounded-md border p-3"
                  >
                    <span className="text-sm">{activity.message}</span>
                    <span className="text-xs text-muted-foreground">
                      {formatRelativeTime(activity.createdAt)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground">
                Aucune activité récente
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
