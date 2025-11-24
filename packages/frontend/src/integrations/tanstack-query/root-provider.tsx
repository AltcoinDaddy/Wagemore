import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Web3Provider } from '../web3/wagmi/provider'
import { Toaster } from '@/components/ui/sonner'

export function getContext() {
  const queryClient = new QueryClient()
  return {
    queryClient,
  }
}

export function Provider({
  children,
  queryClient,
}: {
  children: React.ReactNode
  queryClient: QueryClient
}) {
  return (
    <QueryClientProvider client={queryClient}>
      <Web3Provider queryClient={queryClient}>
        {children}
        <Toaster />
      </Web3Provider>
    </QueryClientProvider>
  )
}
