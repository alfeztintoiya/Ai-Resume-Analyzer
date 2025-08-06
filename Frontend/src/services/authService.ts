import type { User, AuthResponse, CreateUserData, LoginData } from '../types';
import { normalizeUser } from '../utils/userUtils';

const API_BASE_URL = 'http://localhost:5003/api/v1';

class AuthService {
  // Google OAuth Login
  googleLogin = (): void => {
    // Redirect to backend Google OAuth endpoint
    window.location.href = `${API_BASE_URL}/auth/google`;
  };

  // Get current user
  getCurrentUser = async (): Promise<AuthResponse> => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
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
      return { success: true, user: normalizeUser(user) };
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
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: userData.firstName,
          lastName: userData.lastName,
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
}

export const authService = new AuthService();
