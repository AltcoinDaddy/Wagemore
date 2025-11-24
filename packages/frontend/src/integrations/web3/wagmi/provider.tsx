'use client'
import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { wagmiConfig } from './client'

interface Web3ProviderProps {
  children: React.ReactNode
  queryClient?: QueryClient
}

export function Web3Provider({ children, queryClient }: Web3ProviderProps) {
  // Use existing query client or create new one
  const client = queryClient || new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5, // 5 minutes
        retry: 3,
      },
    },
  })

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={client}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  )
}

// Export for easy integration
export { wagmiConfig }
export type { Web3ProviderProps }
