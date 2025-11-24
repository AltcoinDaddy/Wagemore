import { defineConfig } from '@wagmi/cli'
import { hardhat } from '@wagmi/cli/plugins'

export default defineConfig({
  out: 'src/integrations/web3/generated/wagmi.ts',
  contracts: [],
  plugins: [
    // For Hardhat projects
    hardhat({
      project: '../smart-contracts',
      artifacts: '../smart-contracts/artifacts',
      deployments: {
        // Map your contract names to deployment files
        // Update these addresses when you deploy contracts
        WagerContract: {
          31337: '0x5FbDB2315678afecb367f032d93F642f64180aa3', // hardhat localhost
          11155111: '0x0000000000000000000000000000000000000000', // sepolia
          1: '0x0000000000000000000000000000000000000000', // mainnet
        },
        TokenContract: {
          31337: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512', // hardhat localhost
          11155111: '0x0000000000000000000000000000000000000000', // sepolia
          1: '0x0000000000000000000000000000000000000000', // mainnet
        },
      },
      exclude: [
        // Exclude common development contracts
        '**/test/**',
        '**/tests/**',
        '**/*.t.sol',
        '**/*.s.sol',
        '**/Mock*.sol',
        '**/Lock.sol', // Default Hardhat example contract
      ],
      include: [
        // Include your main contracts
        '**/contracts/**/*.sol',
      ],
    }),
  ],
})
