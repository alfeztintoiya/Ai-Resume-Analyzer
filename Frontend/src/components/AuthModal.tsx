import React, { useState } from 'react';
import { X, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import type { AuthModalProps } from '../types';
import EmailVerificationNotice from './EmailVerificationNotice';
import GoogleSignInButton from './GoogleSignInButton';
import './AuthModal.css';

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, initialTab = 'login' }) => {
  const auth = useAuth();
  const { register , login, refreshUser, setUser } = auth as any;

  const [activeTab, setActiveTab] = useState<'login' | 'signup'>(initialTab);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showVerificationNotice, setShowVerificationNotice] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Forms
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: ''
  });

  const [signupForm, setSignupForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  // New: Google sign-in callbacks
  const handleGoogleSuccess = async (userData: any) => {
    try {
      // Set user immediately (optimistic update)
      setUser(userData);
      onClose();
      
      // Don't do background refresh - trust the data we got from backend
    } catch (e: any) {
      setErrors({ general: e?.message || 'Sign-in failed' });
    }
  };

  const handleGoogleError = (message: string) => {
    setErrors({ general: message || 'Google sign-in failed' });
  };

  // Login submit
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);

    const newErrors: Record<string, string> = {};
    if (!loginForm.email) newErrors.email = 'Email is required';
    if (!loginForm.password) newErrors.password = 'Password is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsLoading(false);
      return;
    }

    try {
      const response = await login(loginForm.email, loginForm.password);
      if (response?.success) {
        await refreshUser();
        onClose?.();
        return;
      } else {
        setErrors({ general: response.message || 'Login failed' });
      }
    } catch {
      setErrors({ general: 'An error occurred during login' });
    } finally {
      setIsLoading(false);
    }
  };

  // Signup submit
  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);

    const newErrors: Record<string, string> = {};
    if (!signupForm.name) newErrors.name = 'Name is required';
    if (!signupForm.email) newErrors.email = 'Email is required';
    if (!signupForm.password) newErrors.password = 'Password is required';
    if (signupForm.password !== signupForm.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    if (signupForm.password && signupForm.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsLoading(false);
      return;
    }

    try {
      const response = await register({
        name: signupForm.name,
        email: signupForm.email,
        password: signupForm.password,
      });
      if (response?.success) {
        await refreshUser();
        setShowVerificationNotice(true);
        setVerificationEmail(signupForm.email);
      } else {
        setErrors({ general: response.message || 'Registration failed' });
      }
    } catch {
      setErrors({ general: 'An error occurred during registration' });
    } finally {
      setIsLoading(false);
    }
  };

  const switchTab = (tab: 'login' | 'signup') => {
    setActiveTab(tab);
    setErrors({});
    setLoginForm({ email: '', password: '' });
    setSignupForm({ name: '', email: '', password: '', confirmPassword: '' });
  };

  if (!isOpen) return null;

  return (
    <div className="auth-modal-overlay" onClick={onClose}>
      <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
        <button className="auth-modal-close" onClick={onClose}>
          <X className="w-5 h-5" />
        </button>

        <div className="auth-modal-content">
          {showVerificationNotice ? (
            <EmailVerificationNotice
              email={verificationEmail}
              onClose={onClose}
            />
          ) : (
            <>
              {/* Tabs */}
              <div className="auth-tabs">
                <button
                  className={`auth-tab ${activeTab === 'login' ? 'active' : ''}`}
                  onClick={() => switchTab('login')}
                >
                  Sign In
                </button>
                <button
                  className={`auth-tab ${activeTab === 'signup' ? 'active' : ''}`}
                  onClick={() => switchTab('signup')}
                >
                  Sign Up
                </button>
              </div>

              {/* Login */}
              {activeTab === 'login' && (
                <div className="auth-form-container">
                  <div className="auth-header">
                    <h2 className="auth-title">Welcome Back</h2>
                    <p className="auth-subtitle">Sign in to your account to continue</p>
                  </div>

                  {/* New Google button */}
                  <div className="google-signin-btn" style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
                    <GoogleSignInButton
                      onSuccess={handleGoogleSuccess}
                      onError={handleGoogleError}
                    />
                  </div>

                  <div className="auth-divider">
                    <span>or</span>
                  </div>

                  {errors.general && (
                    <div className="auth-error-message">
                      {errors.general}
                    </div>
                  )}

                  <form onSubmit={handleLoginSubmit} className="auth-form">
                    <div className="form-group">
                      <label className="form-label">Email</label>
                      <div className="form-input-container">
                        <input
                          type="email"
                          className={`form-input ${errors.email ? 'error' : ''}`}
                          placeholder="Enter your email"
                          value={loginForm.email}
                          onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                        />
                      </div>
                      {errors.email && <span className="form-error">{errors.email}</span>}
                    </div>

                    <div className="form-group">
                      <label className="form-label">Password</label>
                      <div className="form-input-container">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          className={`form-input ${errors.password ? 'error' : ''}`}
                          placeholder="Enter your password"
                          value={loginForm.password}
                          onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                        />
                        <button
                          type="button"
                          className="password-toggle"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {errors.password && <span className="form-error">{errors.password}</span>}
                    </div>

                    <div className="form-options">
                      <label className="checkbox-label">
                        <input type="checkbox" className="checkbox" />
                        <span className="checkbox-text">Remember me</span>
                      </label>
                      <a href="#" className="forgot-password">Forgot password?</a>
                    </div>

                    <button
                      type="submit"
                      className={`auth-submit-btn ${isLoading ? 'loading' : ''}`}
                      disabled={isLoading}
                    >
                      {isLoading ? <div className="auth-loading-spinner"></div> : 'Sign In'}
                    </button>
                  </form>
                </div>
              )}

              {/* Signup */}
              {activeTab === 'signup' && (
                <div className="auth-form-container">
                  <div className="auth-header">
                    <h2 className="auth-title">Create Account</h2>
                    <p className="auth-subtitle">Sign up to get started with ResumeAI</p>
                  </div>

                  {/* New Google button */}
                  <div className="google-signin-btn" style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
                    <GoogleSignInButton
                      onSuccess={handleGoogleSuccess}
                      onError={handleGoogleError}
                    />
                  </div>

                  <div className="auth-divider">
                    <span>or</span>
                  </div>

                  {errors.general && (
                    <div className="auth-error-message">
                      {errors.general}
                    </div>
                  )}

                  <form onSubmit={handleSignupSubmit} className="auth-form">
                    <div className="form-group">
                      <label className="form-label">Full Name</label>
                      <div className="form-input-container">
                        <input
                          type="text"
                          className={`form-input ${errors.name ? 'error' : ''}`}
                          placeholder="Name"
                          value={signupForm.name}
                          onChange={(e) => setSignupForm({ ...signupForm, name: e.target.value })}
                        />
                      </div>
                      {errors.name && <span className="form-error">{errors.name}</span>}
                    </div>

                    <div className="form-group">
                      <label className="form-label">Email</label>
                      <div className="form-input-container">
                        <input
                          type="email"
                          className={`form-input ${errors.email ? 'error' : ''}`}
                          placeholder="Enter your email"
                          value={signupForm.email}
                          onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
                        />
                      </div>
                      {errors.email && <span className="form-error">{errors.email}</span>}
                    </div>

                    <div className="form-group">
                      <label className="form-label">Password</label>
                      <div className="form-input-container">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          className={`form-input ${errors.password ? 'error' : ''}`}
                          placeholder="Create password"
                          value={signupForm.password}
                          onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })}
                        />
                        <button
                          type="button"
                          className="password-toggle"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {errors.password && <span className="form-error">{errors.password}</span>}
                    </div>

                    <div className="form-group">
                      <label className="form-label">Confirm Password</label>
                      <div className="form-input-container">
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
                          placeholder="Confirm password"
                          value={signupForm.confirmPassword}
                          onChange={(e) => setSignupForm({ ...signupForm, confirmPassword: e.target.value })}
                        />
                        <button
                          type="button"
                          className="password-toggle"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {errors.confirmPassword && <span className="form-error">{errors.confirmPassword}</span>}
                    </div>

                    <div className="form-options">
                      <label className="checkbox-label">
                        <input type="checkbox" className="checkbox" />
                        <span className="checkbox-text">I agree to the Terms of Service and Privacy Policy</span>
                      </label>
                    </div>

                    <button
                      type="submit"
                      className={`auth-submit-btn ${isLoading ? 'loading' : ''}`}
                      disabled={isLoading}
                    >
                      {isLoading ? <div className="auth-loading-spinner"></div> : 'Create Account'}
                    </button>
                  </form>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;