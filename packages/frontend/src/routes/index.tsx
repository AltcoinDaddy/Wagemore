import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: Index,
})

function Index() {
  return (
    <div className="flex flex-col min-h-screen">
      <h2 className="text-2xl font-bold font-mono-display p-4">WageMore</h2>
    </div>
  )
}
