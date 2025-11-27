import { createFileRoute } from '@tanstack/react-router'
import { AuthForm } from '@/components/auth/auth-form'

export const Route = createFileRoute('/auth/(auth)/sign-up')({
  component: SignUpPage,
})

function SignUpPage() {
  return <AuthForm defaultTab="signup" />
}
