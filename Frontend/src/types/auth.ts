import type { User, CreateUserData, LoginData } from './user';

export interface AuthResponse {
  success: boolean;
  user?: User;
  message?: string;
}

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<AuthResponse>;
  register: (userData: CreateUserData) => Promise<AuthResponse>;
  googleLogin: () => void;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export interface LoginFormData extends LoginData {
  rememberMe?: boolean;
}

export interface SignupFormData extends CreateUserData {
  confirmPassword: string;
  agreeToTerms?: boolean;
}

export interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'login' | 'signup';
}

export interface AuthFormErrors {
  email?: string;
  password?: string;
  confirmPassword?: string;
  firstName?: string;
  lastName?: string;
  general?: string;
}
