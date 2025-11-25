import { createFileRoute } from '@tanstack/react-router'
import { AuthForm } from '@/components/auth/auth-form'

function RouteComponent() {
  return <AuthForm defaultTab="signup" />
}

export const Route = createFileRoute('/auth/(auth)/sign-up')({
  component: RouteComponent,
})
