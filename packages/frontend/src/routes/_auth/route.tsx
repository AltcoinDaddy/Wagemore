import { DashboardLayout } from '@/components/dashboard/_dashboard'
import { authStorage } from '@/lib/auth-storage'
import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth')({
  beforeLoad: async ({ location }) => {
    const user = authStorage.getUser()

    if (!user) {
      throw redirect({
        to: '/auth/sign-in',
        search: {
          redirect: location.href,
        },
      })
    }

    if (!user.emailVerified) {
      throw redirect({
        to: '/auth/verify-otp',
        search: {
          email: user.email,
        },
      })
    }
  },
  component: DashboardLayout,
})
