'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  Minus,
  Plus,
  ShoppingCart,
  Heart,
  Share2,
  Star,
  Check,
  Truck,
  Shield,
  RefreshCw,
} from 'lucide-react';
import { useProduct, useRelatedProducts } from '@/hooks/use-products';
import { useCart } from '@/stores/cart.store';
import { formatPrice, calculateDiscount, getStockStatus } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ProductGrid } from '@/components/products/product-grid';
import { toast } from 'sonner';

export default function ProductPage() {
  const params = useParams();
  const productId = params.id as string;

  const { data: product, isLoading } = useProduct(productId);
  const { data: relatedProducts } = useRelatedProducts(productId);
  const { addItem, isInCart, getItemQuantity } = useCart();

  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isZoomed, setIsZoomed] = useState(false);

  if (isLoading) {
    return <ProductPageSkeleton />;
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold">Produit non trouvé</h1>
        <p className="mt-2 text-muted-foreground">
          Ce produit n&apos;existe pas ou a été supprimé.
        </p>
        <Link href="/products">
          <Button className="mt-4">Retour au catalogue</Button>
        </Link>
      </div>
    );
  }

  const discount = product.compareAtPrice
    ? calculateDiscount(product.price, product.compareAtPrice)
    : 0;
  const stockStatus = getStockStatus(product.stock);
  const cartQuantity = getItemQuantity(product.id);
  const maxQuantity = product.stock - cartQuantity;

  const handleAddToCart = () => {
    if (quantity > maxQuantity) {
      toast.error('Stock insuffisant');
      return;
    }
    addItem(product, quantity);
    toast.success(`${product.name} ajouté au panier`);
    setQuantity(1);
  };

  const handlePrevImage = () => {
    setSelectedImage((prev) =>
      prev === 0 ? product.images.length - 1 : prev - 1
    );
  };

  const handleNextImage = () => {
    setSelectedImage((prev) =>
      prev === product.images.length - 1 ? 0 : prev + 1
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-primary">
          Accueil
        </Link>
        <span>/</span>
        <Link href="/products" className="hover:text-primary">
          Catalogue
        </Link>
        <span>/</span>
        {product.category && (
          <>
            <Link
              href={`/products?category=${product.category.id}`}
              className="hover:text-primary"
            >
              {product.category.name}
            </Link>
            <span>/</span>
          </>
        )}
        <span className="text-foreground">{product.name}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Image Gallery */}
        <div className="space-y-4">
          {/* Main Image */}
          <div
            className="relative aspect-square overflow-hidden rounded-lg bg-muted"
            onMouseEnter={() => setIsZoomed(true)}
            onMouseLeave={() => setIsZoomed(false)}
          >
            <Image
              src={product.images[selectedImage] || '/placeholder.jpg'}
              alt={product.name}
              fill
              className={`object-cover transition-transform duration-300 ${
                isZoomed ? 'scale-125' : 'scale-100'
              }`}
              priority
            />

            {/* Navigation arrows */}
            {product.images.length > 1 && (
              <>
                <button
                  onClick={handlePrevImage}
                  className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 shadow hover:bg-white"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={handleNextImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 shadow hover:bg-white"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </>
            )}

            {/* Badges */}
            <div className="absolute left-2 top-2 flex flex-col gap-1">
              {discount > 0 && (
                <Badge variant="destructive">-{discount}%</Badge>
              )}
            </div>
          </div>

          {/* Thumbnails */}
          {product.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border-2 ${
                    selectedImage === index
                      ? 'border-primary'
                      : 'border-transparent'
                  }`}
                >
                  <Image
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          {/* Category */}
          {product.category && (
            <Link
              href={`/products?category=${product.category.id}`}
              className="text-sm text-muted-foreground hover:text-primary"
            >
              {product.category.name}
            </Link>
          )}

          {/* Title */}
          <h1 className="text-3xl font-bold">{product.name}</h1>

          {/* Rating */}
          {product.rating && (
            <div className="flex items-center gap-2">
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${
                      i < Math.round(product.rating!)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-muted-foreground'
                    }`}
                  />
                ))}
              </div>
              <span className="font-medium">{product.rating.toFixed(1)}</span>
              {product.reviewCount && (
                <span className="text-muted-foreground">
                  ({product.reviewCount} avis)
                </span>
              )}
            </div>
          )}

          {/* Price */}
          <div className="flex items-center gap-3">
            <span className="text-3xl font-bold text-primary">
              {formatPrice(product.price)}
            </span>
            {product.compareAtPrice && (
              <span className="text-xl text-muted-foreground line-through">
                {formatPrice(product.compareAtPrice)}
              </span>
            )}
            {discount > 0 && (
              <Badge variant="destructive">Économisez {discount}%</Badge>
            )}
          </div>

          {/* Stock status */}
          <div className="flex items-center gap-2">
            <span
              className={`flex items-center gap-1 ${
                stockStatus.variant === 'success'
                  ? 'text-green-600'
                  : stockStatus.variant === 'warning'
                  ? 'text-yellow-600'
                  : 'text-red-600'
              }`}
            >
              <Check className="h-4 w-4" />
              {stockStatus.label}
            </span>
            <span className="text-sm text-muted-foreground">
              SKU: {product.sku}
            </span>
          </div>

          {/* Description */}
          <div>
            <h3 className="mb-2 font-semibold">Description</h3>
            <p className="text-muted-foreground">{product.description}</p>
          </div>

          {/* Attributes */}
          {product.attributes && product.attributes.length > 0 && (
            <div>
              <h3 className="mb-2 font-semibold">Caractéristiques</h3>
              <dl className="grid grid-cols-2 gap-2 text-sm">
                {product.attributes.map((attr) => (
                  <div key={attr.name} className="flex justify-between">
                    <dt className="text-muted-foreground">{attr.name}</dt>
                    <dd className="font-medium">{attr.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}

          {/* Add to cart */}
          {product.stock > 0 && (
            <div className="flex items-center gap-4">
              {/* Quantity selector */}
              <div className="flex items-center rounded-md border">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-2 hover:bg-muted"
                  disabled={quantity <= 1}
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-12 text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(maxQuantity, quantity + 1))}
                  className="px-3 py-2 hover:bg-muted"
                  disabled={quantity >= maxQuantity}
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              {/* Add to cart button */}
              <Button
                onClick={handleAddToCart}
                size="lg"
                className="flex-1"
                disabled={maxQuantity <= 0}
              >
                <ShoppingCart className="mr-2 h-5 w-5" />
                {isInCart(product.id) ? 'Ajouter encore' : 'Ajouter au panier'}
              </Button>

              {/* Wishlist */}
              <Button variant="outline" size="icon" className="h-12 w-12">
                <Heart className="h-5 w-5" />
              </Button>

              {/* Share */}
              <Button variant="outline" size="icon" className="h-12 w-12">
                <Share2 className="h-5 w-5" />
              </Button>
            </div>
          )}

          {/* Features */}
          <div className="grid grid-cols-3 gap-4 rounded-lg border p-4">
            <div className="flex flex-col items-center text-center">
              <Truck className="h-6 w-6 text-primary" />
              <span className="mt-1 text-xs">Livraison gratuite</span>
            </div>
            <div className="flex flex-col items-center text-center">
              <Shield className="h-6 w-6 text-primary" />
              <span className="mt-1 text-xs">Paiement sécurisé</span>
            </div>
            <div className="flex flex-col items-center text-center">
              <RefreshCw className="h-6 w-6 text-primary" />
              <span className="mt-1 text-xs">Retours 30j</span>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts && relatedProducts.length > 0 && (
        <section className="mt-16">
          <h2 className="mb-6 text-2xl font-bold">Produits similaires</h2>
          <ProductGrid products={relatedProducts} />
        </section>
      )}
    </div>
  );
}

function ProductPageSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Skeleton className="mb-6 h-4 w-64" />
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-4">
          <Skeleton className="aspect-square w-full rounded-lg" />
          <div className="flex gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-20 rounded-md" />
            ))}
          </div>
        </div>
        <div className="space-y-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-10 w-40" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    </div>
  );
}
