'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { useCategory, useUpdateCategory } from '@/hooks/use-products';
import CategoryForm from '@/components/admin/CategoryForm';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Category } from '@/types';

interface PageProps {
  params: Promise<{ id: string }>;
}

interface CategoryFormData {
  name: string;
  slug: string;
  description?: string;
  parentId?: string | null;
  image?: string;
}

export default function EditCategoryPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { data: category, isLoading: isLoadingCategory } = useCategory(id);
  const updateCategory = useUpdateCategory();

  const handleSubmit = async (data: CategoryFormData) => {
    try {
      const updateData: Partial<Category> = {
        ...data,
        parentId: data.parentId ?? undefined,
      };
      await updateCategory.mutateAsync({ id, data: updateData });
      toast.success('Catégorie mise à jour avec succès');
      router.push('/admin/categories');
    } catch (error) {
      toast.error('Erreur lors de la mise à jour de la catégorie');
      throw error;
    }
  };

  if (isLoadingCategory) {
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
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-24 w-full" />
              </CardContent>
            </Card>
          </div>
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <Skeleton className="aspect-video w-full rounded-lg" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold">Catégorie non trouvée</h2>
          <p className="mt-1 text-muted-foreground">
            La catégorie que vous recherchez n&apos;existe pas ou a été supprimée.
          </p>
        </div>
      </div>
    );
  }

  return (
    <CategoryForm
      category={category}
      onSubmit={handleSubmit}
      isLoading={updateCategory.isPending}
      submitLabel="Mettre à jour"
      title="Modifier la catégorie"
      subtitle={`Modification de ${category.name}`}
    />
  );
}
