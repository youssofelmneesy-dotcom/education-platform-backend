export interface CreateAuthUserData {
  firstName: string;
  lastName: string;
  email: string;
  passwordHash: string;
}

export interface AuthUserRecord {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  createdAt: Date;
}
