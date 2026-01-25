import { apiClient } from './client';
import type {
  RegisterInput,
  LoginInput,
  ForgotPasswordInput,
  ResetPasswordInput,
} from '@emc3/shared';

// ═══════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════

export interface UserResponse {
  id: string;
  email: string;
  username: string;
  emailVerified: boolean;
  roles: string[];
  isBanned: boolean;
  banReason: string | null;
  profile: {
    displayName: string | null;
    about: string | null;
    avatarUrl: string | null;
    socialLinks: Record<string, string>;
  };
}

export interface LoginResponse {
  user: UserResponse;
}

export interface RegisterResponse {
  id: string;
  email: string;
  username: string;
  emailVerified: boolean;
}

// ═══════════════════════════════════════════════════════════
// Auth API Functions
// ═══════════════════════════════════════════════════════════

export const authApi = {
  // Register
  async register(data: RegisterInput): Promise<RegisterResponse> {
    return apiClient.post<RegisterResponse>('/auth/register', data);
  },

  // Login
  async login(data: LoginInput): Promise<LoginResponse> {
    return apiClient.post<LoginResponse>('/auth/login', data);
  },

  // Logout
  async logout(): Promise<void> {
    return apiClient.post<void>('/auth/logout');
  },

  // Verify email
  async verifyEmail(token: string): Promise<{ emailVerified: boolean }> {
    return apiClient.post<{ emailVerified: boolean }>('/auth/verify-email', {
      token,
    });
  },

  // Resend verification
  async resendVerification(email: string): Promise<{ message: string }> {
    return apiClient.post<{ message: string }>('/auth/resend-verification', {
      email,
    });
  },

  // Forgot password
  async forgotPassword(data: ForgotPasswordInput): Promise<{ message: string }> {
    return apiClient.post<{ message: string }>('/auth/forgot-password', data);
  },

  // Reset password
  async resetPassword(data: ResetPasswordInput): Promise<{ message: string }> {
    return apiClient.post<{ message: string }>('/auth/reset-password', data);
  },

  // Get current user
  async getMe(): Promise<UserResponse> {
    return apiClient.get<UserResponse>('/auth/me');
  },

  // Get avatar upload signature
  async getAvatarUploadSignature(): Promise<{
    signature: string;
    timestamp: number;
    folder: string;
    cloudName: string;
    apiKey: string;
  }> {
    return apiClient.get('/me/avatar/upload-signature');
  },

  // Update profile (displayName, about, avatarUrl, socialLinks)
  async updateProfile(data: {
    displayName?: string | null;
    about?: string | null;
    avatarUrl?: string | null;
    socialLinks?: Record<string, string> | null;
  }): Promise<{ user: UserResponse }> {
    return apiClient.patch<{ user: UserResponse }>('/me/profile', data);
  },

  // Change password
  async changePassword(data: {
    currentPassword: string;
    newPassword: string;
  }): Promise<{ message: string }> {
    return apiClient.post<{ message: string }>('/me/change-password', data);
  },

  // Delete account
  async deleteAccount(data: {
    password?: string;
    confirm: boolean;
  }): Promise<{ message: string }> {
    return apiClient.post<{ message: string }>('/me/delete-account', data);
  },
  
  // Legacy alias for backward compatibility
  async deactivateAccount(data: {
    password: string;
    confirm: boolean;
  }): Promise<{ message: string }> {
    return this.deleteAccount(data);
  },

  // Refresh token
  async refresh(): Promise<{ message: string }> {
    return apiClient.post<{ message: string }>('/auth/refresh');
  },

  // Get Google OAuth URL
  getGoogleAuthUrl(): string {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';
    return `${apiUrl}/auth/google/start`;
  },
};

