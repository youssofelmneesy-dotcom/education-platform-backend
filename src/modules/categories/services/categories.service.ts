import type { CreateCategoryRequestDto, CategoryResponseDto, CategoriesListResponseDto, UpdateCategoryRequestDto } from "../dto/index.js";
import type { ICategoriesRepository, ICategoriesService } from "../interfaces/index.js";
import { CategoriesRepository } from "../repositories/index.js";
import { DuplicateCategorySlugError, CategoryNotFoundError } from "../utils/index.js";

export class CategoriesService implements ICategoriesService {
  constructor(private readonly categoriesRepository: ICategoriesRepository = new CategoriesRepository()) {}

  async create(tenantId: string, data: CreateCategoryRequestDto): Promise<CategoryResponseDto> {
    const existing = await this.categoriesRepository.findBySlug(data.slug, tenantId);

    if (existing) {
      throw new DuplicateCategorySlugError();
    }

    const category = await this.categoriesRepository.create(tenantId, data);

    return {
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      createdAt: category.createdAt.toISOString(),
      updatedAt: category.updatedAt.toISOString(),
    };
  }

  async list(tenantId: string, page: number, limit: number): Promise<CategoriesListResponseDto> {
    const { categories, total } = await this.categoriesRepository.list(tenantId, page, limit);

    return {
      categories: categories.map((category) => ({
        id: category.id,
        name: category.name,
        slug: category.slug,
        description: category.description,
        createdAt: category.createdAt.toISOString(),
        updatedAt: category.updatedAt.toISOString(),
      })),
      total,
      page,
      limit,
    };
  }

  async getById(id: string, tenantId: string): Promise<CategoryResponseDto> {
    const category = await this.categoriesRepository.findById(id, tenantId);

    if (!category) {
      throw new CategoryNotFoundError();
    }

    return {
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      createdAt: category.createdAt.toISOString(),
      updatedAt: category.updatedAt.toISOString(),
    };
  }

  async updateById(id: string, tenantId: string, data: UpdateCategoryRequestDto): Promise<CategoryResponseDto> {
    if (data.slug) {
      const existing = await this.categoriesRepository.findBySlug(data.slug, tenantId);

      if (existing && existing.id !== id) {
        throw new DuplicateCategorySlugError();
      }
    }

    const category = await this.categoriesRepository.updateById(id, tenantId, data);

    if (!category) {
      throw new CategoryNotFoundError();
    }

    return {
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      createdAt: category.createdAt.toISOString(),
      updatedAt: category.updatedAt.toISOString(),
    };
  }

  async deleteById(id: string, tenantId: string): Promise<void> {
    const category = await this.categoriesRepository.findById(id, tenantId);

    if (!category) {
      throw new CategoryNotFoundError();
    }

    await this.categoriesRepository.softDeleteById(id, tenantId);
  }
}
