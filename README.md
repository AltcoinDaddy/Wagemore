# Wagermore

A modern, full-stack monorepo featuring a **React 19 frontend**, **Hono backend**, and **Hardhat smart contracts**. Built with TypeScript, Vite, PostgreSQL, Drizzle ORM, and Ethereum smart contract development tools.

## 🚀 Quick Start

### Prerequisites

- **Node.js** >= 18.0.0
- **pnpm** >= 8.0.0
- **PostgreSQL** (for backend database)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd wagermore

# Install dependencies
pnpm install

# Copy environment template
cp .env.example .env

# Set up database
pnpm db:push
```

### Development

Start all development servers:

```bash
pnpm dev
```

Or run individual services:

```bash
pnpm dev:frontend   # React frontend on http://localhost:3000
pnpm dev:backend    # Hono backend on http://localhost:8787
pnpm contracts:node # Hardhat node on http://127.0.0.1:8545
```

### Building

Build all packages:

```bash
pnpm build
```

Build individual packages:

```bash
pnpm build:frontend    # Build React app
pnpm build:backend     # Build Hono server
pnpm contracts:compile # Compile smart contracts
```

## 📦 Project Structure

This is a **pnpm monorepo** with the following workspace packages:

```
wagermore/
├── packages/
│   ├── frontend/          # React 19 + Vite frontend
│   ├── backend/           # Hono + PostgreSQL + Drizzle
│   ├── contracts/         # Hardhat + Solidity smart contracts
│   └── shared/            # Shared utilities and types
├── pnpm-workspace.yaml    # Workspace configuration
├── tsconfig.base.json     # Base TypeScript configuration
├── package.json           # Root package configuration
└── README.md             # This file
```

## 🎯 Packages Overview

### Frontend (`packages/frontend`)

A modern React 19 application with Vite for fast development.

**Key Features:**
- React 19 with latest hooks
- Vite for fast HMR and builds
- TailwindCSS for styling
- TypeScript for type safety
- React Router v7 for routing
- TanStack Query for data fetching
- Shadcn/ui components

**Quick Commands:**
```bash
pnpm dev:frontend          # Start dev server
pnpm build:frontend        # Build for production
pnpm preview               # Preview production build
pnpm lint                  # Lint code
pnpm format                # Format code
pnpm check                 # Type check
```

**Documentation:** See `packages/frontend/README.md`

### Backend (`packages/backend`)

A Hono-based HTTP server with PostgreSQL and Drizzle ORM.

**Key Features:**
- Hono web framework
- PostgreSQL database
- Drizzle ORM for type-safe queries
- TypeScript throughout
- REST API structure
- Database migrations

**Quick Commands:**
```bash
pnpm dev:backend           # Start dev server
pnpm build:backend         # Build for production
pnpm start:backend         # Run production build
pnpm db:push               # Push schema to database
pnpm db:migrate            # Run migrations
pnpm db:pull               # Pull schema from database
pnpm db:studio             # Open Drizzle Studio
pnpm db:generate           # Generate migration files
```

**Documentation:** See `packages/backend/README.md`

### Smart Contracts (`packages/contracts`)

Hardhat-based smart contracts for Ethereum development.

**Key Features:**
- Hardhat development environment
- Solidity 0.8.20
- Comprehensive test suite with Chai/Mocha
- TypeChain for type-safe contract interactions
- Multi-network support (Hardhat, Localhost, Sepolia, Mainnet)
- Gas reporting and coverage analysis

**Quick Commands:**
```bash
pnpm contracts:compile           # Compile contracts
pnpm contracts:test              # Run tests
pnpm contracts:node              # Start local Hardhat node
pnpm contracts:deploy            # Deploy to Hardhat
pnpm contracts:deploy:localhost  # Deploy to local node
pnpm contracts:deploy:sepolia    # Deploy to Sepolia testnet
pnpm test:contracts:coverage     # Coverage report
```

**Documentation:** See `packages/contracts/README.md`

### Shared (`packages/shared`)

Shared utilities, types, and helpers used across packages.

## 🔧 Common Tasks

### Development

```bash
# Start all services
pnpm dev

# Start frontend only
pnpm dev:frontend

# Start backend only
pnpm dev:backend

# Start Hardhat node
pnpm contracts:node
```

### Building

```bash
# Build all packages
pnpm build

# Build specific package
pnpm build:frontend
pnpm build:backend
pnpm contracts:compile
```

### Testing

```bash
# Run all tests
pnpm test

# Frontend tests
pnpm test:frontend

# Contract tests
pnpm contracts:test

# Contract coverage
pnpm test:contracts:coverage
```

### Database

```bash
# Push schema to database
pnpm db:push

# Generate migration files
pnpm db:generate

# Run migrations
pnpm db:migrate

# Pull schema from database
pnpm db:pull

# Open Drizzle Studio
pnpm db:studio
```

### Smart Contracts

```bash
# Compile contracts
pnpm contracts:compile

# Run tests
pnpm contracts:test

