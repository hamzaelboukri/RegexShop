'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  FolderTree,
  Package,
} from 'lucide-react';
import { useCategories, useDeleteCategory } from '@/hooks/use-products';
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
import { Category } from '@/types';

export default function AdminCategoriesPage() {
  const [search, setSearch] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);

  const { data: categories, isLoading } = useCategories();
  const deleteCategory = useDeleteCategory();

  const filteredCategories = categories?.filter((cat) =>
    cat.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async () => {
    if (categoryToDelete) {
      try {
        await deleteCategory.mutateAsync(categoryToDelete.id);
        toast.success('Catégorie supprimée avec succès');
        setDeleteDialogOpen(false);
        setCategoryToDelete(null);
      } catch (error) {
        toast.error('Erreur lors de la suppression. La catégorie contient peut-être des produits.');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Catégories</h1>
          <p className="text-muted-foreground">
            Gérez les catégories de vos produits
          </p>
        </div>
        <Link href="/admin/categories/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nouvelle catégorie
          </Button>
        </Link>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Rechercher une catégorie..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Categories Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {isLoading
          ? Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="rounded-lg border bg-card p-4">
                <Skeleton className="mb-3 aspect-video w-full rounded-lg" />
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="mt-2 h-4 w-1/2" />
              </div>
            ))
          : filteredCategories?.map((category) => (
              <div
                key={category.id}
                className="group rounded-lg border bg-card p-4 transition-shadow hover:shadow-md"
              >
                <div className="relative mb-3 aspect-video overflow-hidden rounded-lg bg-muted">
                  {category.image ? (
                    <Image
                      src={category.image}
                      alt={category.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <FolderTree className="h-12 w-12 text-muted-foreground" />
                    </div>
                  )}
                </div>

                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold">{category.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {category.slug}
                    </p>
                    {category.productCount !== undefined && (
                      <Badge variant="secondary" className="mt-2">
                        <Package className="mr-1 h-3 w-3" />
                        {category.productCount} produit{category.productCount !== 1 ? 's' : ''}
                      </Badge>
                    )}
                  </div>

                  <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <Link href={`/admin/categories/${category.id}/edit`}>
                      <Button variant="ghost" size="icon">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setCategoryToDelete(category);
                        setDeleteDialogOpen(true);
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>

                {category.description && (
                  <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                    {category.description}
                  </p>
                )}
              </div>
            ))}
      </div>

      {filteredCategories?.length === 0 && !isLoading && (
        <div className="flex h-[300px] flex-col items-center justify-center rounded-lg border-2 border-dashed">
          <FolderTree className="mb-4 h-12 w-12 text-muted-foreground" />
          <h3 className="text-lg font-semibold">Aucune catégorie trouvée</h3>
          <p className="text-muted-foreground">
            {search
              ? 'Aucune catégorie ne correspond à votre recherche'
              : 'Commencez par créer votre première catégorie'}
          </p>
          {!search && (
            <Link href="/admin/categories/new" className="mt-4">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Créer une catégorie
              </Button>
            </Link>
          )}
        </div>
      )}

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer la catégorie &quot;{categoryToDelete?.name}&quot; ?
              {categoryToDelete?.productCount && categoryToDelete.productCount > 0 && (
                <span className="mt-2 block text-destructive">
                  Attention : Cette catégorie contient {categoryToDelete.productCount} produit(s).
                </span>
              )}
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
              disabled={deleteCategory.isPending}
            >
              {deleteCategory.isPending ? 'Suppression...' : 'Supprimer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
