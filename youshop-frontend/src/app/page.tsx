'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowRight, Truck, Shield, RefreshCw, Headphones } from 'lucide-react';
import { useFeaturedProducts, useCategories } from '@/hooks/use-products';
import { ProductGrid } from '@/components/products/product-grid';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  const { data: featuredProducts, isLoading: isLoadingProducts } = useFeaturedProducts(8);
  const { data: categories, isLoading: isLoadingCategories } = useCategories();

  const features = [
    {
      icon: Truck,
      title: 'Livraison gratuite',
      description: 'À partir de 50€ d\'achat',
    },
    {
      icon: Shield,
      title: 'Paiement sécurisé',
      description: 'Stripe & 3D Secure',
    },
    {
      icon: RefreshCw,
      title: 'Retours gratuits',
      description: 'Sous 30 jours',
    },
    {
      icon: Headphones,
      title: 'Support 24/7',
      description: 'À votre écoute',
    },
  ];

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-primary/10 via-primary/5 to-background py-20">
        <div className="container mx-auto px-4">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
                Découvrez notre{' '}
                <span className="text-primary">nouvelle collection</span>
              </h1>
              <p className="mt-6 text-lg text-muted-foreground">
                Explorez des milliers de produits de qualité à prix compétitifs. 
                Livraison rapide et retours gratuits sous 30 jours.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link href="/products">
                  <Button size="lg">
                    Voir le catalogue
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/categories">
                  <Button variant="outline" size="lg">
                    Explorer les catégories
                  </Button>
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="relative hidden lg:block"
            >
              <div className="relative aspect-square">
                <Image
                  src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800"
                  alt="Hero shopping"
                  fill
                  className="rounded-lg object-cover"
                  priority
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-b py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="flex flex-col items-center text-center"
              >
                <div className="rounded-full bg-primary/10 p-3">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mt-3 font-semibold">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      {categories && categories.length > 0 && (
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Catégories populaires</h2>
              <Link href="/categories">
                <Button variant="ghost">
                  Voir tout
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
              {categories.slice(0, 6).map((category, index) => (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <Link
                    href={`/products?category=${category.id}`}
                    className="group block overflow-hidden rounded-lg border bg-card transition-all hover:shadow-md"
                  >
                    <div className="relative aspect-square bg-muted">
                      {category.image && (
                        <Image
                          src={category.image}
                          alt={category.name}
                          fill
                          className="object-cover transition-transform group-hover:scale-105"
                        />
                      )}
                    </div>
                    <div className="p-3 text-center">
                      <h3 className="font-medium group-hover:text-primary">
                        {category.name}
                      </h3>
                      {category.productCount !== undefined && (
                        <p className="text-xs text-muted-foreground">
                          {category.productCount} produits
                        </p>
                      )}
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Products */}
      <section className="bg-muted/50 py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Produits populaires</h2>
            <Link href="/products">
              <Button variant="ghost">
                Voir tout
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="mt-8">
            <ProductGrid
              products={featuredProducts || []}
              isLoading={isLoadingProducts}
              emptyMessage="Aucun produit disponible"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary py-16 text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold">
            Inscrivez-vous à notre newsletter
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-primary-foreground/80">
            Recevez en exclusivité nos offres spéciales, nouveautés et 10% de réduction sur votre première commande.
          </p>
          <div className="mx-auto mt-8 flex max-w-md gap-2">
            <input
              type="email"
              placeholder="Votre email"
              className="flex-1 rounded-md border-0 bg-white/10 px-4 py-3 text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-white/50"
            />
            <Button variant="secondary" size="lg">
              S&apos;inscrire
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
