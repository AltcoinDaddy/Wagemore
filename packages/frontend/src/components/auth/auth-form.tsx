'use client'

import { Link, useNavigate } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { useForm } from '@tanstack/react-form'
import { Eye, EyeOff } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Field, FieldLabel, FieldError } from '@/components/ui/field'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { signUpSchema, signInSchema } from '@/lib/validations/auth'
import { useSignUp, useSignIn } from '@/hooks/use-auth'
import { Spinner } from '../ui/spinner'

interface AuthFormProps {
  defaultTab?: 'signup' | 'signin'
}
export function AuthForm({ defaultTab = 'signup' }: AuthFormProps) {
  const navigate = useNavigate()
  const [currentTab, setCurrentTab] = useState(defaultTab)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const signUpMutation = useSignUp()
  const signInMutation = useSignIn()

  const signUpForm = useForm({
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
    onSubmit: async ({ value }) => {
      setError(null)
      signUpMutation.mutate(value, {
        onError: (error) => {
          setError(error.message || 'Failed to create account')
        },
      })
    },
  })

  const signInForm = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
    onSubmit: async ({ value }) => {
      setError(null)
      signInMutation.mutate(value, {
        onError: (error) => {
          setError(error.message || 'Failed to sign in')
        },
      })
    },
  })

  const handleTabChange = (value: string) => {
    // Assuming you want to switch between /auth/signup and /auth/signin
    // Adjust the 'to' path based on your actual route structure
    navigate({
      to: value === 'signup' ? '/auth/sign-up' : '/auth/sign-in',
      // Or if using search params (e.g. /auth?mode=signin):
      // search: { mode: value }
    })
  }

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">
          {currentTab === 'signup' ? 'Create Your Account' : 'Welcome Back'}
        </h1>
        <p className="text-slate-400">
          {currentTab === 'signup'
            ? 'Join WageMore and start wagering'
            : 'Sign in to your account'}
        </p>
      </div>

      <Tabs
        value={currentTab}
        onValueChange={handleTabChange}
        className="w-full"
      >
        {/* Tab Navigation */}
        <TabsList className="grid grid-cols-2 mb-6 bg-slate-700/50 w-full">
          <TabsTrigger
            value="signup"
            className="data-[state=active]:bg-primary-100! data-[state=active]:text-white"
          >
            Sign Up
          </TabsTrigger>
          <TabsTrigger
            value="signin"
            className="data-[state=active]:bg-primary-100! data-[state=active]:text-white"
          >
            Sign In
          </TabsTrigger>
        </TabsList>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 rounded-md bg-red-500/10 border border-red-500/20">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Sign Up Tab Content */}
        <TabsContent value="signup">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              signUpForm.handleSubmit()
            }}
            className="space-y-4"
          >
            {/* Name Field */}
            <signUpForm.Field
              name="name"
              validators={{ onChange: signUpSchema.shape.name }}
            >
              {(field) => (
                <Field>
                  <FieldLabel htmlFor="signup-name" className="text-white">
                    Full Name
                  </FieldLabel>
                  <Input
                    id="signup-name"
                    type="text"
                    placeholder="Enter your full name"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-cyan-500"
                  />
                  <FieldError errors={field.state.meta.errors} />
                </Field>
              )}
            </signUpForm.Field>

            {/* Email Field */}
            <signUpForm.Field
              name="email"
              validators={{ onChange: signUpSchema.shape.email }}
            >
              {(field) => (
                <Field>
                  <FieldLabel htmlFor="signup-email" className="text-white">
                    Email Address
                  </FieldLabel>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="Enter your email"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-cyan-500"
                  />
                  <FieldError errors={field.state.meta.errors} />
                </Field>
              )}
            </signUpForm.Field>

            {/* Password Field */}
            <signUpForm.Field
              name="password"
              validators={{ onChange: signUpSchema.shape.password }}
            >
              {(field) => (
                <Field>
                  <FieldLabel htmlFor="signup-password" className="text-white">
                    Password
                  </FieldLabel>
                  <div className="relative">
                    <Input
                      id="signup-password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-cyan-500 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  <FieldError errors={field.state.meta.errors} />
                </Field>
              )}
            </signUpForm.Field>

            {/* Submit Button */}
            <signUpForm.Subscribe
              selector={(state) => [state.canSubmit, state.isSubmitting]}
            >
              {([canSubmit, isSubmitting]) => (
                <Button
                  type="submit"
                  disabled={!canSubmit || signUpMutation.isPending}
                  className="w-full bg-primary-100 hover:bg-primary-100 text-white font-semibold py-3"
                >
                  {isSubmitting || signUpMutation.isPending ? (
                    <>
                      <Spinner className="w-5 h-5 mr-2" />
                      Creating Account...
                    </>
                  ) : (
                    'Create Account'
                  )}
                </Button>
              )}
            </signUpForm.Subscribe>

            {/* Terms */}
            <p className="text-xs text-slate-400 text-center mt-4">
              By signing up, you agree to our{' '}
              <a
                href="/terms"
                className="text-cyan-400 hover:text-cyan-300 underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Terms of Service
              </a>{' '}
              and{' '}
              <a
                href="/privacy"
                className="text-cyan-400 hover:text-cyan-300 underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Privacy Policy
              </a>
            </p>
          </form>
        </TabsContent>

        {/* Sign In Tab Content */}
        <TabsContent value="signin">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              signInForm.handleSubmit()
            }}
            className="space-y-4"
          >
            {/* Email Field */}
            <signInForm.Field
              name="email"
              validators={{ onChange: signInSchema.shape.email }}
            >
              {(field) => (
                <Field>
                  <FieldLabel htmlFor="signin-email" className="text-white">
                    Email Address
                  </FieldLabel>
                  <Input
                    id="signin-email"
                    type="email"
                    placeholder="Enter your email"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-cyan-500"
                  />
                  <FieldError errors={field.state.meta.errors} />
                </Field>
              )}
            </signInForm.Field>

            {/* Password Field */}
            <signInForm.Field
              name="password"
              validators={{ onChange: signInSchema.shape.password }}
            >
              {(field) => (
                <Field>
                  <FieldLabel htmlFor="signin-password" className="text-white">
                    Password
                  </FieldLabel>
                  <div className="relative">
                    <Input
                      id="signin-password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-cyan-500 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  <FieldError errors={field.state.meta.errors} />
                </Field>
              )}
            </signInForm.Field>

            {/* Forgot Password */}
            <div className="text-right">
              <Link
                to="/auth/forgot-password"
                className="text-sm text-white hover:underline"
              >
                Forgot Password?
              </Link>
            </div>

            {/* Submit Button */}
            <signInForm.Subscribe
              selector={(state) => [state.canSubmit, state.isSubmitting]}
            >
              {([canSubmit, isSubmitting]) => (
                <Button
                  type="submit"
                  disabled={!canSubmit || signInMutation.isPending}
                  className="w-full bg-primary-100 hover:bg-primary-100 text-white font-semibold py-3"
                >
                  {isSubmitting || signInMutation.isPending ? (
                    <>
                      <Spinner className="w-5 h-5 mr-2" />
                      Signing In...
                    </>
                  ) : (
                    'Sign In'
                  )}
                </Button>
              )}
            </signInForm.Subscribe>
          </form>
        </TabsContent>
      </Tabs>
    </div>
  )
}
