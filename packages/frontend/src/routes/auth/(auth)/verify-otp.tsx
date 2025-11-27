import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { VerifyOtpForm } from '@/components/auth/verify-otp-form'
import { z } from 'zod'
import { useResendVerification } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

const verifyOtpSearchSchema = z.object({
  email: z.email().optional(),
})

export const Route = createFileRoute('/auth/(auth)/verify-otp')({
  validateSearch: (search) => verifyOtpSearchSchema.parse(search),
  component: VerifyOtpPage,
})

function VerifyOtpPage() {
  const navigate = useNavigate()
  const { email } = Route.useSearch()
  const resendVerificationMutation = useResendVerification()

  if (!email) {
    navigate({ to: '/auth/sign-in' })
    return null
  }

  const handleResend = () => {
    resendVerificationMutation.mutate(email, {
      onSuccess: () => {
        toast.success('Verification email sent!')
      },
      onError: (error) => {
        toast.error(error.message || 'Failed to send verification email')
      },
    })
  }

  return (
    <>
      <VerifyOtpForm email={email} />
      <div className="mt-4 text-center">
        <p className="text-slate-400">
          Didn't receive an email?{' '}
          <Button
            variant="link"
            className="text-cyan-400"
            onClick={handleResend}
            disabled={resendVerificationMutation.isPending}
          >
            Resend verification
          </Button>
        </p>
      </div>
    </>
  )
}
