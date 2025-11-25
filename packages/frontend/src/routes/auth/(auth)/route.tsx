import { createFileRoute } from '@tanstack/react-router'
import { AuthLayout } from '@/components/auth/_auth'

export const Route = createFileRoute('/auth/(auth)')({
  component: AuthLayout,
})
