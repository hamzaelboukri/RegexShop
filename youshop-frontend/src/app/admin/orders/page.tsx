'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Search,
  Filter,
  Eye,
  Package,
  Truck,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { useOrders, useUpdateOrderStatus } from '@/hooks/use-orders';
import { formatPrice, formatDate, getOrderStatusLabel } from '@/lib/utils';
import { OrderStatus, type Order } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

const statusOptions = [
  { value: '', label: 'Tous les statuts' },
  { value: OrderStatus.PENDING, label: 'En attente' },
  { value: OrderStatus.PROCESSING, label: 'En traitement' },
  { value: OrderStatus.SHIPPED, label: 'Expédiée' },
  { value: OrderStatus.DELIVERED, label: 'Livrée' },
  { value: OrderStatus.CANCELLED, label: 'Annulée' },
];

export default function AdminOrdersPage() {
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

  const { data: ordersData, isLoading } = useOrders({ page: 1, limit: 20 });
  const updateStatus = useUpdateOrderStatus();

  const filteredOrders = ordersData?.data.filter((order) => {
    if (statusFilter && order.status !== statusFilter) return false;
    if (search && !order.orderNumber.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    return true;
  });

  const handleStatusUpdate = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await updateStatus.mutateAsync({ id: orderId, status: newStatus });
      toast.success('Statut mis à jour');
    } catch (error) {
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PENDING:
        return <Package className="h-4 w-4" />;
      case OrderStatus.PROCESSING:
        return <Package className="h-4 w-4" />;
      case OrderStatus.SHIPPED:
        return <Truck className="h-4 w-4" />;
      case OrderStatus.DELIVERED:
        return <CheckCircle className="h-4 w-4" />;
      case OrderStatus.CANCELLED:
        return <XCircle className="h-4 w-4" />;
      default:
        return null;
    }
  };

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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Commandes</h1>
        <p className="text-muted-foreground">
          Gérez les commandes de vos clients
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="N° de commande..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-64 pl-10"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        >
          {statusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Orders Table */}
      <div className="rounded-lg border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="p-4 text-left font-medium">Commande</th>
                <th className="p-4 text-left font-medium">Client</th>
                <th className="p-4 text-left font-medium">Date</th>
                <th className="p-4 text-left font-medium">Statut</th>
                <th className="p-4 text-left font-medium">Total</th>
                <th className="p-4 text-left font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-b">
                      <td className="p-4">
                        <Skeleton className="h-4 w-24" />
                      </td>
                      <td className="p-4">
                        <Skeleton className="h-4 w-32" />
                      </td>
                      <td className="p-4">
                        <Skeleton className="h-4 w-24" />
                      </td>
                      <td className="p-4">
                        <Skeleton className="h-6 w-20" />
                      </td>
                      <td className="p-4">
                        <Skeleton className="h-4 w-16" />
                      </td>
                      <td className="p-4">
                        <Skeleton className="h-8 w-20" />
                      </td>
                    </tr>
                  ))
                : filteredOrders?.map((order) => (
                    <tr key={order.id} className="border-b hover:bg-muted/50">
                      <td className="p-4">
                        <p className="font-mono font-medium">
                          #{order.orderNumber}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {order.items?.length || 0} article(s)
                        </p>
                      </td>
                      <td className="p-4">
                        <p className="font-medium">
                          {order.user?.firstName} {order.user?.lastName}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {order.user?.email}
                        </p>
                      </td>
                      <td className="p-4">
                        <p>{formatDate(order.createdAt)}</p>
                      </td>
                      <td className="p-4">
                        <Badge
                          variant={getStatusBadgeVariant(order.status) as any}
                          className="flex w-fit items-center gap-1"
                        >
                          {getStatusIcon(order.status)}
                          {getOrderStatusLabel(order.status)}
                        </Badge>
                      </td>
                      <td className="p-4 font-medium">
                        {formatPrice(order.total)}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedOrder(order);
                              setDetailDialogOpen(true);
                            }}
                          >
                            <Eye className="mr-1 h-4 w-4" />
                            Détails
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>

        {!isLoading && filteredOrders?.length === 0 && (
          <div className="p-8 text-center text-muted-foreground">
            Aucune commande trouvée
          </div>
        )}
      </div>

      {/* Order Detail Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-2xl">
          {selectedOrder && (
            <>
              <DialogHeader>
                <DialogTitle>
                  Commande #{selectedOrder.orderNumber}
                </DialogTitle>
                <DialogDescription>
                  Passée le {formatDate(selectedOrder.createdAt)}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                {/* Status update */}
                <div>
                  <p className="mb-2 text-sm font-medium">Mettre à jour le statut</p>
                  <div className="flex flex-wrap gap-2">
                    {Object.values(OrderStatus).map((status) => (
                      <Button
                        key={status}
                        size="sm"
                        variant={
                          selectedOrder.status === status
                            ? 'default'
                            : 'outline'
                        }
                        onClick={() =>
                          handleStatusUpdate(selectedOrder.id, status)
                        }
                        disabled={
                          updateStatus.isPending ||
                          selectedOrder.status === status
                        }
                      >
                        {getStatusIcon(status)}
                        <span className="ml-1">
                          {getOrderStatusLabel(status)}
                        </span>
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Customer info */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Client
                    </p>
                    <p className="font-medium">
                      {selectedOrder.user?.firstName}{' '}
                      {selectedOrder.user?.lastName}
                    </p>
                    <p className="text-sm">{selectedOrder.user?.email}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Adresse de livraison
                    </p>
                    <p className="text-sm">
                      {selectedOrder.shippingAddress?.street}
                      <br />
                      {selectedOrder.shippingAddress?.postalCode}{' '}
                      {selectedOrder.shippingAddress?.city}
                      <br />
                      {selectedOrder.shippingAddress?.country}
                    </p>
                  </div>
                </div>

                {/* Order items */}
                <div>
                  <p className="mb-2 text-sm font-medium text-muted-foreground">
                    Articles
                  </p>
                  <div className="space-y-2">
                    {selectedOrder.items?.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between rounded-md border p-3"
                      >
                        <div>
                          <p className="font-medium">{item.product?.name}</p>
                          <p className="text-sm text-muted-foreground">
                            Quantité: {item.quantity}
                          </p>
                        </div>
                        <p className="font-medium">
                          {formatPrice(item.price * item.quantity)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order totals */}
                <div className="space-y-2 border-t pt-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Sous-total</span>
                    <span>{formatPrice(selectedOrder.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Livraison</span>
                    <span>{formatPrice(selectedOrder.shipping)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Taxes</span>
                    <span>{formatPrice(selectedOrder.tax)}</span>
                  </div>
                  <div className="flex justify-between font-medium">
                    <span>Total</span>
                    <span>{formatPrice(selectedOrder.total)}</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
