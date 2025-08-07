import type { User } from '../types/user';

/**
 * Normalize user data from backend (snake_case) to frontend (camelCase)
 */
export const normalizeUser = (user: any): User => {
  return {
    ...user,
    profilePic: user.profile_pic || user.profilePic,
    dateOfBirth: user.date_of_birth || user.dateOfBirth,
    isVerified: user.is_verified ?? user.isVerified,
    createdAt: user.created_at || user.createdAt,
    updatedAt: user.updated_at || user.updatedAt,
  };
};

/**
 * Get user's display name
 */
export const getUserFullName = (user: User | null): string => {
  if (!user) return '';
  
  return user.name || user.email || 'User';
};

/**
 * Get user's display name (same as full name now)
 */
export const getUserDisplayName = (user: User | null): string => {
  return getUserFullName(user);
};

/**
 * Get user's avatar URL with fallback (deprecated - use Avatar component instead)
 * @deprecated Use Avatar component with getUserAvatarData from avatarUtils
 */
export const getUserAvatar = (user: User | null): string => {
  if (!user) return '/default-avatar.png';
  
  return user.profilePic || user.profile_pic || '/default-avatar.png';
};
