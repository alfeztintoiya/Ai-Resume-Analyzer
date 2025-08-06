export interface User {
  id: string;
  email: string;
  first_name?: string;  // Match backend snake_case
  last_name?: string;   // Match backend snake_case
  firstName?: string;   // Frontend camelCase (computed)
  lastName?: string;    // Frontend camelCase (computed)
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
  firstName: string;
  lastName: string;
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
  firstName?: string;
  lastName?: string;
  username?: string;
  profilePic?: string;
  phone?: string;
  dateOfBirth?: string;
  isVerified: boolean;
  role: UserRole;
}
