'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Package,
} from 'lucide-react';
import { useProducts, useDeleteProduct, useBulkDeleteProducts } from '@/hooks/use-products';
import { formatPrice, getStockStatus } from '@/lib/utils';
import { ProductFilters } from '@/types';
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

export default function AdminProductsPage() {
  const [filters, setFilters] = useState<ProductFilters>({ limit: 20 });
  const [search, setSearch] = useState('');
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);

  const { data: productsData, isLoading } = useProducts(filters);
  const deleteProduct = useDeleteProduct();
  const bulkDelete = useBulkDeleteProducts();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters((prev) => ({ ...prev, search: search || undefined }));
  };

  const handleDelete = async () => {
    if (productToDelete) {
      try {
        await deleteProduct.mutateAsync(productToDelete);
        toast.success('Produit supprimé');
        setDeleteDialogOpen(false);
        setProductToDelete(null);
      } catch (error) {
        toast.error('Erreur lors de la suppression');
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedProducts.length > 0) {
      try {
        await bulkDelete.mutateAsync(selectedProducts);
        toast.success(`${selectedProducts.length} produit(s) supprimé(s)`);
        setSelectedProducts([]);
      } catch (error) {
        toast.error('Erreur lors de la suppression');
      }
    }
  };

  const toggleSelectAll = () => {
    if (selectedProducts.length === productsData?.data.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(productsData?.data.map((p) => p.id) || []);
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedProducts((prev) =>
      prev.includes(id)
        ? prev.filter((p) => p !== id)
        : [...prev, id]
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Produits</h1>
          <p className="text-muted-foreground">
            Gérez votre catalogue de produits
          </p>
        </div>
        <Link href="/admin/products/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nouveau produit
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Rechercher..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-64 pl-10"
            />
          </div>
          <Button type="submit" variant="secondary">
            Rechercher
          </Button>
        </form>

        {selectedProducts.length > 0 && (
          <Button variant="destructive" size="sm" onClick={handleBulkDelete}>
            <Trash2 className="mr-2 h-4 w-4" />
            Supprimer ({selectedProducts.length})
          </Button>
        )}
      </div>

      {/* Products Table */}
      <div className="rounded-lg border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="p-4 text-left">
                  <input
                    type="checkbox"
                    checked={
                      productsData?.data.length === selectedProducts.length &&
                      selectedProducts.length > 0
                    }
                    onChange={toggleSelectAll}
                    className="rounded"
                  />
                </th>
                <th className="p-4 text-left font-medium">Produit</th>
                <th className="p-4 text-left font-medium">SKU</th>
                <th className="p-4 text-left font-medium">Prix</th>
                <th className="p-4 text-left font-medium">Stock</th>
                <th className="p-4 text-left font-medium">Statut</th>
                <th className="p-4 text-left font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-b">
                      <td className="p-4">
                        <Skeleton className="h-4 w-4" />
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <Skeleton className="h-12 w-12 rounded" />
                          <Skeleton className="h-4 w-32" />
                        </div>
                      </td>
                      <td className="p-4">
                        <Skeleton className="h-4 w-20" />
                      </td>
                      <td className="p-4">
                        <Skeleton className="h-4 w-16" />
                      </td>
                      <td className="p-4">
                        <Skeleton className="h-4 w-12" />
                      </td>
                      <td className="p-4">
                        <Skeleton className="h-6 w-16" />
                      </td>
                      <td className="p-4">
                        <Skeleton className="h-8 w-20" />
                      </td>
                    </tr>
                  ))
                : productsData?.data.map((product) => {
                    const stockStatus = getStockStatus(product.stock ?? 0);
                    return (
                      <tr key={product.id} className="border-b hover:bg-muted/50">
                        <td className="p-4">
                          <input
                            type="checkbox"
                            checked={selectedProducts.includes(product.id)}
                            onChange={() => toggleSelect(product.id)}
                            className="rounded"
                          />
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="relative h-12 w-12 overflow-hidden rounded bg-muted">
                              {product.images[0] ? (
                                <Image
                                  src={product.images[0]}
                                  alt={product.name}
                                  fill
                                  className="object-cover"
                                />
                              ) : (
                                <Package className="h-full w-full p-2 text-muted-foreground" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium">{product.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {product.category?.name}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 font-mono text-sm">{product.sku}</td>
                        <td className="p-4">
                          <div>
                            <p className="font-medium">
                              {formatPrice(product.price)}
                            </p>
                            {product.comparePrice && (
                              <p className="text-sm text-muted-foreground line-through">
                                {formatPrice(product.comparePrice)}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="p-4">{product.stock ?? 0}</td>
                        <td className="p-4">
                          <Badge
                            variant={
                              !product.isActive
                                ? 'secondary'
                                : stockStatus.variant === 'success'
                                ? 'success'
                                : stockStatus.variant === 'warning'
                                ? 'warning'
                                : 'destructive'
                            }
                          >
                            {!product.isActive
                              ? 'Inactif'
                              : stockStatus.label}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <Link href={`/products/${product.id}`}>
                              <Button variant="ghost" size="icon">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Link href={`/admin/products/${product.id}/edit`}>
                              <Button variant="ghost" size="icon">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setProductToDelete(product.id);
                                setDeleteDialogOpen(true);
                              }}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {productsData?.meta && (
          <div className="flex items-center justify-between border-t p-4">
            <p className="text-sm text-muted-foreground">
              {productsData.meta.total} produit(s) au total
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={!productsData.meta.hasPreviousPage}
                onClick={() =>
                  setFilters((prev) => ({
                    ...prev,
                    page: (prev.page || 1) - 1,
                  }))
                }
              >
                Précédent
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={!productsData.meta.hasNextPage}
                onClick={() =>
                  setFilters((prev) => ({
                    ...prev,
                    page: (prev.page || 1) + 1,
                  }))
                }
              >
                Suivant
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer ce produit ? Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              isLoading={deleteProduct.isPending}
            >
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
