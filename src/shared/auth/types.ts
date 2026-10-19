export type UserRole = 'CONSULTANT' | 'ADMIN';

export interface SessionUser {
  id: string;
  login: string;
  name: string;
  role: UserRole;
}
