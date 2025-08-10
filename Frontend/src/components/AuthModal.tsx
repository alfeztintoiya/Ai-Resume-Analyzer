import React, { useState } from 'react';
import { X, Eye, EyeOff, } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import type { AuthModalProps } from '../types';
import EmailVerificationNotice from './EmailVerificationNotice';
import './AuthModal.css';

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, initialTab = 'login' }) => {
  const { login, register, googleLogin } = useAuth();
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>(initialTab);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showVerificationNotice, setShowVerificationNotice] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState('');

  // Form states
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: ''
  });

  const [signupForm, setSignupForm] = useState({
    name:'',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Handle form submission
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);

    // Basic validation
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
      if (response.success) {
        onClose();
      } else {
        setErrors({ general: response.message || 'Login failed' });
      }
    } catch (error) {
      setErrors({ general: 'An error occurred during login' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);

    // Basic validation
    const newErrors: Record<string, string> = {};
    if (!signupForm.name) newErrors.name = 'Name is required';
    if (!signupForm.email) newErrors.email = 'Email is required';
    if (!signupForm.password) newErrors.password = 'Password is required';
    if (signupForm.password !== signupForm.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    if (signupForm.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsLoading(false);
      return;
    }

    try {
      const response = await register(signupForm);
      if (response.success) {
        // Show verification notice instead of closing modal
        setVerificationEmail(signupForm.email);
        setShowVerificationNotice(true);
      } else {
        setErrors({ general: response.message || 'Registration failed' });
      }
    } catch (error) {
      setErrors({ general: 'An error occurred during registration' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    googleLogin();
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
          {/* Show verification notice if signup was successful */}
          {showVerificationNotice ? (
            <EmailVerificationNotice 
              email={verificationEmail}
              onClose={onClose}
            />
          ) : (
            <>
              {/* Tab Headers */}
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

          {/* Login Form */}
          {activeTab === 'login' && (
            <div className="auth-form-container">
              <div className="auth-header">
                <h2 className="auth-title">Welcome Back</h2>
                <p className="auth-subtitle">Sign in to your account to continue</p>
              </div>

              <button className="google-signin-btn" onClick={handleGoogleSignIn}>
                <svg className="google-icon" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 15.24 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </button>

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
                    {/* <Mail className="form-input-icon" /> */}
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
                    {/* <Lock className="form-input-icon" /> */}
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
                  {isLoading ? (
                    <div className="auth-loading-spinner"></div>
                  ) : (
                    'Sign In'
                  )}
                </button>
              </form>
            </div>
          )}

          {/* Signup Form */}
          {activeTab === 'signup' && (
            <div className="auth-form-container">
              <div className="auth-header">
                <h2 className="auth-title">Create Account</h2>
                <p className="auth-subtitle">Sign up to get started with ResumeAI</p>
              </div>

              <button className="google-signin-btn" onClick={handleGoogleSignIn}>
                <svg className="google-icon" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 15.24 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </button>

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
                      {/* <User className="form-input-icon" /> */}
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

                  {/* <div className="form-group">
                    <label className="form-label">Last Name</label>
                    <div className="form-input-container">
                      <User className="form-input-icon" />
                      <input
                        type="text"
                        className={`form-input ${errors.lastName ? 'error' : ''}`}
                        placeholder="Last name"
                        value={signupForm.lastName}
                        onChange={(e) => setSignupForm({ ...signupForm, lastName: e.target.value })}
                      />
                    </div>
                    {errors.lastName && <span className="form-error">{errors.lastName}</span>}
                  </div> */}

                <div className="form-group">
                  <label className="form-label">Email</label>
                  <div className="form-input-container">
                    {/* <Mail className="form-input-icon" /> */}
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
                    {/* <Lock className="form-input-icon" /> */}
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
                    {/* <Lock className="form-input-icon" /> */}
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
                  {isLoading ? (
                    <div className="auth-loading-spinner"></div>
                  ) : (
                    'Create Account'
                  )}
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
