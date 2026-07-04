export interface UserListItemDto {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  isActive: boolean;
  createdAt: string;
}

export interface UsersListResponseDto {
  users: UserListItemDto[];
  total: number;
  page: number;
  limit: number;
}
