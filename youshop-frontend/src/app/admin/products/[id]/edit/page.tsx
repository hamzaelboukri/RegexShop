'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { useProduct, useUpdateProduct } from '@/hooks/use-products';
import ProductForm from '@/components/admin/ProductForm';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Product } from '@/types';

interface PageProps {
  params: Promise<{ id: string }>;
}

interface ProductFormData {
  name: string;
  description: string;
  price: number;
  comparePrice?: number | null;
  categoryId: string;
  sku: string;
  isActive: boolean;
  isFeatured?: boolean;
  images: string[];
}

export default function EditProductPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { data: product, isLoading: isLoadingProduct } = useProduct(id);
  const updateProduct = useUpdateProduct();

  const handleSubmit = async (data: ProductFormData) => {
    try {
      const updateData: Partial<Product> = {
        ...data,
        comparePrice: data.comparePrice ?? undefined,
      };
      await updateProduct.mutateAsync({ id, data: updateData });
      toast.success('Produit mis à jour avec succès');
      router.push('/admin/products');
    } catch (error) {
      toast.error('Erreur lors de la mise à jour du produit');
      throw error;
    }
  };

  if (isLoadingProduct) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <div>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="mt-1 h-4 w-32" />
          </div>
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <Card>
              <CardContent className="space-y-4 p-6">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-32 w-full" />
                <div className="grid gap-4 sm:grid-cols-2">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="space-y-6">
            <Card>
              <CardContent className="space-y-4 p-6">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold">Produit non trouvé</h2>
          <p className="mt-1 text-muted-foreground">
            Le produit que vous recherchez n&apos;existe pas ou a été supprimé.
          </p>
        </div>
      </div>
    );
  }

  return (
    <ProductForm
      product={product}
      onSubmit={handleSubmit}
      isLoading={updateProduct.isPending}
      submitLabel="Mettre à jour"
      title="Modifier le produit"
      subtitle={`Modification de ${product.name}`}
    />
  );
}
