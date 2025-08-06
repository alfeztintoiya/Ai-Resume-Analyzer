import type { User } from '../types/user';

/**
 * Normalize user data from backend (snake_case) to frontend (camelCase)
 */
export const normalizeUser = (user: any): User => {
  return {
    ...user,
    firstName: user.first_name || user.firstName,
    lastName: user.last_name || user.lastName,
    profilePic: user.profile_pic || user.profilePic,
    dateOfBirth: user.date_of_birth || user.dateOfBirth,
    isVerified: user.is_verified ?? user.isVerified,
    createdAt: user.created_at || user.createdAt,
    updatedAt: user.updated_at || user.updatedAt,
  };
};

/**
 * Get user's full name
 */
export const getUserFullName = (user: User | null): string => {
  if (!user) return '';
  
  const firstName = user.firstName || user.first_name || '';
  const lastName = user.lastName || user.last_name || '';
  
  return `${firstName} ${lastName}`.trim() || user.email || 'User';
};

/**
 * Get user's display name (first name or email)
 */
export const getUserDisplayName = (user: User | null): string => {
  if (!user) return '';
  
  const firstName = user.firstName || user.first_name;
  return firstName || user.email || 'User';
};

/**
 * Get user's avatar URL with fallback
 */
export const getUserAvatar = (user: User | null): string => {
  if (!user) return '/default-avatar.png';
  
  return user.profilePic || user.profile_pic || '/default-avatar.png';
};
