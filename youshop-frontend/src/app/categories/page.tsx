'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Loader2, Package, ArrowRight } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  _count?: {
    products: number;
  };
}

export default function CategoriesPage() {
  const { data: categories, isLoading, error } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await apiClient.get('/catalog/categories');
      return response.data;
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Erreur</h1>
          <p className="text-gray-600">Impossible de charger les catégories</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Nos Catégories
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Parcourez nos différentes catégories de produits pour trouver ce que vous cherchez.
          </p>
        </div>

        {categories && categories.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/products?category=${category.slug}`}
                className="group bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="aspect-video bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                  {category.imageUrl ? (
                    <img
                      src={category.imageUrl}
                      alt={category.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Package className="h-16 w-16 text-primary/40" />
                  )}
                </div>
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 group-hover:text-primary transition-colors">
                    {category.name}
                  </h2>
                  {category.description && (
                    <p className="mt-2 text-gray-600 text-sm line-clamp-2">
                      {category.description}
                    </p>
                  )}
                  <div className="mt-4 flex items-center justify-between">
                    {category._count && (
                      <span className="text-sm text-gray-500">
                        {category._count.products} produit{category._count.products > 1 ? 's' : ''}
                      </span>
                    )}
                    <span className="inline-flex items-center text-primary text-sm font-medium group-hover:translate-x-1 transition-transform">
                      Voir les produits
                      <ArrowRight className="ml-1 h-4 w-4" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Aucune catégorie disponible
            </h2>
            <p className="text-gray-600">
              Les catégories seront bientôt disponibles.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