# Start local node
pnpm contracts:node

# Deploy to Sepolia
pnpm contracts:deploy:sepolia

# Clean build artifacts
pnpm contracts:clean
```

### Code Quality

```bash
# Lint code
pnpm lint

# Format code
pnpm format

# Type check
pnpm check
```

## 📋 Environment Variables

Create a `.env` file in the repository root:

```bash
# Frontend
VITE_API_URL=http://localhost:8787

# Backend
DATABASE_URL=postgresql://user:password@localhost:5432/wagermore
NODE_ENV=development

# Smart Contracts
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
PRIVATE_KEY=your_private_key_here
ETHERSCAN_API_KEY=your_etherscan_api_key
```

See package-specific `.env.example` files for detailed variable descriptions.

## 🗄️ Database Setup

### PostgreSQL Installation

**macOS:**
```bash
brew install postgresql
brew services start postgresql
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt-get install postgresql postgresql-contrib
sudo service postgresql start
```

**Windows:**
Download and install from [postgresql.org](https://www.postgresql.org/download/windows/)

### Create Database

```bash
createdb wagermore
```

### Initialize Schema

```bash
pnpm db:push
```

### View Data

```bash
pnpm db:studio
```

## 🔗 API Integration

The frontend is configured to communicate with the backend via `VITE_API_URL` environment variable.

**Example API call:**

```typescript
// In frontend
const response = await fetch(`${import.meta.env.VITE_API_URL}/api/endpoint`)
```

**Backend endpoints:**
- Base URL: `http://localhost:8787`
- API routes: `http://localhost:8787/api/*`

## 📝 TypeScript Configuration

The monorepo uses a base TypeScript configuration with path aliases:

```json
{
  "paths": {
    "@/*": ["./src/*"],
    "@wagermore/*": ["../../packages/*/src"]
  }
}
```

Use these aliases in imports:

```typescript
import { MyComponent } from '@/components/MyComponent'
import { utils } from '@wagermore/shared'
```

## 🚢 Deployment

### Frontend (Vercel/Netlify)

```bash
pnpm build:frontend
# Deploy dist/ folder
```

### Backend (Railway/Render)

```bash
pnpm build:backend
# Deploy with Node.js runtime
```

### Smart Contracts

Deploy to testnet:
```bash
pnpm contracts:deploy:sepolia
```

Deploy to mainnet:
```bash
pnpm contracts:deploy
```

## 📚 Documentation

- **Frontend:** `packages/frontend/README.md`
- **Backend:** `packages/backend/README.md`
- **Smart Contracts:** `packages/contracts/README.md`
- **Architecture:** `docs/ARCHITECTURE.md` (if available)
- **Setup Guide:** `docs/QUICKSTART.md` (if available)

## 🛠️ Technology Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, Vite, TypeScript, TailwindCSS, React Router, TanStack Query |
| **Backend** | Hono, PostgreSQL, Drizzle ORM, TypeScript |
| **Contracts** | Hardhat, Solidity 0.8.20, Ethers.js, TypeChain |
| **Monorepo** | pnpm, TypeScript, ESLint |
| **Database** | PostgreSQL, Drizzle Kit |

## 🔐 Security Best Practices

- **Environment Variables:** Never commit `.env` files
- **Private Keys:** Use hardware wallets for mainnet
- **Audits:** Have smart contracts audited before mainnet deployment
- **Dependencies:** Keep packages updated: `pnpm update`
- **Secrets:** Use environment secrets in CI/CD pipelines

## 🤝 Contributing

1. Create a feature branch: `git checkout -b feature/name`
2. Make your changes
3. Run tests: `pnpm test`
4. Format code: `pnpm format`
5. Commit: `git commit -am 'Add feature'`
6. Push: `git push origin feature/name`
7. Create a Pull Request

## 📖 Learning Resources

- [React Documentation](https://react.dev)
- [Vite Guide](https://vitejs.dev)
- [Hono Documentation](https://hono.dev)
- [Drizzle ORM](https://orm.drizzle.team)
- [Hardhat](https://hardhat.org)
- [Solidity](https://soliditylang.org)
- [pnpm Workspaces](https://pnpm.io/workspaces)

## 🐛 Troubleshooting

### Port Already in Use

```bash
# Find and kill process using port
lsof -i :3000  # Frontend
lsof -i :8787  # Backend
lsof -i :8545  # Hardhat node
```

### Database Connection Issues

```bash
# Check PostgreSQL is running
psql -U postgres -d wagermore

# Verify DATABASE_URL in .env
```

### Build Errors

```bash
# Clean and reinstall
rm -rf node_modules
pnpm install
pnpm build
```

### TypeScript Errors

```bash
# Run type check
pnpm check

# Fix types
pnpm format
```

## 📄 License

MIT

## 👤 Author

Wagermore Team

## 📞 Support

For issues and questions:
1. Check relevant package README
2. Review environment configuration
3. Check build/test output for details
4. Create an issue on GitHub

---

**Happy coding! 🚀**