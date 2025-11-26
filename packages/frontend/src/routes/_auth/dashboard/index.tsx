import { createFileRoute } from '@tanstack/react-router'
import { Dashboard } from '@/components/dashboard/dashboard'

export const Route = createFileRoute('/_auth/dashboard/')({
  component: DashboardPage,
})

function DashboardPage() {
  return <Dashboard />
}
