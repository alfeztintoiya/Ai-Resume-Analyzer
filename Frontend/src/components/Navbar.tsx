import React, { useState } from 'react';
import { BarChart3, Menu, X, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getUserFullName } from '../utils/userUtils';
import Avatar from './Avatar';
import type { NavbarProps } from '../types';
import './Navbar.css';

const Navbar: React.FC<NavbarProps> = ({ onUploadClick, onSignInClick }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignInClick = () => {
    setMobileMenuOpen(false);
    if (onSignInClick) {
      onSignInClick();
    }
  };

  const handleGetStartedClick = () => {
    setMobileMenuOpen(false);
    if (onUploadClick) {
      onUploadClick();
    }
  };

  return (
    <header className="header">
      <div className="header-container">
        <div className="header-content">
          <div className="logo-section">
            <div className="logo-icon">
              <BarChart3 className="w-5 h-5" />
            </div>
            <span className="logo-text">ResumeAI</span>
          </div>
          
          <nav className="nav-desktop">
            <a href="#features" className="nav-link">Features</a>
            <a href="#how-it-works" className="nav-link">How it Works</a>
            <a href="#pricing" className="nav-link">Pricing</a>
            <a href="#about" className="nav-link">About</a>
          </nav>

          <div className="header-buttons">
            {isAuthenticated ? (
              <>
                <div className="user-info">
                  <Avatar 
                    user={user}
                    size="medium"
                    className="user-avatar"
                  />
                  <span className="user-name">{getUserFullName(user)}</span>
                </div>
                <button 
                  className="btn-secondary"
                  onClick={logout}
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <button className="btn-secondary" onClick={handleSignInClick}>
                  Sign In
                </button>
                <button 
                  className="btn-primary"
                  onClick={handleGetStartedClick}
                >
                  Get Started
                </button>
              </>
            )}
          </div>

          <button 
            className="mobile-menu-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="mobile-menu">
          <div>
            <a href="#features" className="mobile-nav-link">Features</a>
            <a href="#how-it-works" className="mobile-nav-link">How it Works</a>
            <a href="#pricing" className="mobile-nav-link">Pricing</a>
            <a href="#about" className="mobile-nav-link">About</a>
            <div className="mobile-menu-divider">
              {isAuthenticated ? (
                <>
                  <div className="mobile-user-info">
                    <Avatar 
                      user={user}
                      size="small"
                      className="mobile-user-avatar"
                    />
                    <span className="mobile-user-name">{getUserFullName(user)}</span>
                  </div>
                  <button 
                    className="mobile-btn mobile-btn-secondary"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      logout();
                    }}
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <button className="mobile-btn" onClick={handleSignInClick}>Sign In</button>
                  <button 
                    className="mobile-btn mobile-btn-primary"
                    onClick={handleGetStartedClick}
                  >
                    Get Started
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
