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
