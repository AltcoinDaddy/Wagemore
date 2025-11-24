import { Link } from '@tanstack/react-router'
import { Grip } from 'lucide-react'
import { Button } from '../ui/button'
import { navigationItems } from '@/constants'

export const Header = () => {
  return (
    <header className="sticky top-0 w-full sm:px-10 px-4 py-6 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo Section */}
        <div className="flex items-center space-x-2">
          <img src="/wagemore-logo.png" alt="WageMore" className="w-8 h-8" />
          <h1 className="font-mono-display text-xl font-bold">WageMore</h1>
        </div>

        {/* Navigation Menu */}
        <nav className="hidden md:flex items-center space-x-8">
          {navigationItems.map((item) => (
            <Link to={item.href} className="hover:underline text-white">
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center space-x-4">
          <Button
            className="text-normal font-medium hover:underline text-white"
            variant="link"
          >
            <Link to="/auth/sign-in">Sign In</Link>
          </Button>
          <Button className="px-4 py-2 text-sm font-medium bg-primary-100 rounded-md hover:bg-gray-50">
            <Link to="/auth/sign-up">Get Started</Link>
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <button className="md:hidden p-2">
          <Grip className="w-6 h-6 items-center" />
        </button>
      </div>
    </header>
  )
}
