'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Category, ProductFilters as Filters } from '@/types';
import { debounce } from '@/lib/utils';

interface ProductFiltersProps {
  categories: Category[];
  onFiltersChange: (filters: Filters) => void;
}

export function ProductFilters({ categories, onFiltersChange }: ProductFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || '');
  const [inStock, setInStock] = useState(searchParams.get('inStock') === 'true');

  // Debounced search
  const debouncedSearch = useCallback(
    debounce((value: string) => {
      updateFilters({ search: value || undefined });
    }, 300),
    []
  );

  const updateFilters = (newFilters: Partial<Filters>) => {
    const filters: Filters = {
      search: search || undefined,
      category: category || undefined,
      minPrice: minPrice ? parseFloat(minPrice) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
      sortBy: sortBy as Filters['sortBy'] || undefined,
      inStock: inStock || undefined,
      ...newFilters,
    };

    // Update URL
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        params.set(key, String(value));
      }
    });

    router.push(`?${params.toString()}`, { scroll: false });
    onFiltersChange(filters);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearch(value);
    debouncedSearch(value);
  };

  const handleCategoryChange = (value: string) => {
    setCategory(value === 'all' ? '' : value);
    updateFilters({ category: value === 'all' ? undefined : value });
  };

  const handleSortChange = (value: string) => {
    setSortBy(value === 'none' ? '' : value);
    updateFilters({ sortBy: value === 'none' ? undefined : value as Filters['sortBy'] });
  };

  const handlePriceApply = () => {
    updateFilters({
      minPrice: minPrice ? parseFloat(minPrice) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
    });
  };

  const clearFilters = () => {
    setSearch('');
    setCategory('');
    setMinPrice('');
    setMaxPrice('');
    setSortBy('');
    setInStock(false);
    router.push('?', { scroll: false });
    onFiltersChange({});
  };

  const hasActiveFilters = search || category || minPrice || maxPrice || sortBy || inStock;

  return (
    <div className="space-y-4">
      {/* Search bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Rechercher un produit..."
            value={search}
            onChange={handleSearchChange}
            className="pl-10"
          />
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsOpen(!isOpen)}
          className="lg:hidden"
        >
          <SlidersHorizontal className="h-4 w-4" />
        </Button>
      </div>

      {/* Filters */}
      <div className={`space-y-4 ${isOpen ? 'block' : 'hidden lg:block'}`}>
        <div className="flex flex-wrap gap-4">
          {/* Category */}
          <div className="w-full sm:w-auto">
            <Label className="mb-2 block text-sm">Catégorie</Label>
            <Select value={category || 'all'} onValueChange={handleCategoryChange}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Toutes catégories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes catégories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Sort */}
          <div className="w-full sm:w-auto">
            <Label className="mb-2 block text-sm">Trier par</Label>
            <Select value={sortBy || 'none'} onValueChange={handleSortChange}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Trier par" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Par défaut</SelectItem>
                <SelectItem value="price_asc">Prix croissant</SelectItem>
                <SelectItem value="price_desc">Prix décroissant</SelectItem>
                <SelectItem value="newest">Nouveautés</SelectItem>
                <SelectItem value="rating">Mieux notés</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Price range */}
          <div className="flex w-full items-end gap-2 sm:w-auto">
            <div>
              <Label className="mb-2 block text-sm">Prix min</Label>
              <Input
                type="number"
                placeholder="0"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="w-24"
                min="0"
              />
            </div>
            <span className="pb-2">-</span>
            <div>
              <Label className="mb-2 block text-sm">Prix max</Label>
              <Input
                type="number"
                placeholder="∞"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-24"
                min="0"
              />
            </div>
            <Button variant="secondary" size="sm" onClick={handlePriceApply}>
              Appliquer
            </Button>
          </div>

          {/* In stock toggle */}
          <div className="flex items-end">
            <Button
              variant={inStock ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                setInStock(!inStock);
                updateFilters({ inStock: !inStock || undefined });
              }}
            >
              En stock uniquement
            </Button>
          </div>
        </div>

        {/* Clear filters */}
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <X className="mr-2 h-4 w-4" />
            Effacer les filtres
          </Button>
        )}
      </div>
    </div>
  );
}
