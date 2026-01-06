import { Injectable, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto, UpdateCategoryDto } from '../dto';
import { Category } from '@prisma/client';

@Injectable()
export class CategoriesService {
  private readonly logger = new Logger(CategoriesService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a new category
   */
  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    const { name, slug } = createCategoryDto;

    // Check for duplicate name or slug
    const existingCategory = await this.prisma.category.findFirst({
      where: {
        OR: [{ name }, { slug }],
      },
    });

    if (existingCategory) {
      throw new ConflictException(
        existingCategory.name === name
          ? 'Category with this name already exists'
          : 'Category with this slug already exists',
      );
    }

    const category = await this.prisma.category.create({
      data: createCategoryDto,
    });

    this.logger.log(`Category created: ${category.id} - ${category.name}`);
    return category;
  }

  /**
   * Get all categories (with optional active filter)
   */
  async findAll(activeOnly: boolean = false): Promise<Category[]> {
    return this.prisma.category.findMany({
      where: activeOnly ? { isActive: true } : undefined,
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });
  }

  /**
   * Get a single category by ID
   */
  async findOne(id: string): Promise<Category> {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    return category;
  }

  /**
   * Get a single category by slug
   */
  async findBySlug(slug: string): Promise<Category> {
    const category = await this.prisma.category.findUnique({
      where: { slug },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    if (!category) {
      throw new NotFoundException(`Category with slug "${slug}" not found`);
    }

    return category;
  }

  /**
   * Update a category
   */
  async update(id: string, updateCategoryDto: UpdateCategoryDto): Promise<Category> {
    // Verify category exists
    await this.findOne(id);

    // Check for duplicate name or slug if updating
    if (updateCategoryDto.name || updateCategoryDto.slug) {
      const existingCategory = await this.prisma.category.findFirst({
        where: {
          AND: [
            { id: { not: id } },
            {
              OR: [
                updateCategoryDto.name ? { name: updateCategoryDto.name } : {},
                updateCategoryDto.slug ? { slug: updateCategoryDto.slug } : {},
              ].filter((obj) => Object.keys(obj).length > 0),
            },
          ],
        },
      });

      if (existingCategory) {
        throw new ConflictException(
          existingCategory.name === updateCategoryDto.name
            ? 'Category with this name already exists'
            : 'Category with this slug already exists',
        );
      }
    }

    const category = await this.prisma.category.update({
      where: { id },
      data: updateCategoryDto,
    });

    this.logger.log(`Category updated: ${category.id} - ${category.name}`);
    return category;
  }

  /**
   * Delete a category (soft delete by setting isActive to false)
   */
  async remove(id: string): Promise<Category> {
    // Verify category exists
    await this.findOne(id);

    // Check if category has products
    const productCount = await this.prisma.product.count({
      where: { categoryId: id },
    });

    if (productCount > 0) {
      throw new ConflictException(
        `Cannot delete category with ${productCount} associated products. Remove products first or deactivate the category.`,
      );
    }

    const category = await this.prisma.category.delete({
      where: { id },
    });

    this.logger.log(`Category deleted: ${category.id} - ${category.name}`);
    return category;
  }

  /**
   * Toggle category active status
   */
  async toggleActive(id: string): Promise<Category> {
    const category = await this.findOne(id);

    const updated = await this.prisma.category.update({
      where: { id },
      data: { isActive: !category.isActive },
    });

    this.logger.log(`Category ${updated.id} active status changed to: ${updated.isActive}`);
    return updated;
  }
}
