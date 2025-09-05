import type { AuthUser } from '../contexts/AuthContext';

/**
 * Generate a consistent color based on user's name or email
 */
export const generateAvatarColor = (text: string): string => {
  if (!text) return '#6b7280'; // Default gray
  
  // List of beautiful, accessible colors for avatars
  const colors = [
    '#ef4444', // Red
    '#f97316', // Orange  
    '#f59e0b', // Amber
    '#eab308', // Yellow
    '#84cc16', // Lime
    '#22c55e', // Green
    '#10b981', // Emerald
    '#06b6d4', // Cyan
    '#0ea5e9', // Sky
    '#3b82f6', // Blue
    '#6366f1', // Indigo
    '#8b5cf6', // Violet
    '#a855f7', // Purple
    '#d946ef', // Fuchsia
    '#ec4899', // Pink
    '#f43f5e', // Rose
  ];
  
  // Generate a hash from the text to ensure consistency
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  
  // Use absolute value and modulo to get a color index
  const colorIndex = Math.abs(hash) % colors.length;
  return colors[colorIndex];
};

/**
 * Get user's initials for avatar
 */
export const getUserInitials = (user: AuthUser | null): string => {
  if (!user) return 'U';
  
  // Try to get initials from name first
  if (user.name) {
    const nameParts = user.name.trim().split(' ');
    if (nameParts.length >= 2) {
      // First and last name
      return (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase();
    } else if (nameParts.length === 1 && nameParts[0].length > 0) {
      // Single name, take first character
      return nameParts[0][0].toUpperCase();
    }
  }
  
  // Fallback to email
  if (user.email) {
    return user.email[0].toUpperCase();
  }
  
  // Ultimate fallback
  return 'U';
};

/**
 * Get background color for user avatar
 */
export const getUserAvatarColor = (user: AuthUser | null): string => {
  if (!user) return '#6b7280';
  
  // Use name for color generation, fallback to email
  const text = user.name || user.email || 'User';
  return generateAvatarColor(text);
};

/**
 * Check if user has a profile picture
 */
export const hasProfilePicture = (user: AuthUser | null): boolean => {
  if (!user) return false;
  return !!(user.avatarUrl);
};

/**
 * Get user's profile picture URL
 */
export const getProfilePictureUrl = (user: AuthUser | null): string | null => {
  if (!user) return null;
  return user.avatarUrl || null;
};

/**
 * Generate avatar data for user
 */
export interface AvatarData {
  hasImage: boolean;
  imageUrl?: string;
  initials: string;
  backgroundColor: string;
  textColor: string;
}

export const getUserAvatarData = (user: AuthUser | null): AvatarData => {
  const hasImage = hasProfilePicture(user);
  const initials = getUserInitials(user);
  const backgroundColor = getUserAvatarColor(user);
  
  // Calculate contrasting text color (white for dark backgrounds, dark for light)
  const textColor = '#ffffff'; // White text works well with all our colors
  
  return {
    hasImage,
    imageUrl: hasImage ? getProfilePictureUrl(user)! : undefined,
    initials,
    backgroundColor,
    textColor,
  };
};
