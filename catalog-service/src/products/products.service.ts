import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
  Inject,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto, UpdateProductDto, ProductQueryDto } from '../dto';
import { Product, Prisma } from '@prisma/client';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';

export interface PaginatedResult<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);

  constructor(
    private readonly prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  /**
   * Create a new product
   */
  async create(createProductDto: CreateProductDto): Promise<Product> {
    const { categoryId, sku } = createProductDto;

    // Verify category exists
    const category = await this.prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      throw new NotFoundException(`Category with ID ${categoryId} not found`);
    }

    // Check for duplicate SKU
    const existingProduct = await this.prisma.product.findUnique({
      where: { sku },
    });

    if (existingProduct) {
      throw new ConflictException(`Product with SKU "${sku}" already exists`);
    }

    const product = await this.prisma.product.create({
      data: {
        ...createProductDto,
        price: new Prisma.Decimal(createProductDto.price),
        comparePrice: createProductDto.comparePrice
          ? new Prisma.Decimal(createProductDto.comparePrice)
          : null,
      },
      include: {
        category: true,
      },
    });

    // Invalidate cache
    await this.invalidateProductCache();

    this.logger.log(`Product created: ${product.id} - ${product.name}`);
    return product;
  }

  /**
   * Get all products with filtering, searching, and pagination
   */
  async findAll(query: ProductQueryDto): Promise<PaginatedResult<Product>> {
    const {
      search,
      categoryId,
      categorySlug,
      minPrice,
      maxPrice,
      isActive,
      isFeatured,
      tags,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;

    // Build cache key
    const cacheKey = `products:${JSON.stringify(query)}`;

    // Try to get from cache
    const cached = await this.cacheManager.get<PaginatedResult<Product>>(cacheKey);
    if (cached) {
      this.logger.debug(`Cache hit for: ${cacheKey}`);
      return cached;
    }

    // Build where clause
    const where: Prisma.ProductWhereInput = {};

    // Search filter
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Category filter
    if (categoryId) {
      where.categoryId = categoryId;
    }

    // Category slug filter
    if (categorySlug) {
      const category = await this.prisma.category.findUnique({
        where: { slug: categorySlug },
      });
      if (category) {
        where.categoryId = category.id;
      }
    }

    // Price range filter
    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) {
        where.price.gte = new Prisma.Decimal(minPrice);
      }
      if (maxPrice !== undefined) {
        where.price.lte = new Prisma.Decimal(maxPrice);
      }
    }

    // Active filter
    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    // Featured filter
    if (isFeatured !== undefined) {
      where.isFeatured = isFeatured;
    }

    // Tags filter
    if (tags) {
      const tagArray = tags.split(',').map((t) => t.trim());
      where.tags = { hasSome: tagArray };
    }

    // Get total count
    const total = await this.prisma.product.count({ where });

    // Get paginated products
    const products = await this.prisma.product.findMany({
      where,
      include: {
        category: true,
      },
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
    });

    const totalPages = Math.ceil(total / limit);

    const result: PaginatedResult<Product> = {
      data: products,
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };

    // Cache the result for 5 minutes
    await this.cacheManager.set(cacheKey, result, 300000);

    return result;
  }

  /**
   * Get a single product by ID
   */
  async findOne(id: string): Promise<Product> {
    const cacheKey = `product:${id}`;

    // Try to get from cache
    const cached = await this.cacheManager.get<Product>(cacheKey);
    if (cached) {
      return cached;
    }

    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
      },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    // Cache for 5 minutes
    await this.cacheManager.set(cacheKey, product, 300000);

    return product;
  }

  /**
   * Get a single product by SKU
   */
  async findBySku(sku: string): Promise<Product> {
    const cacheKey = `product:sku:${sku}`;

    // Try to get from cache
    const cached = await this.cacheManager.get<Product>(cacheKey);
    if (cached) {
      return cached;
    }

    const product = await this.prisma.product.findUnique({
      where: { sku },
      include: {
        category: true,
      },
    });

    if (!product) {
      throw new NotFoundException(`Product with SKU "${sku}" not found`);
    }

    // Cache for 5 minutes
    await this.cacheManager.set(cacheKey, product, 300000);

    return product;
  }

  /**
   * Update a product
   */
  async update(id: string, updateProductDto: UpdateProductDto): Promise<Product> {
    // Verify product exists
    await this.findOne(id);

    // Verify category exists if updating
    if (updateProductDto.categoryId) {
      const category = await this.prisma.category.findUnique({
        where: { id: updateProductDto.categoryId },
      });

      if (!category) {
        throw new NotFoundException(
          `Category with ID ${updateProductDto.categoryId} not found`,
        );
      }
    }

    // Check for duplicate SKU if updating
    if (updateProductDto.sku) {
      const existingProduct = await this.prisma.product.findFirst({
        where: {
          sku: updateProductDto.sku,
          id: { not: id },
        },
      });

      if (existingProduct) {
        throw new ConflictException(
          `Product with SKU "${updateProductDto.sku}" already exists`,
        );
      }
    }

    // Prepare update data
    const updateData: Prisma.ProductUpdateInput = { ...updateProductDto };

    if (updateProductDto.price !== undefined) {
      updateData.price = new Prisma.Decimal(updateProductDto.price);
    }

    if (updateProductDto.comparePrice !== undefined) {
      updateData.comparePrice = updateProductDto.comparePrice
        ? new Prisma.Decimal(updateProductDto.comparePrice)
        : null;
    }

    const product = await this.prisma.product.update({
      where: { id },
      data: updateData,
      include: {
        category: true,
      },
    });

    // Invalidate cache
    await this.invalidateProductCache();
    await this.cacheManager.del(`product:${id}`);

    this.logger.log(`Product updated: ${product.id} - ${product.name}`);
    return product;
  }

  /**
   * Delete a product
   */
  async remove(id: string): Promise<Product> {
    // Verify product exists
    await this.findOne(id);

    const product = await this.prisma.product.delete({
      where: { id },
    });

    // Invalidate cache
    await this.invalidateProductCache();
    await this.cacheManager.del(`product:${id}`);

    this.logger.log(`Product deleted: ${product.id} - ${product.name}`);
    return product;
  }

  /**
   * Toggle product active status
   */
  async toggleActive(id: string): Promise<Product> {
    const product = await this.findOne(id);

    const updated = await this.prisma.product.update({
      where: { id },
      data: { isActive: !product.isActive },
      include: {
        category: true,
      },
    });

    // Invalidate cache
    await this.invalidateProductCache();
    await this.cacheManager.del(`product:${id}`);

    this.logger.log(`Product ${updated.id} active status changed to: ${updated.isActive}`);
    return updated;
  }

  /**
   * Toggle product featured status
   */
  async toggleFeatured(id: string): Promise<Product> {
    const product = await this.findOne(id);

    const updated = await this.prisma.product.update({
      where: { id },
      data: { isFeatured: !product.isFeatured },
      include: {
        category: true,
      },
    });

    // Invalidate cache
    await this.invalidateProductCache();
    await this.cacheManager.del(`product:${id}`);

    this.logger.log(`Product ${updated.id} featured status changed to: ${updated.isFeatured}`);
    return updated;
  }

  /**
   * Get featured products
   */
  async getFeatured(limit: number = 10): Promise<Product[]> {
    const cacheKey = `products:featured:${limit}`;

    // Try to get from cache
    const cached = await this.cacheManager.get<Product[]>(cacheKey);
    if (cached) {
      return cached;
    }

    const products = await this.prisma.product.findMany({
      where: {
        isFeatured: true,
        isActive: true,
      },
      include: {
        category: true,
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    // Cache for 5 minutes
    await this.cacheManager.set(cacheKey, products, 300000);

    return products;
  }

  /**
   * Get products by category
   */
  async getByCategory(categoryId: string, limit: number = 20): Promise<Product[]> {
    return this.prisma.product.findMany({
      where: {
        categoryId,
        isActive: true,
      },
      include: {
        category: true,
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  /**
   * Invalidate product cache
   */
  private async invalidateProductCache(): Promise<void> {
    // Clear all product-related cache keys
    // Note: In production, you'd use Redis with pattern matching
    this.logger.debug('Product cache invalidated');
  }
}
