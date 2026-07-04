import type { CreatePermissionRequestDto, PermissionResponseDto, PermissionsListResponseDto, UpdatePermissionRequestDto } from "../dto/index.js";
import type { IPermissionsRepository, IPermissionsService } from "../interfaces/index.js";
import { PermissionsRepository } from "../repositories/index.js";
import { DuplicatePermissionError, PermissionNotFoundError } from "../utils/index.js";

export class PermissionsService implements IPermissionsService {
  constructor(private readonly permissionsRepository: IPermissionsRepository = new PermissionsRepository()) {}

  async create(tenantId: string, data: CreatePermissionRequestDto): Promise<PermissionResponseDto> {
    const existing = await this.permissionsRepository.findByResourceAction(data.resource, data.action, tenantId);

    if (existing) {
      throw new DuplicatePermissionError();
    }

    const permission = await this.permissionsRepository.create(tenantId, data);

    return {
      id: permission.id,
      resource: permission.resource,
      action: permission.action,
      description: permission.description,
      createdAt: permission.createdAt.toISOString(),
      updatedAt: permission.updatedAt.toISOString(),
    };
  }

  async list(tenantId: string, page: number, limit: number): Promise<PermissionsListResponseDto> {
    const { permissions, total } = await this.permissionsRepository.list(tenantId, page, limit);

    return {
      permissions: permissions.map((permission) => ({
        id: permission.id,
        resource: permission.resource,
        action: permission.action,
        description: permission.description,
        createdAt: permission.createdAt.toISOString(),
        updatedAt: permission.updatedAt.toISOString(),
      })),
      total,
      page,
      limit,
    };
  }

  async getById(id: string, tenantId: string): Promise<PermissionResponseDto> {
    const permission = await this.permissionsRepository.findById(id, tenantId);

    if (!permission) {
      throw new PermissionNotFoundError();
    }

    return {
      id: permission.id,
      resource: permission.resource,
      action: permission.action,
      description: permission.description,
      createdAt: permission.createdAt.toISOString(),
      updatedAt: permission.updatedAt.toISOString(),
    };
  }

  async updateById(id: string, tenantId: string, data: UpdatePermissionRequestDto): Promise<PermissionResponseDto> {
    const permission = await this.permissionsRepository.findById(id, tenantId);

    if (!permission) {
      throw new PermissionNotFoundError();
    }

    const updatedResource = data.resource ?? permission.resource;
    const updatedAction = data.action ?? permission.action;

    const existing = await this.permissionsRepository.findByResourceAction(updatedResource, updatedAction, tenantId);

    if (existing && existing.id !== id) {
      throw new DuplicatePermissionError();
    }

    const updatedPermission = await this.permissionsRepository.updateById(id, tenantId, data);

    if (!updatedPermission) {
      throw new PermissionNotFoundError();
    }

    return {
      id: updatedPermission.id,
      resource: updatedPermission.resource,
      action: updatedPermission.action,
      description: updatedPermission.description,
      createdAt: updatedPermission.createdAt.toISOString(),
      updatedAt: updatedPermission.updatedAt.toISOString(),
    };
  }

  async deleteById(id: string, tenantId: string): Promise<void> {
    const permission = await this.permissionsRepository.findById(id, tenantId);

    if (!permission) {
      throw new PermissionNotFoundError();
    }

    await this.permissionsRepository.softDeleteById(id, tenantId);
  }
}
