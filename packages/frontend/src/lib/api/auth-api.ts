import { apiClient } from './client'
import type {
  SignUpData,
  SignInData,
  AuthResponse,
  SuccessResponse,
  ErrorResponse,
} from '@/lib/validations/auth'

// Auth API Functions
export const authApi = {
  // Register new user
  signUp: async (data: SignUpData): Promise<AuthResponse> => {
    const registerData = {
      ...data,
      username: data.email.split('@')[0], // Generate username from email
    }

    const response: SuccessResponse<AuthResponse> = await apiClient.post(
      '/auth/register',
      registerData,
      { skipAuth: true },
    )

    return response.data
  },

  // Sign in user
  signIn: async (data: SignInData): Promise<AuthResponse> => {
    const response: SuccessResponse<AuthResponse> = await apiClient.post(
      '/auth/login',
      data,
      { skipAuth: true },
    )

    return response.data
  },

  // Get current user - this should be handled by session storage since there's no /auth/me endpoint
  getCurrentUser: async (): Promise<AuthResponse['user'] | null> => {
    // Since your backend uses session-based auth, we'll get user from local storage
    // The user data is stored when they log in
    return null // This will be handled by the auth storage
  },

  // Logout user
  logout: async (refreshToken: string): Promise<void> => {
    await apiClient.post('/auth/logout', {
      refreshToken: refreshToken,
    })
  },

  // Refresh token - not available in your current backend
  refreshToken: async (refreshToken: string): Promise<AuthResponse> => {
    throw new Error('Token refresh not implemented in backend')
  },

  // Verify email
  verifyEmail: async (data: { email: string; otp: string }): Promise<void> => {
    await apiClient.post('/auth/verify-email', data, { skipAuth: true })
  },

  // Resend verification email
  resendVerification: async (email: string): Promise<void> => {
    await apiClient.post(
      '/auth/resend-verification',
      { email },
      { skipAuth: true },
    )
  },

  // Forgot password
  forgotPassword: async (email: string): Promise<void> => {
    await apiClient.post('/auth/forgot-password', { email }, { skipAuth: true })
  },

  // Reset password
  resetPassword: async (data: {
    token: string
    password: string
  }): Promise<void> => {
    await apiClient.post('/auth/reset-password', data, { skipAuth: true })
  },

  // Update profile
  updateProfile: async (
    data: Partial<AuthResponse['user']>,
  ): Promise<AuthResponse['user']> => {
    const response: SuccessResponse<{ user: AuthResponse['user'] }> =
      await apiClient.put('/auth/update-profile', data)

    return response.data.user
  },
}
