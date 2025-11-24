import { createConfig, http } from 'wagmi'
import { hardhat, mainnet, sepolia } from 'wagmi/chains'
import { coinbaseWallet, injected, walletConnect } from 'wagmi/connectors'

// Get environment variables
const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || ''
const isProduction = import.meta.env.PROD

// Configure chains based on environment
const chains = isProduction
  ? ([mainnet, sepolia] as const)
  : ([hardhat, sepolia, mainnet] as const)

export const wagmiConfig = createConfig({
  chains,
  connectors: [
    injected(), // MetaMask, etc.
    coinbaseWallet({
      appName: 'WageMore',
      appLogoUrl: '/favicon.svg',
    }),
    ...(projectId ? [walletConnect({ projectId })] : []),
  ],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
    [hardhat.id]: http('http://127.0.0.1:8545'),
  },
  ssr: false, // Since we're using TanStack Start
})

// Export types for better TypeScript support
export type Config = typeof wagmiConfig
export type ChainId = (typeof chains)[number]['id']

// Helper function to get current chain info
export const getCurrentChain = () => {
  const chainId = wagmiConfig.state.chainId
  return chains.find((chain) => chain.id === chainId) || chains[0]
}

export const CONTRACT_ADDRESSES = {
  [hardhat.id]: {
    // Add your local contract addresses here
    wagerContract: '0x5FbDB2315678afecb367f032d93F642f64180aa3', // Example hardhat address
    tokenContract: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512', // Example hardhat address
  },
  [sepolia.id]: {
    // Add your testnet contract addresses here
    wagerContract: '0x0000000000000000000000000000000000000000',
    tokenContract: '0x0000000000000000000000000000000000000000',
  },
  [mainnet.id]: {
    // Add your mainnet contract addresses here (when ready)
    wagerContract: '0x0000000000000000000000000000000000000000',
    tokenContract: '0x0000000000000000000000000000000000000000',
  },
} as const

// Helper to get contract address for current chain
export const getContractAddress = (
  contractName: keyof (typeof CONTRACT_ADDRESSES)[ChainId],
  chainId?: ChainId | number,
) => {
  const currentChainId =
    chainId === wagmiConfig.state.chainId ? chainId : hardhat.id
  return CONTRACT_ADDRESSES[currentChainId][contractName]
}

// Chain configuration helpers
export const isTestnet = (chainId: ChainId | number) => {
  return chainId === sepolia.id || chainId === hardhat.id
}

export const getExplorerUrl = (chainId: ChainId | number) => {
  switch (chainId) {
    case mainnet.id:
      return 'https://etherscan.io'
    case sepolia.id:
      return 'https://sepolia.etherscan.io'
    case hardhat.id:
      return null
    default:
      return null
  }
}
