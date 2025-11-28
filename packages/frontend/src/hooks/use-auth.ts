import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
import { authApi } from '@/lib/api/auth-api'
import { authStorage } from '@/lib/auth-storage'

// Query keys for auth

const queryKeys = {
  auth: {
    all: ['auth'] as const,
    user: () => ['auth', 'user'] as const,
    session: () => ['auth', 'session'] as const,
  },
  users: {
    all: ['users'] as const,
  },
  wagers: {
    all: ['wagers'] as const,
  },
  notifications: {
    all: ['notifications'] as const,
  },
}
import type {
  SignUpData,
  SignInData,
  AuthResponse,
} from '@/lib/validations/auth'

export type AuthUser = {
  id: string
  name: string
  email: string
  username: string
  image?: string
  emailVerified: boolean
}

// Auth Query Hook
export function useAuth() {
  const {
    data: user,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: queryKeys.auth.user(),
    queryFn: async (): Promise<AuthUser | null> => {
      // Since your backend uses session-based auth, get user from storage
      return authStorage.getUser()
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false,
    initialData: () => {
      // Initialize from local storage
      return authStorage.getUser()
    },
  })

  return {
    user,
    isAuthenticated: !!user,
    isLoading,
    error,
    refetch,
  }
}

// Sign Up Mutation
export function useSignUp() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: async (
      data: SignUpData,
    ): Promise<AuthResponse & { redirectUrl?: string }> => {
      return await authApi.signUp(data)
    },
    onSuccess: (response) => {
      if (response.redirectUrl) {
        navigate({ to: response.redirectUrl })
        toast.success('Account created! Please verify your email.')
      } else {
        // Store auth session
        authStorage.setSession({
          user: response.user,
          accessToken: response.accessToken,
          refreshToken: response.refreshToken,
          expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
        })

        // Update query cache
        queryClient.setQueryData(queryKeys.auth.user(), response.user)

        // Show success toast
        toast.success('Account created successfully! Welcome to WageMore!')

        // Navigate to dashboard
        navigate({ to: '/dashboard' })
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create account')
    },
  })
}

// Sign In Mutation
export function useSignIn() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: async (data: SignInData): Promise<AuthResponse> => {
      return await authApi.signIn(data)
    },
    onSuccess: (response) => {
      // Store auth session
      authStorage.setSession({
        user: response.user,
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
        expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
      })

      // Update query cache
      queryClient.setQueryData(queryKeys.auth.user(), response.user)

      // Show success toast
      toast.success(`Welcome back, ${response.user.name}!`)

      // Navigate to dashboard
      navigate({ to: '/dashboard' })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to sign in')
    },
  })
}

// Logout Mutation
export function useLogout() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: async () => {
      await authApi.logout(authStorage.getRefreshToken() || '')
    },
    onMutate: async () => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.auth.user() })

      // Optimistically update user to null
      const previousUser = queryClient.getQueryData(queryKeys.auth.user())
      queryClient.setQueryData(queryKeys.auth.user(), null)

      return { previousUser }
    },
    onSuccess: () => {
      // Clear session storage
      authStorage.clearSession()

      // Clear all auth-related cache
      queryClient.removeQueries({ queryKey: queryKeys.auth.all })

      // Clear user-specific data
      queryClient.removeQueries({ queryKey: queryKeys.users.all })
      queryClient.removeQueries({ queryKey: queryKeys.wagers.all })
      queryClient.removeQueries({ queryKey: queryKeys.notifications.all })

      // Show success toast
      toast.success('Logged out successfully')

      // Navigate to home
      navigate({ to: '/' })
    },
    onError: (error: Error, _, context) => {
      // Rollback on error
      if (context?.previousUser) {
        queryClient.setQueryData(queryKeys.auth.user(), context.previousUser)
      }

      toast.error(error.message || 'Failed to logout')
    },
    onSettled: () => {
      // Always clear local storage on logout attempt
      authStorage.clearSession()
    },
  })
}

// Verify Email Mutation
export function useVerifyEmail() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: async (data: { email: string; otp: string }) => {
      await authApi.verifyEmail(data)
    },
    onSuccess: () => {
      // Update user verification status
      const currentUser = queryClient.getQueryData<AuthUser>(
        queryKeys.auth.user(),
      )
      if (currentUser) {
        const updatedUser = { ...currentUser, emailVerified: true }
        queryClient.setQueryData(queryKeys.auth.user(), updatedUser)
        authStorage.updateUser(updatedUser)
      }

      toast.success('Email verified successfully!')
      navigate({ to: '/dashboard' })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to verify email')
    },
  })
}

// Resend Verification Mutation
export function useResendVerification() {
  return useMutation({
    mutationFn: async (email: string) => {
      await authApi.resendVerification(email)
    },
    onSuccess: () => {
      toast.success('Verification email sent!')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to send verification email')
    },
  })
}

// Forgot Password Mutation
export function useForgotPassword() {
  return useMutation({
    mutationFn: async (email: string) => {
      await authApi.forgotPassword(email)
    },
    onSuccess: () => {
      toast.success('Password reset email sent!')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to send reset email')
    },
  })
}

// Reset Password Mutation
export function useResetPassword() {
  const navigate = useNavigate()

  return useMutation({
    mutationFn: async (data: { token: string; password: string }) => {
      await authApi.resetPassword(data)
    },
    onSuccess: () => {
      toast.success('Password reset successfully!')
      navigate({ to: '/auth/sign-in' })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to reset password')
    },
  })
}

// Update Profile Mutation
export function useUpdateProfile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: Partial<AuthUser>) => {
      if (!authStorage.isAuthenticated()) throw new Error('Not authenticated')

      return await authApi.updateProfile(data)
    },
    onSuccess: (updatedUser) => {
      // Update query cache
      queryClient.setQueryData(queryKeys.auth.user(), updatedUser)

      // Update local storage
      authStorage.updateUser(updatedUser)

      toast.success('Profile updated successfully!')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update profile')
    },
  })
}

// Utility hooks
