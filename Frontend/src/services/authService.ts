import type { AuthResponse, CreateUserData, LoginData } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

class AuthService {
  // Google OAuth Login
  googleLogin = (): void => {
    // Redirect to backend Google OAuth endpoint
    window.location.href = `${API_BASE_URL}/auth/google`;
  };

  // Get current user
  getCurrentUser = async (): Promise<AuthResponse> => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/verify`, {
        method: 'GET',
        credentials: 'include', // Include cookies
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        return { success: false, message: 'Not authenticated' };
      }

      const user = await response.json();
      return { success: true, user };
    } catch (error) {
      console.error('Auth error:', error);
      return { success: false, message: 'Authentication failed' };
    }
  };

  // Logout
  logout = async (): Promise<void> => {
    try {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Login with email/password (if you want to implement this later)
  login = async (email: string, password: string): Promise<AuthResponse> => {
    try {
      const loginData: LoginData = { email, password };
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'Login failed' };
    }
  };

  // Register with email/password (if you want to implement this later)
  register = async (userData: CreateUserData): Promise<AuthResponse> => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: userData.name,
          email: userData.email,
          password: userData.password,
        }),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Register error:', error);
      return { success: false, message: 'Registration failed' };
    }
  };

  // Verify email with token
  verifyEmail = async (token: string): Promise<AuthResponse> => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/verify-email?token=${token}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Email verification error:', error);
      return { success: false, message: 'Email verification failed' };
    }
  };

  // Resend verification email
  resendVerificationEmail = async (email: string): Promise<AuthResponse> => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/resend-verification`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Resend verification error:', error);
      return { success: false, message: 'Failed to resend verification email' };
    }
  };
}

export async function googleLoginWithCredential(credential: string){
  const res = await fetch(`${API_BASE_URL}/auth/google`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({credential}),
  });

  if(!res.ok){
    const text = await res.text();
    console.error('Google login failed:', text);
    throw new Error(text || 'Google login failed');
  }
  return await res.json();
}

export async function fetchMe(){
  try {
    const res = await fetch(`${API_BASE_URL}/auth/me`, {
      method: 'GET',
      credentials: 'include',
    });
    if(!res.ok){
      return { authenticated: false, user: null } as any;
    }
    const data = await res.json();
    return data;
  } catch (error) {
    return { authenticated: false, user: null } as any;
  }
}

export const authService = new AuthService();
