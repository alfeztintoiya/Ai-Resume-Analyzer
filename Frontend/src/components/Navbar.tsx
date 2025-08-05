import React, { useState } from 'react';
import { BarChart3, Menu, X } from 'lucide-react';
import './Navbar.css';

interface NavbarProps {
  onUploadClick?: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onUploadClick }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
            <button className="btn-secondary">
              Sign In
            </button>
            <button 
              className="btn-primary"
              onClick={onUploadClick}
            >
              Get Started
            </button>
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
              <button className="mobile-btn">Sign In</button>
              <button 
                className="mobile-btn mobile-btn-primary"
                onClick={onUploadClick}
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
