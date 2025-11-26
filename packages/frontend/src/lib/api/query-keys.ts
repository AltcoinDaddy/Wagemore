export const queryKeys = {
  // Auth related queries
  auth: {
    all: ['auth'] as const,
    user: () => ['auth', 'user'] as const,
    session: () => ['auth', 'session'] as const,
  },

  // User related queries
  users: {
    all: ['users'] as const,
    lists: () => ['users', 'list'] as const,
    list: (filters: Record<string, unknown>) =>
      ['users', 'list', filters] as const,
    details: () => ['users', 'detail'] as const,
    detail: (id: string) => ['users', 'detail', id] as const,
    profile: (id: string) => ['users', 'profile', id] as const,
  },

  // Wallet related queries
  wallets: {
    all: ['wallets'] as const,
    connected: () => ['wallets', 'connected'] as const,
    balance: (address: string) => ['wallets', 'balance', address] as const,
    transactions: (address: string) =>
      ['wallets', 'transactions', address] as const,
    nonce: (address: string) => ['wallets', 'nonce', address] as const,
  },

  // Wagering related queries
  wagers: {
    all: ['wagers'] as const,
    lists: () => ['wagers', 'list'] as const,
    list: (filters: Record<string, unknown>) =>
      ['wagers', 'list', filters] as const,
    details: () => ['wagers', 'detail'] as const,
    detail: (id: string) => ['wagers', 'detail', id] as const,
    active: () => ['wagers', 'active'] as const,
    history: (userId: string) => ['wagers', 'history', userId] as const,
  },

  // Games related queries
  games: {
    all: ['games'] as const,
    lists: () => ['games', 'list'] as const,
    list: (filters: Record<string, unknown>) =>
      ['games', 'list', filters] as const,
    details: () => ['games', 'detail'] as const,
    detail: (id: string) => ['games', 'detail', id] as const,
    active: () => ['games', 'active'] as const,
    leaderboard: () => ['games', 'leaderboard'] as const,
  },

  // Notifications related queries
  notifications: {
    all: ['notifications'] as const,
    lists: () => ['notifications', 'list'] as const,
    list: (userId: string) => ['notifications', 'list', userId] as const,
    unread: (userId: string) => ['notifications', 'unread', userId] as const,
  },

  // Statistics and analytics
  stats: {
    all: ['stats'] as const,
    global: () => ['stats', 'global'] as const,
    user: (userId: string) => ['stats', 'user', userId] as const,
    game: (gameId: string) => ['stats', 'game', gameId] as const,
  },
} as const
