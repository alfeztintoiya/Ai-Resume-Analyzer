export interface User {
  id: string;
  email: string;
  name?: string;
  username?: string;
  profile_pic?: string; // Match backend snake_case
  profilePic?: string;  // Frontend camelCase (computed)
  phone?: string;
  date_of_birth?: string; // Match backend snake_case
  dateOfBirth?: string;   // Frontend camelCase (computed)
  is_verified: boolean;   // Match backend snake_case
  isVerified?: boolean;   // Frontend camelCase (computed)
  role: UserRole;
  created_at: string;     // Match backend snake_case
  createdAt?: string;     // Frontend camelCase (computed)
  updated_at: string;     // Match backend snake_case
  updatedAt?: string;     // Frontend camelCase (computed)
}

export const UserRole = {
  USER: 'USER',
  ADMIN: 'ADMIN'
} as const;

export type UserRole = typeof UserRole[keyof typeof UserRole];

export interface CreateUserData {
  name: string;
  email: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface UserProfile {
  id: string;
  email: string;
  name?: string;
  username?: string;
  profilePic?: string;
  phone?: string;
  dateOfBirth?: string;
  isVerified: boolean;
  role: UserRole;
}
