import { createFileRoute } from '@tanstack/react-router'
import { Header } from '@/components/shared/header'

export const Route = createFileRoute('/')({
  component: RootPage,
})

function RootPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
    </div>
  )
}
