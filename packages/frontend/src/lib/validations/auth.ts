import { z } from 'zod'

export const signUpSchema = z.object({
  name: z.string().min(1, 'Name is Required'),
  email: z.email('Invalid email format'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters'),
})

export const verifyOtpSchema = z.object({
  otp: z
    .string()
    .min(1, 'OTP must be 6 characters')
    .max(6, 'OTP must be 6 characters'),
})

export const signInSchema = z.object({
  email: z.email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
})

export type SignUpData = z.infer<typeof signUpSchema>
export type SignInData = z.infer<typeof signInSchema>

// Types for API responses (matching your backend)
export type SuccessResponse<T = void> = {
  success: true
  message: string
} & (T extends void ? {} : { data: T })

export type ErrorResponse = {
  success: false
  message: string
  isFormError?: boolean
  errors?: Record<string, string>
}

export type AuthResponse = {
  user: {
    id: string
    name: string
    email: string
    username: string
    image?: string
    emailVerified: boolean
  }
  accessToken: string
  refreshToken: string
}
