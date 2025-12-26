export type UserRole = 'recruteur' | 'candidat';

export interface User {
  id?: string | number;
  email: string;
  password: string;
  role: UserRole;
}
