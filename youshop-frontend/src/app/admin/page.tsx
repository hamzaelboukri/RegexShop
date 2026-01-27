'use client';

import Link from 'next/link';
import {
  Package,
  FolderTree,
  ShoppingCart,
  Plus,
  ArrowRight,
} from 'lucide-react';
import { useProducts, useCategories } from '@/hooks/use-products';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminDashboardPage() {
  const { data: productsData, isLoading: isLoadingProducts } = useProducts({ limit: 5 });
  const { data: categories, isLoading: isLoadingCategories } = useCategories();

  const productCount = productsData?.meta?.total || 0;
  const categoryCount = categories?.length || 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Tableau de bord</h1>
        <p className="text-muted-foreground">
          Bienvenue dans l&apos;administration YouShop
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Produits</p>
                {isLoadingProducts ? (
                  <Skeleton className="mt-2 h-8 w-16" />
                ) : (
                  <p className="text-3xl font-bold">{productCount}</p>
                )}
              </div>
              <div className="rounded-full bg-blue-100 p-3">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Catégories</p>
                {isLoadingCategories ? (
                  <Skeleton className="mt-2 h-8 w-16" />
                ) : (
                  <p className="text-3xl font-bold">{categoryCount}</p>
                )}
              </div>
              <div className="rounded-full bg-green-100 p-3">
                <FolderTree className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Commandes</p>
                <p className="text-3xl font-bold">-</p>
              </div>
              <div className="rounded-full bg-yellow-100 p-3">
                <ShoppingCart className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Actions rapides</CardTitle>
            <CardDescription>Gérez votre catalogue</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/admin/products/new" className="block">
              <Button className="w-full justify-start" variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                Ajouter un produit
              </Button>
            </Link>
            <Link href="/admin/categories/new" className="block">
              <Button className="w-full justify-start" variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                Ajouter une catégorie
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Derniers produits</CardTitle>
            <CardDescription>Vos produits récemment ajoutés</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingProducts ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="mt-1 h-3 w-20" />
                    </div>
                  </div>
                ))}
              </div>
            ) : productsData?.data && productsData.data.length > 0 ? (
              <div className="space-y-3">
                {productsData.data.slice(0, 5).map((product) => (
                  <Link
                    key={product.id}
                    href={`/admin/products/${product.id}`}
                    className="flex items-center justify-between rounded-lg p-2 hover:bg-muted"
                  >
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {product.price} MAD
                      </p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Aucun produit pour le moment.{' '}
                <Link href="/admin/products/new" className="text-primary hover:underline">
                  Ajouter un produit
                </Link>
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Navigation Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Link href="/admin/products">
          <Card className="cursor-pointer transition-shadow hover:shadow-md">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="rounded-full bg-blue-100 p-3">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold">Gérer les produits</h3>
                <p className="text-sm text-muted-foreground">
                  Voir, modifier et supprimer
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/categories">
          <Card className="cursor-pointer transition-shadow hover:shadow-md">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="rounded-full bg-green-100 p-3">
                <FolderTree className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold">Gérer les catégories</h3>
                <p className="text-sm text-muted-foreground">
                  Organiser votre catalogue
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/orders">
          <Card className="cursor-pointer transition-shadow hover:shadow-md">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="rounded-full bg-yellow-100 p-3">
                <ShoppingCart className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <h3 className="font-semibold">Gérer les commandes</h3>
                <p className="text-sm text-muted-foreground">
                  Suivre et traiter
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
