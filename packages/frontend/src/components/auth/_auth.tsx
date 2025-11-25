import { Outlet } from '@tanstack/react-router'
import { Logo } from '../logo'

export const AuthLayout = () => {
  return (
    <div className="min-h-screen flex  flex-col items-center justify-center p-4 gap-4">
      <div className="flex justify-center text-center">
        <Logo headingClassName="text-2xl text-white" />
      </div>
      <div className="w-full max-w-md">
        {/* Background blur card */}
        <div className="backdrop-blur-xl bg-slate-800/50 border border-slate-700/50 rounded-2xl p-8 shadow-2xl">
          {/* Auth content */}
          <Outlet />
        </div>
      </div>
    </div>
  )
}
