'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Package, ChevronRight, Eye } from 'lucide-react';
import { useMyOrders } from '@/hooks/use-orders';
import { formatPrice, formatDate, getOrderStatusLabel } from '@/lib/utils';
import { OrderStatus } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

export default function AccountOrdersPage() {
  const [page, setPage] = useState(1);
  const { data: ordersData, isLoading } = useMyOrders(page, 10);

  const getStatusBadgeVariant = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PENDING:
        return 'warning';
      case OrderStatus.PROCESSING:
        return 'info';
      case OrderStatus.SHIPPED:
        return 'info';
      case OrderStatus.DELIVERED:
        return 'success';
      case OrderStatus.CANCELLED:
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
    );
  }

  if (!ordersData?.data || ordersData.data.length === 0) {
    return (
      <div className="rounded-lg border bg-card p-8 text-center">
        <Package className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
        <h2 className="mb-2 text-xl font-semibold">Aucune commande</h2>
        <p className="mb-4 text-muted-foreground">
          Vous n&apos;avez pas encore passé de commande
        </p>
        <Link href="/products">
          <Button>Découvrir nos produits</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Mes commandes</h2>

      <div className="space-y-4">
        {ordersData.data.map((order) => (
          <div
            key={order.id}
            className="rounded-lg border bg-card p-4 transition-shadow hover:shadow-md"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-medium">
                    #{order.orderNumber}
                  </span>
                  <Badge variant={getStatusBadgeVariant(order.status) as any}>
                    {getOrderStatusLabel(order.status)}
                  </Badge>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  Passée le {formatDate(order.createdAt)}
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold">{formatPrice(order.total)}</p>
                <p className="text-sm text-muted-foreground">
                  {order.items?.length || 0} article(s)
                </p>
              </div>
            </div>

            {/* Order items preview */}
            <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
              {order.items?.slice(0, 4).map((item) => (
                <div
                  key={item.id}
                  className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md bg-muted"
                >
                  {item.product?.images?.[0] && (
                    <img
                      src={item.product.images[0]}
                      alt={item.product.name}
                      className="h-full w-full object-cover"
                    />
                  )}
                  {item.quantity > 1 && (
                    <span className="absolute bottom-0 right-0 rounded-tl bg-black/70 px-1 text-xs text-white">
                      x{item.quantity}
                    </span>
                  )}
                </div>
              ))}
              {order.items && order.items.length > 4 && (
                <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-md bg-muted text-sm text-muted-foreground">
                  +{order.items.length - 4}
                </div>
              )}
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <Link href={`/account/orders/${order.id}`}>
                <Button variant="outline" size="sm">
                  <Eye className="mr-1 h-4 w-4" />
                  Voir les détails
                </Button>
              </Link>
              {order.status === OrderStatus.DELIVERED && (
                <Button variant="outline" size="sm">
                  Racheter
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {ordersData.meta && (
        <div className="flex items-center justify-between border-t pt-4">
          <p className="text-sm text-muted-foreground">
            Page {ordersData.meta.page} sur {ordersData.meta.totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={!ordersData.meta.hasPreviousPage}
              onClick={() => setPage((p) => p - 1)}
            >
              Précédent
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={!ordersData.meta.hasNextPage}
              onClick={() => setPage((p) => p + 1)}
            >
              Suivant
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
