import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/auth/(auth)/sign-in')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/auth/(auth)/sign-in"!</div>
}
