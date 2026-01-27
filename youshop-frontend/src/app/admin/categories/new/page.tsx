'use client';

import { useRouter } from 'next/navigation';
import { useCreateCategory } from '@/hooks/use-products';
import CategoryForm from '@/components/admin/CategoryForm';
import { toast } from 'sonner';
import { Category } from '@/types';

interface CategoryFormData {
  name: string;
  slug: string;
  description?: string;
  parentId?: string | null;
  image?: string;
}

export default function NewCategoryPage() {
  const router = useRouter();
  const createCategory = useCreateCategory();

  const handleSubmit = async (data: CategoryFormData) => {
    try {
      const createData: Partial<Category> = {
        ...data,
        parentId: data.parentId ?? undefined,
      };
      await createCategory.mutateAsync(createData);
      toast.success('Catégorie créée avec succès');
      router.push('/admin/categories');
    } catch (error) {
      toast.error('Erreur lors de la création de la catégorie');
      throw error;
    }
  };

  return (
    <CategoryForm
      onSubmit={handleSubmit}
      isLoading={createCategory.isPending}
      submitLabel="Créer"
      title="Nouvelle catégorie"
      subtitle="Créez une nouvelle catégorie pour organiser vos produits"
    />
  );
}
