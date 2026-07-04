export interface ProfileDto {
  id: string;
  userId: string;
  phone: string | null;
  avatarUrl: string | null;
  bio: string | null;
  createdAt: string;
  updatedAt: string;
}
