import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { authStorage } from '@/lib/auth-storage'

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
  component: ProtectedLayout,
})

function ProtectedLayout() {
  return <Outlet />
}
