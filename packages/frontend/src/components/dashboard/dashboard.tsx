'use client'

import { useAuth, useLogout } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { LogOut, User, Mail, Shield } from 'lucide-react'

export function Dashboard() {
  const { user } = useAuth()
  const logoutMutation = useLogout()

  const handleLogout = () => {
    logoutMutation.mutate()
  }

  if (!user) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="text-white text-lg">
          Please log in to access the dashboard
        </div>
      </div>
    )
  }

  const initials = user.name
    ? user.name.substring(0, 2).toUpperCase()
    : user.email
      ? user.email.substring(0, 2).toUpperCase()
      : 'U'

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        {/* Welcome Section */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
            <p className="text-slate-400">
              Manage your account and start wagering
            </p>
          </div>
          <Button
            onClick={handleLogout}
            disabled={logoutMutation.isPending}
            variant="outline"
            className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white"
          >
            <LogOut className="w-4 h-4 mr-2" />
            {logoutMutation.isPending ? 'Signing out...' : 'Sign Out'}
          </Button>
        </div>

        {/* User Profile Card */}
        <Card className="bg-slate-800/50 border-slate-700 mb-8">
          <CardHeader className="pb-4">
            <CardTitle className="text-white flex items-center gap-3">
              <Avatar className="w-12 h-12">
                <AvatarFallback className="bg-cyan-500 text-white">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="text-lg">Your Account</div>
                <CardDescription className="text-slate-400">
                  Account information and settings
                </CardDescription>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-700/30">
                <User className="w-5 h-5 text-cyan-400" />
                <div>
                  <div className="text-sm text-slate-400">Name</div>
                  <div className="text-white font-medium">{user.name}</div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-700/30">
                <Mail className="w-5 h-5 text-cyan-400" />
                <div>
                  <div className="text-sm text-slate-400">Email</div>
                  <div className="text-white font-medium">{user.email}</div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
              <Shield className="w-5 h-5 text-green-400" />
              <div>
                <div className="text-sm text-green-400">
                  Authentication Status
                </div>
                <div className="text-green-300 font-medium">Authenticated</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white text-lg">
                Start Wagering
              </CardTitle>
              <CardDescription className="text-slate-400">
                Browse available games and place your bets
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full bg-cyan-500 hover:bg-cyan-600 text-white">
                Browse Games
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white text-lg">Your Profile</CardTitle>
              <CardDescription className="text-slate-400">
                Update your account settings and preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                className="w-full border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white"
              >
                Edit Profile
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white text-lg">Wallet</CardTitle>
              <CardDescription className="text-slate-400">
                Connect your wallet for seamless transactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                className="w-full border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white"
              >
                Connect Wallet
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-white">0</div>
              <p className="text-xs text-slate-400">Total Bets</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-white">$0.00</div>
              <p className="text-xs text-slate-400">Total Wagered</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-white">$0.00</div>
              <p className="text-xs text-slate-400">Total Winnings</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-white">0%</div>
              <p className="text-xs text-slate-400">Win Rate</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
