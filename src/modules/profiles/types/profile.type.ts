export interface ProfileRecord {
  id: string;
  userId: string;
  phone: string | null;
  avatarUrl: string | null;
  bio: string | null;
  createdAt: Date;
  updatedAt: Date;
}
