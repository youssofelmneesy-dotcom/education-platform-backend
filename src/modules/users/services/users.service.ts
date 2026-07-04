import type { UpdateUserDto, UserDetailDto, UsersListResponseDto } from "../dto/index.js";
import type { IUsersRepository, IUsersService } from "../interfaces/index.js";
import { UsersRepository } from "../repositories/index.js";
import { ForbiddenError, NotFoundError } from "../utils/index.js";

export class UsersService implements IUsersService {
  constructor(private readonly usersRepository: IUsersRepository = new UsersRepository()) {}

  async listUsers(tenantId: string, page: number, limit: number): Promise<UsersListResponseDto> {
    const { users, total } = await this.usersRepository.listByTenant(tenantId, page, limit);

    return {
      users: users.map((user) => ({
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        isActive: user.isActive,
        createdAt: user.createdAt.toISOString(),
      })),
      total,
      page,
      limit,
    };
  }

  async getUserById(id: string, tenantId: string, currentUserId: string, isAdmin: boolean): Promise<UserDetailDto> {
    // Authorization: user can only view own profile unless admin
    if (id !== currentUserId && !isAdmin) {
      throw new ForbiddenError();
    }

    const user = await this.usersRepository.findById(id, tenantId);

    if (!user) {
      throw new NotFoundError("User");
    }

    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      isActive: user.isActive,
      createdAt: user.createdAt.toISOString(),
    };
  }

  async updateUser(id: string, tenantId: string, currentUserId: string, isAdmin: boolean, data: UpdateUserDto): Promise<UserDetailDto> {
    // Authorization: user can only update own profile unless admin
    if (id !== currentUserId && !isAdmin) {
      throw new ForbiddenError();
    }

    const updated = await this.usersRepository.updateById(id, tenantId, data);

    if (!updated) {
      throw new NotFoundError("User");
    }

    return {
      id: updated.id,
      firstName: updated.firstName,
      lastName: updated.lastName,
      email: updated.email,
      isActive: updated.isActive,
      createdAt: updated.createdAt.toISOString(),
    };
  }

  async deleteUser(id: string, tenantId: string, currentUserId: string, isAdmin: boolean): Promise<void> {
    // Authorization: user can only delete own profile unless admin
    if (id !== currentUserId && !isAdmin) {
      throw new ForbiddenError();
    }

    const user = await this.usersRepository.findById(id, tenantId);

    if (!user) {
      throw new NotFoundError("User");
    }

    await this.usersRepository.softDeleteById(id, tenantId);
  }
}
