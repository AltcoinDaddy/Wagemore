import { cn } from '@/lib/utils'
import { Link } from '@tanstack/react-router'

interface LogoProps {
  headingClassName?: string
}
export const Logo = (props: LogoProps) => {
  return (
    <Link className="flex items-center space-x-2" to="/">
      <img src="/wagemore-logo.png" alt="WageMore" className="w-8 h-8" />
      <h1
        className={cn(
          'font-mono-display font-semibold',
          props.headingClassName,
        )}
      >
        WageMore
      </h1>
    </Link>
  )
}
