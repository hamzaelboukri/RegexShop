import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Create categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: 'electronics' },
      update: {},
      create: {
        name: 'Electronics',
        slug: 'electronics',
        description: 'Electronic devices, gadgets, and accessories',
        isActive: true,
      },
    }),
    prisma.category.upsert({
      where: { slug: 'clothing' },
      update: {},
      create: {
        name: 'Clothing',
        slug: 'clothing',
        description: 'Fashion apparel for men and women',
        isActive: true,
      },
    }),
    prisma.category.upsert({
      where: { slug: 'home-garden' },
      update: {},
      create: {
        name: 'Home & Garden',
        slug: 'home-garden',
        description: 'Home decor, furniture, and garden supplies',
        isActive: true,
      },
    }),
    prisma.category.upsert({
      where: { slug: 'sports' },
      update: {},
      create: {
        name: 'Sports & Outdoors',
        slug: 'sports',
        description: 'Sports equipment and outdoor gear',
        isActive: true,
      },
    }),
    prisma.category.upsert({
      where: { slug: 'books' },
      update: {},
      create: {
        name: 'Books',
        slug: 'books',
        description: 'Books, e-books, and audiobooks',
        isActive: true,
      },
    }),
  ]);

  console.log(`✅ Created ${categories.length} categories`);

  // Create sample products
  const electronicsCategory = categories.find((c) => c.slug === 'electronics');
  const clothingCategory = categories.find((c) => c.slug === 'clothing');
  const sportsCategory = categories.find((c) => c.slug === 'sports');

  const products = await Promise.all([
    // Electronics
    prisma.product.upsert({
      where: { sku: 'IPHONE-15-PRO-256' },
      update: {},
      create: {
        name: 'iPhone 15 Pro 256GB',
        description: 'The latest iPhone with A17 Pro chip, titanium design, and advanced camera system.',
        sku: 'IPHONE-15-PRO-256',
        price: 999.99,
        comparePrice: 1099.99,
        images: [
          'https://example.com/iphone15-1.jpg',
          'https://example.com/iphone15-2.jpg',
        ],
        isActive: true,
        isFeatured: true,
        categoryId: electronicsCategory!.id,
        tags: ['smartphone', 'apple', 'premium', '5g'],
        metadata: {
          color: 'Natural Titanium',
          storage: '256GB',
          warranty: '1 year',
        },
      },
    }),
    prisma.product.upsert({
      where: { sku: 'MACBOOK-PRO-14' },
      update: {},
      create: {
        name: 'MacBook Pro 14-inch M3',
        description: 'Powerful laptop with M3 chip, stunning Liquid Retina XDR display.',
        sku: 'MACBOOK-PRO-14',
        price: 1999.99,
        images: ['https://example.com/macbook-1.jpg'],
        isActive: true,
        isFeatured: true,
        categoryId: electronicsCategory!.id,
        tags: ['laptop', 'apple', 'professional'],
        metadata: {
          processor: 'M3 Pro',
          ram: '18GB',
          storage: '512GB SSD',
        },
      },
    }),
    prisma.product.upsert({
      where: { sku: 'AIRPODS-PRO-2' },
      update: {},
      create: {
        name: 'AirPods Pro 2nd Generation',
        description: 'Active noise cancellation, spatial audio, and all-day battery life.',
        sku: 'AIRPODS-PRO-2',
        price: 249.99,
        comparePrice: 279.99,
        images: ['https://example.com/airpods-1.jpg'],
        isActive: true,
        isFeatured: false,
        categoryId: electronicsCategory!.id,
        tags: ['audio', 'apple', 'wireless'],
        metadata: {
          type: 'In-ear',
          noiseControl: true,
        },
      },
    }),

    // Clothing
    prisma.product.upsert({
      where: { sku: 'TSHIRT-CLASSIC-BLK-M' },
      update: {},
      create: {
        name: 'Classic Cotton T-Shirt - Black',
        description: '100% organic cotton t-shirt, comfortable fit for everyday wear.',
        sku: 'TSHIRT-CLASSIC-BLK-M',
        price: 29.99,
        images: ['https://example.com/tshirt-1.jpg'],
        isActive: true,
        isFeatured: false,
        categoryId: clothingCategory!.id,
        tags: ['tshirt', 'cotton', 'casual'],
        metadata: {
          size: 'M',
          color: 'Black',
          material: '100% Organic Cotton',
        },
      },
    }),
    prisma.product.upsert({
      where: { sku: 'JEANS-SLIM-BLU-32' },
      update: {},
      create: {
        name: 'Slim Fit Jeans - Blue',
        description: 'Modern slim fit jeans with stretch fabric for ultimate comfort.',
        sku: 'JEANS-SLIM-BLU-32',
        price: 79.99,
        comparePrice: 99.99,
        images: ['https://example.com/jeans-1.jpg'],
        isActive: true,
        isFeatured: true,
        categoryId: clothingCategory!.id,
        tags: ['jeans', 'denim', 'slim'],
        metadata: {
          size: '32',
          color: 'Blue',
          material: '98% Cotton, 2% Elastane',
        },
      },
    }),

    // Sports
    prisma.product.upsert({
      where: { sku: 'YOGA-MAT-PRO' },
      update: {},
      create: {
        name: 'Professional Yoga Mat',
        description: 'Extra thick, non-slip yoga mat for professional practice.',
        sku: 'YOGA-MAT-PRO',
        price: 49.99,
        images: ['https://example.com/yoga-mat-1.jpg'],
        isActive: true,
        isFeatured: false,
        categoryId: sportsCategory!.id,
        tags: ['yoga', 'fitness', 'exercise'],
        metadata: {
          thickness: '6mm',
          material: 'TPE',
          dimensions: '183cm x 61cm',
        },
      },
    }),
    prisma.product.upsert({
      where: { sku: 'DUMBBELL-SET-20KG' },
      update: {},
      create: {
        name: 'Adjustable Dumbbell Set 20kg',
        description: 'Space-saving adjustable dumbbells from 2.5kg to 20kg.',
        sku: 'DUMBBELL-SET-20KG',
        price: 199.99,
        comparePrice: 249.99,
        images: ['https://example.com/dumbbell-1.jpg'],
        isActive: true,
        isFeatured: true,
        categoryId: sportsCategory!.id,
        tags: ['fitness', 'weights', 'strength'],
        metadata: {
          weightRange: '2.5kg - 20kg',
          material: 'Steel with rubber coating',
        },
      },
    }),
  ]);

  console.log(`✅ Created ${products.length} products`);
  console.log('🎉 Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
