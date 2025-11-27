'use client'

import { Button } from '@/components/ui/button'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp'
import { useVerifyEmail } from '@/hooks/use-auth'
import { useForm } from '@tanstack/react-form'
import { z } from 'zod'
import { redirect } from '@tanstack/react-router'
import { Spinner } from '../ui/spinner'

const verifyOtpSchema = z.object({
  otp: z.string().min(6, 'OTP must be 6 characters'),
})

export function VerifyOtpForm({ email }: { email: string }) {
  const verifyEmailMutation = useVerifyEmail()

  const form = useForm({
    defaultValues: {
      otp: '',
    },
    onSubmit: async ({ value }) => {
      if (!email) return
      verifyEmailMutation.mutate({ email, otp: value.otp })

      redirect({
        to: '/dashboard',
      })
    },
  })

  // Define styles here to keep JSX clean
  // w-12 h-12 is good for mobile, md:w-14 md:h-14 makes it bigger on desktop
  const slotStyles = 'w-12 h-12 md:w-14 md:h-14 text-lg md:text-xl rounded-md'

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">
          Verify Your Email
        </h1>
        <p className="text-slate-400">Enter the 6-digit code sent to {email}</p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          form.handleSubmit()
        }}
        className="space-y-6"
      >
        <form.Field
          name="otp"
          validators={{ onChange: verifyOtpSchema.shape.otp }}
        >
          {(field) => (
            <Field>
              <FieldLabel htmlFor="otp" className="sr-only">
                OTP
              </FieldLabel>
              <InputOTP
                id="otp"
                maxLength={6}
                value={field.state.value}
                onChange={(value) => field.handleChange(value)}
              >
                <InputOTPGroup className="w-full justify-center gap-2">
                  <InputOTPSlot index={0} className={slotStyles} />
                  <InputOTPSlot index={1} className={slotStyles} />
                  <InputOTPSlot index={2} className={slotStyles} />
                  <InputOTPSlot index={3} className={slotStyles} />
                  <InputOTPSlot index={4} className={slotStyles} />
                  <InputOTPSlot index={5} className={slotStyles} />
                </InputOTPGroup>
              </InputOTP>
              <FieldError errors={field.state.meta.errors} />
            </Field>
          )}
        </form.Field>

        <form.Subscribe
          selector={(state) => [state.canSubmit, state.isSubmitting]}
        >
          {([canSubmit, isSubmitting]) => (
            <Button
              type="submit"
              disabled={!canSubmit || verifyEmailMutation.isPending}
              className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-semibold py-3"
            >
              {isSubmitting || verifyEmailMutation.isPending ? (
                <Spinner className="w-5 h-5 mx-auto" />
              ) : (
                'Verify'
              )}
            </Button>
          )}
        </form.Subscribe>
      </form>
    </div>
  )
}
