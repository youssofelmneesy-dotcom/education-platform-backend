import type { UpdateUserDto, UserDetailDto, UsersListResponseDto } from "../dto/index.js";

export interface IUsersService {
  listUsers(tenantId: string, page: number, limit: number): Promise<UsersListResponseDto>;
  getUserById(id: string, tenantId: string, currentUserId: string, isAdmin: boolean): Promise<UserDetailDto>;
  updateUser(id: string, tenantId: string, currentUserId: string, isAdmin: boolean, data: UpdateUserDto): Promise<UserDetailDto>;
  deleteUser(id: string, tenantId: string, currentUserId: string, isAdmin: boolean): Promise<void>;
}
