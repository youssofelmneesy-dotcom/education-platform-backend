import type { CreateRoleRequestDto, RoleResponseDto, RolesListResponseDto, UpdateRoleRequestDto } from "../dto/index.js";
import type { IRolesRepository, IRolesService } from "../interfaces/index.js";
import { RolesRepository } from "../repositories/index.js";
import { DuplicateRoleNameError, RoleNotFoundError } from "../utils/index.js";

export class RolesService implements IRolesService {
  constructor(private readonly rolesRepository: IRolesRepository = new RolesRepository()) {}

  async create(tenantId: string, data: CreateRoleRequestDto): Promise<RoleResponseDto> {
    const existing = await this.rolesRepository.findByName(data.name, tenantId);

    if (existing) {
      throw new DuplicateRoleNameError();
    }

    const role = await this.rolesRepository.create(tenantId, data);

    return {
      id: role.id,
      name: role.name,
      description: role.description,
      isSystem: role.isSystem,
      createdAt: role.createdAt.toISOString(),
      updatedAt: role.updatedAt.toISOString(),
    };
  }

  async list(tenantId: string, page: number, limit: number): Promise<RolesListResponseDto> {
    const { roles, total } = await this.rolesRepository.list(tenantId, page, limit);

    return {
      roles: roles.map((role) => ({
        id: role.id,
        name: role.name,
        description: role.description,
        isSystem: role.isSystem,
        createdAt: role.createdAt.toISOString(),
        updatedAt: role.updatedAt.toISOString(),
      })),
      total,
      page,
      limit,
    };
  }

  async getById(id: string, tenantId: string): Promise<RoleResponseDto> {
    const role = await this.rolesRepository.findById(id, tenantId);

    if (!role) {
      throw new RoleNotFoundError();
    }

    return {
      id: role.id,
      name: role.name,
      description: role.description,
      isSystem: role.isSystem,
      createdAt: role.createdAt.toISOString(),
      updatedAt: role.updatedAt.toISOString(),
    };
  }

  async updateById(id: string, tenantId: string, data: UpdateRoleRequestDto): Promise<RoleResponseDto> {
    if (data.name) {
      const existing = await this.rolesRepository.findByName(data.name, tenantId);

      if (existing && existing.id !== id) {
        throw new DuplicateRoleNameError();
      }
    }

    const role = await this.rolesRepository.updateById(id, tenantId, data);

    if (!role) {
      throw new RoleNotFoundError();
    }

    return {
      id: role.id,
      name: role.name,
      description: role.description,
      isSystem: role.isSystem,
      createdAt: role.createdAt.toISOString(),
      updatedAt: role.updatedAt.toISOString(),
    };
  }

  async deleteById(id: string, tenantId: string): Promise<void> {
    const role = await this.rolesRepository.findById(id, tenantId);

    if (!role) {
      throw new RoleNotFoundError();
    }

    await this.rolesRepository.softDeleteById(id, tenantId);
  }
}
