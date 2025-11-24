import { useEffect, useState } from 'react'
import { formatEther } from 'viem'
import {
  useAccount,
  useBalance,
  useChainId,
  useConnect,
  useDisconnect,
  useSwitchChain,
} from 'wagmi'
import { getCurrentChain, getExplorerUrl, isTestnet } from '../wagmi/client'

export interface WalletState {
  // Connection state
  isConnected: boolean
  isConnecting: boolean
  isReconnecting: boolean

  // Account info
  address?: `0x${string}`
  balance?: string
  formattedBalance?: string

  // Chain info
  chainId?: number
  chainName?: string
  isTestnet?: boolean
  explorerUrl?: string | null

  // Error state
  error?: Error | null
}

export interface WalletActions {
  connect: (connectorId?: string) => Promise<void>
  disconnect: () => void
  switchChain: (chainId: number) => Promise<void>
  clearError: () => void
  refreshBalance: () => void
}

export function useWallet(): WalletState & WalletActions {
  const [error, setError] = useState<Error | null>(null)

  // Wagmi hooks
  const { address, isConnected, isConnecting, isReconnecting } = useAccount()
  const {
    connect: wagmiConnect,
    connectors,
    isPending: isConnectPending,
  } = useConnect()
  const { disconnect: wagmiDisconnect } = useDisconnect()
  const { data: balance, refetch: refetchBalance } = useBalance({ address })
  const chainId = useChainId()
  const { switchChain: wagmiSwitchChain } = useSwitchChain()

  // Derived state
  const currentChain = getCurrentChain()
  const explorerUrl = chainId ? getExplorerUrl(chainId) : null
  const isCurrentTestnet = chainId ? isTestnet(chainId) : false

  const formattedBalance = balance
    ? `${parseFloat(formatEther(balance.value)).toFixed(4)} ${balance.symbol}`
    : undefined

  // Connection function
  const connect = async (connectorId?: string) => {
    try {
      setError(null)

      let connector = connectors[0] // Default to first connector

      if (connectorId) {
        const foundConnector = connectors.find((c) => c.id === connectorId)
        if (foundConnector) connector = foundConnector
      }

      if (connectors.length === 0) {
        throw new Error('No wallet connector available')
      }

      await wagmiConnect({ connector })
    } catch (err) {
      const error = err as Error
      setError(error)
      throw error
    }
  }

  // Disconnect function
  const disconnect = () => {
    try {
      setError(null)
      wagmiDisconnect()
    } catch (err) {
      // const error = err as Error
      setError(error)
    }
  }

  // Switch chain function
  const switchChain = async (targetChainId: number) => {
    try {
      setError(null)

      await wagmiSwitchChain({ chainId: targetChainId })
    } catch (err) {
      // const error = err as Error
      setError(error)
      throw error
    }
  }

  // Clear error function
  const clearError = () => {
    setError(null)
  }

  // Refresh balance function
  const refreshBalance = () => {
    refetchBalance()
  }

  // Auto-clear errors when connection state changes
  useEffect(() => {
    if (isConnected) {
      setError(null)
    }
  }, [isConnected])

  return {
    // State
    isConnected,
    isConnecting: isConnecting || isConnectPending,
    isReconnecting,
    address,
    balance: balance ? formatEther(balance.value) : undefined,
    formattedBalance,
    chainId,
    chainName: currentChain.name,
    isTestnet: isCurrentTestnet,
    explorerUrl,
    error,

    // Actions
    connect,
    disconnect,
    switchChain,
    clearError,
    refreshBalance,
  }
}

// Hook for getting available connectors
export function useWalletConnectors() {
  const { connectors } = useConnect()

  return {
    connectors: connectors.map((connector) => ({
      id: connector.id,
      name: connector.name,
      icon: connector.icon,
      ready: connector.type !== 'injected' || typeof window !== 'undefined',
    })),
  }
}

// Hook for wallet connection status with auto-reconnect
export function useWalletAutoConnect() {
  const { isConnected, isReconnecting } = useAccount()
  const [hasAttemptedConnection, setHasAttemptedConnection] = useState(false)

  useEffect(() => {
    // Mark that we've attempted connection once the component mounts
    if (!hasAttemptedConnection) {
      setHasAttemptedConnection(true)
    }
  }, [hasAttemptedConnection])

  return {
    isReady: hasAttemptedConnection && !isReconnecting,
    isConnected,
    isReconnecting,
  }
}

// Hook for network validation
export function useNetworkValidation(requiredChainId?: number) {
  const chainId = useChainId()
  const { switchChain } = useSwitchChain()

  const isCorrectNetwork = requiredChainId ? chainId === requiredChainId : true

  const switchToRequiredNetwork = async () => {
    if (requiredChainId) {
      await switchChain({ chainId: requiredChainId })
    }
  }

  return {
    isCorrectNetwork,
    currentChainId: chainId,
    requiredChainId,
    switchToRequiredNetwork,
    canSwitchChain: !!switchChain,
  }
}
