import { createFileRoute } from '@tanstack/react-router'
import { AuthForm } from '@/components/auth/auth-form'

export const Route = createFileRoute('/auth/(auth)/sign-in')({
  component: SignInPage,
})

function SignInPage() {
  return <AuthForm defaultTab="signin" />
}
