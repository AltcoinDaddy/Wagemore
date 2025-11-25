import { createFileRoute } from '@tanstack/react-router'
import { AuthForm } from '@/components/auth/auth-form'

function RouteComponent() {
  return <AuthForm defaultTab="signin" />
}

export const Route = createFileRoute('/auth/(auth)/sign-in')({
  component: RouteComponent,
})
