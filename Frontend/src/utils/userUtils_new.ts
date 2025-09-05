import type { AuthUser } from '../contexts/AuthContext';

/**
 * Get user's full display name (name or email fallback)
 */
export const getUserFullName = (user: AuthUser | null): string => {
  if (!user) return 'Anonymous';
  
  if (user.name?.trim()) {
    return user.name.trim();
  }
  
  return user.email || 'Anonymous';
};

/**
 * Get user's display name (shorter version, name or first part of email)
 */
export const getUserDisplayName = (user: AuthUser | null): string => {
  if (!user) return 'Guest';
  
  if (user.name?.trim()) {
    return user.name.trim();
  }
  
  return user.email?.split('@')[0] || 'Guest';
};

/**
 * Get user avatar URL with fallback
 */
export const getUserAvatar = (user: AuthUser | null): string => {
  if (!user) return '/default-avatar.png';
  
  return user.avatarUrl || '/default-avatar.png';
};
