'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ShoppingCart, Heart, Star } from 'lucide-react';
import { Product } from '@/types';
import { useCart } from '@/stores/cart.store';
import { formatPrice, calculateDiscount, getStockStatus } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface ProductCardProps {
  product: Product;
  index?: number;
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const { addItem, isInCart } = useCart();
  const discount = product.comparePrice 
    ? calculateDiscount(product.price, product.comparePrice) 
    : 0;
  const stockStatus = getStockStatus(product.stock ?? 0);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if ((product.stock ?? 0) === 0) {
      toast.error('Produit en rupture de stock');
      return;
    }

    addItem(product);
    toast.success(`${product.name} ajouté au panier`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="group"
    >
      <Link href={`/products/${product.id}`}>
        <div className="relative overflow-hidden rounded-lg border bg-card transition-all duration-300 hover:shadow-lg">
          {/* Image */}
          <div className="relative aspect-square overflow-hidden bg-muted">
            <Image
              src={product.images[0] || '/placeholder.jpg'}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              placeholder="blur"
              blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAAAAUG/8QAIhAAAQMEAQUBAAAAAAAAAAAAAQIDBAAFESEGEhMiMVFh/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAZEQACAwEAAAAAAAAAAAAAAAAAAQIDESH/2gAMAwEAAhEDEEEASBBd"
            />

            {/* Badges */}
            <div className="absolute left-2 top-2 flex flex-col gap-1">
              {discount > 0 && (
                <Badge variant="destructive">-{discount}%</Badge>
              )}
              {(product.stock ?? 0) <= 5 && (product.stock ?? 0) > 0 && (
                <Badge variant="warning">Stock limité</Badge>
              )}
              {(product.stock ?? 0) === 0 && (
                <Badge variant="destructive">Rupture</Badge>
              )}
            </div>

            {/* Wishlist button */}
            <button
              className="absolute right-2 top-2 rounded-full bg-white/80 p-2 opacity-0 transition-opacity duration-200 hover:bg-white group-hover:opacity-100"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toast.info('Fonctionnalité à venir');
              }}
            >
              <Heart className="h-4 w-4" />
            </button>

            {/* Quick add to cart */}
            <div className="absolute bottom-2 left-2 right-2 translate-y-full opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
              <Button
                onClick={handleAddToCart}
                className="w-full"
                size="sm"
                disabled={(product.stock ?? 0) === 0}
              >
                <ShoppingCart className="mr-2 h-4 w-4" />
                {isInCart(product.id) ? 'Dans le panier' : 'Ajouter au panier'}
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="p-4">
            {/* Category */}
            <p className="text-xs text-muted-foreground">
              {product.category?.name}
            </p>

            {/* Title */}
            <h3 className="mt-1 line-clamp-2 font-medium group-hover:text-primary">
              {product.name}
            </h3>

            {/* Rating */}
            {product.rating && (
              <div className="mt-2 flex items-center gap-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-medium">{product.rating.toFixed(1)}</span>
                {product.reviewCount && (
                  <span className="text-xs text-muted-foreground">
                    ({product.reviewCount} avis)
                  </span>
                )}
              </div>
            )}

            {/* Price */}
            <div className="mt-2 flex items-center gap-2">
              <span className="text-lg font-bold text-primary">
                {formatPrice(product.price)}
              </span>
              {product.comparePrice && (
                <span className="text-sm text-muted-foreground line-through">
                  {formatPrice(product.comparePrice)}
                </span>
              )}
            </div>

            {/* Stock status */}
            <p className={`mt-1 text-xs ${
              stockStatus.variant === 'success' 
                ? 'text-green-600' 
                : stockStatus.variant === 'warning' 
                ? 'text-yellow-600' 
                : 'text-red-600'
            }`}>
              {stockStatus.label}
            </p>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
