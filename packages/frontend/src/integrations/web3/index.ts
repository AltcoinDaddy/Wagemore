// Wagmi configuration and client
export { wagmiConfig } from './wagmi/client'
export type { Config, ChainId } from './wagmi/client'
export {
  CONTRACT_ADDRESSES,
  getContractAddress,
  getCurrentChain,
  getExplorerUrl,
  isTestnet,
} from './wagmi/client'

// Providers
export { Web3Provider } from './wagmi/provider'
export type { Web3ProviderProps } from './wagmi/provider'

// Wallet hooks
export {
  useWallet,
  useWalletConnectors,
  useWalletAutoConnect,
  useNetworkValidation,
} from './hooks/use-wallet'
export type { WalletState, WalletActions } from './hooks/use-wallet'

export {
  useAccount,
  useConnect,
  useDisconnect,
  useBalance,
  useChainId,
  useSwitchChain,
  useReadContract,
  useWriteContract,
  useWatchContractEvent,
} from 'wagmi'

// Re-export Viem utilities for convenience
export {
  parseEther,
  formatEther,
  parseUnits,
  formatUnits,
  isAddress,
  getAddress,
} from 'viem'
