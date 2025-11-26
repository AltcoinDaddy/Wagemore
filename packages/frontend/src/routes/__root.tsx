import { createRootRouteWithContext, Outlet } from '@tanstack/react-router'
import { ReactNode, useEffect, useState } from 'react'
import { Toaster } from '@/components/ui/sonner'
import { ThemeProvider } from 'next-themes'

import type { QueryClient } from '@tanstack/react-query'

export interface RouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootComponent,
})

function RootComponent() {
  return (
    <div className="min-h-screen bg-gradient-to-r from-[#0A0C14] via-[#1A1F2C] to-[#0A0C14] text-white">
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        enableSystem
        disableTransitionOnChange
      >
        <Outlet />
        <Toaster />
      </ThemeProvider>
    </div>
  )
}
