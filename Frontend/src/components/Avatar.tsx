import React from 'react';
import type { User } from '../types/user';
import { getUserAvatarData } from '../utils/avatarUtils';
import './Avatar.css';

interface AvatarProps {
  user: User | null;
  size?: 'small' | 'medium' | 'large' | 'extra-large';
  className?: string;
  onClick?: () => void;
}

const Avatar: React.FC<AvatarProps> = ({ 
  user, 
  size = 'medium', 
  className = '', 
  onClick 
}) => {
  const avatarData = getUserAvatarData(user);
  
  const sizeClasses = {
    small: 'avatar-small',
    medium: 'avatar-medium', 
    large: 'avatar-large',
    'extra-large': 'avatar-extra-large'
  };
  
  const baseClasses = `avatar ${sizeClasses[size]} ${className}`;
  const clickableClass = onClick ? 'avatar-clickable' : '';
  
  const handleClick = () => {
    if (onClick) {
      onClick();
    }
  };
  
  if (avatarData.hasImage && avatarData.imageUrl) {
    return (
      <img
        src={avatarData.imageUrl}
        alt={`${user?.name || user?.email || 'User'}'s avatar`}
        className={`${baseClasses} ${clickableClass}`.trim()}
        onClick={handleClick}
        onError={(e) => {
          // If image fails to load, replace with initials
          const target = e.target as HTMLImageElement;
          const parent = target.parentElement;
          if (parent) {
            parent.innerHTML = `
              <div class="${baseClasses} avatar-initials ${clickableClass}" 
                   style="background-color: ${avatarData.backgroundColor}; color: ${avatarData.textColor}">
                ${avatarData.initials}
              </div>
            `;
          }
        }}
      />
    );
  }
  
  return (
    <div
      className={`${baseClasses} avatar-initials ${clickableClass}`.trim()}
      style={{
        backgroundColor: avatarData.backgroundColor,
        color: avatarData.textColor,
      }}
      onClick={handleClick}
      title={user?.name || user?.email || 'User'}
    >
      {avatarData.initials}
    </div>
  );
};

export default Avatar;
