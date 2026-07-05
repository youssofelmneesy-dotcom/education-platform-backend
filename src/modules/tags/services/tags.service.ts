import type { CreateTagRequestDto, TagResponseDto, TagsListResponseDto, UpdateTagRequestDto } from "../dto/index.js";
import type { ITagsRepository, ITagsService } from "../interfaces/index.js";
import { TagsRepository } from "../repositories/index.js";
import { DuplicateTagSlugError, TagNotFoundError } from "../utils/index.js";

export class TagsService implements ITagsService {
  constructor(private readonly tagsRepository: ITagsRepository = new TagsRepository()) {}

  async create(tenantId: string, data: CreateTagRequestDto): Promise<TagResponseDto> {
    const existing = await this.tagsRepository.findBySlug(data.slug, tenantId);

    if (existing) {
      throw new DuplicateTagSlugError();
    }

    const tag = await this.tagsRepository.create(tenantId, data);

    return {
      id: tag.id,
      name: tag.name,
      slug: tag.slug,
      createdAt: tag.createdAt.toISOString(),
      updatedAt: tag.updatedAt.toISOString(),
    };
  }

  async list(tenantId: string, page: number, limit: number): Promise<TagsListResponseDto> {
    const { tags, total } = await this.tagsRepository.list(tenantId, page, limit);

    return {
      tags: tags.map((tag) => ({
        id: tag.id,
        name: tag.name,
        slug: tag.slug,
        createdAt: tag.createdAt.toISOString(),
        updatedAt: tag.updatedAt.toISOString(),
      })),
      total,
      page,
      limit,
    };
  }

  async getById(id: string, tenantId: string): Promise<TagResponseDto> {
    const tag = await this.tagsRepository.findById(id, tenantId);

    if (!tag) {
      throw new TagNotFoundError();
    }

    return {
      id: tag.id,
      name: tag.name,
      slug: tag.slug,
      createdAt: tag.createdAt.toISOString(),
      updatedAt: tag.updatedAt.toISOString(),
    };
  }

  async updateById(id: string, tenantId: string, data: UpdateTagRequestDto): Promise<TagResponseDto> {
    if (data.slug) {
      const existing = await this.tagsRepository.findBySlug(data.slug, tenantId);

      if (existing && existing.id !== id) {
        throw new DuplicateTagSlugError();
      }
    }

    const tag = await this.tagsRepository.updateById(id, tenantId, data);

    if (!tag) {
      throw new TagNotFoundError();
    }

    return {
      id: tag.id,
      name: tag.name,
      slug: tag.slug,
      createdAt: tag.createdAt.toISOString(),
      updatedAt: tag.updatedAt.toISOString(),
    };
  }

  async deleteById(id: string, tenantId: string): Promise<void> {
    const tag = await this.tagsRepository.findById(id, tenantId);

    if (!tag) {
      throw new TagNotFoundError();
    }

    await this.tagsRepository.softDeleteById(id, tenantId);
  }
}
