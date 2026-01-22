'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useProducts, useCategories } from '@/hooks/use-products';
import { ProductGrid } from '@/components/products/product-grid';
import { ProductFilters } from '@/components/products/product-filters';
import { ProductFilters as Filters } from '@/types';

export default function ProductsPage() {
  const searchParams = useSearchParams();
  
  const initialFilters: Filters = {
    search: searchParams.get('search') || undefined,
    category: searchParams.get('category') || undefined,
    minPrice: searchParams.get('minPrice') ? parseFloat(searchParams.get('minPrice')!) : undefined,
    maxPrice: searchParams.get('maxPrice') ? parseFloat(searchParams.get('maxPrice')!) : undefined,
    sortBy: (searchParams.get('sortBy') as Filters['sortBy']) || undefined,
    inStock: searchParams.get('inStock') === 'true' || undefined,
    page: searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1,
    limit: 12,
  };

  const [filters, setFilters] = useState<Filters>(initialFilters);

  const { data: productsData, isLoading: isLoadingProducts } = useProducts(filters);
  const { data: categories, isLoading: isLoadingCategories } = useCategories();

  const handleFiltersChange = (newFilters: Filters) => {
    setFilters({ ...newFilters, limit: 12 });
  };

  const handleLoadMore = () => {
    setFilters((prev) => ({ ...prev, page: (prev.page || 1) + 1 }));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Catalogue</h1>
        <p className="mt-2 text-muted-foreground">
          Découvrez notre sélection de produits
        </p>
      </div>

      {/* Filters */}
      <ProductFilters
        categories={categories || []}
        onFiltersChange={handleFiltersChange}
      />

      {/* Products */}
      <div className="mt-8">
        {productsData?.meta && (
          <p className="mb-4 text-sm text-muted-foreground">
            {productsData.meta.total} produit{productsData.meta.total > 1 ? 's' : ''} trouvé{productsData.meta.total > 1 ? 's' : ''}
          </p>
        )}

        <ProductGrid
          products={productsData?.data || []}
          isLoading={isLoadingProducts}
          emptyMessage="Aucun produit ne correspond à vos critères"
        />

        {/* Load more */}
        {productsData?.meta?.hasNextPage && (
          <div className="mt-8 text-center">
            <button
              onClick={handleLoadMore}
              className="rounded-md bg-primary px-6 py-2 text-primary-foreground hover:bg-primary/90"
            >
              Charger plus
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
