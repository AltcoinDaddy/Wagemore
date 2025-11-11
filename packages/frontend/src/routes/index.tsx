import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: Index,
})

function Index() {
  return (
    <div className="min-h-screen bg-linear-to-b from-slate-900 via-slate-800 to-slate-900">
      <section className="relative py-20 px-6 text-center overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-r from-cyan-500/10 via-blue-500/10 to-purple-500/10"></div>
        <div className="relative max-w-5xl mx-auto">
          <h1 className="text-6xl md:text-7xl font-black text-white tracking-[-0.08em] mb-6">
            <span className="bg-linear-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              Wagermore
            </span>
          </h1>
          <p className="text-2xl md:text-3xl text-gray-300 mb-4 font-light">
            A modern monorepo with React frontend and Hono backend
          </p>
          <p className="text-lg text-gray-400 max-w-3xl mx-auto mb-8">
            Type-safe full-stack development with React 19, Vite, Hono,
            PostgreSQL, and Drizzle ORM.
          </p>
          <div className="flex flex-col items-center gap-4">
            <div className="px-8 py-3 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold rounded-lg transition-colors shadow-lg shadow-cyan-500/50 cursor-default">
              Welcome to Wagermore
            </div>
            <p className="text-gray-400 text-sm mt-2">
              Start building by editing{' '}
              <code className="px-2 py-1 bg-slate-700 rounded text-cyan-400">
                /packages/frontend/src/routes/index.tsx
              </code>
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 hover:border-cyan-500/50 transition-all duration-300">
            <h3 className="text-xl font-semibold text-white mb-3">
              ⚡ React 19 + Vite
            </h3>
            <p className="text-gray-400">
              Fast, modern frontend development with Vite and React 19.
            </p>
          </div>
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 hover:border-cyan-500/50 transition-all duration-300">
            <h3 className="text-xl font-semibold text-white mb-3">
              🔧 Hono Backend
            </h3>
            <p className="text-gray-400">
              Lightweight, type-safe API server powered by Hono.
            </p>
          </div>
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 hover:border-cyan-500/50 transition-all duration-300">
            <h3 className="text-xl font-semibold text-white mb-3">
              🗄️ Drizzle ORM
            </h3>
            <p className="text-gray-400">
              Type-safe database queries with PostgreSQL.
            </p>
          </div>
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 hover:border-cyan-500/50 transition-all duration-300">
            <h3 className="text-xl font-semibold text-white mb-3">
              📦 Monorepo
            </h3>
            <p className="text-gray-400">
              Organized package structure with pnpm workspaces.
            </p>
          </div>
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 hover:border-cyan-500/50 transition-all duration-300">
            <h3 className="text-xl font-semibold text-white mb-3">
              🔐 Type Safety
            </h3>
            <p className="text-gray-400">
              End-to-end TypeScript for complete type safety.
            </p>
          </div>
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 hover:border-cyan-500/50 transition-all duration-300">
            <h3 className="text-xl font-semibold text-white mb-3">
              🚀 Production Ready
            </h3>
            <p className="text-gray-400">
              Fully configured and ready for deployment.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 px-6 bg-slate-800/30 border-t border-slate-700">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Quick Start</h2>
          <div className="bg-slate-900 p-6 rounded-lg text-left font-mono text-sm text-cyan-400 overflow-x-auto">
            <div>$ pnpm install</div>
            <div>$ pnpm dev</div>
            <div>$ open http://localhost:3000</div>
          </div>
          <p className="text-gray-400 mt-4">
            Check out the documentation in QUICKSTART.md for more details.
          </p>
        </div>
      </section>
    </div>
  )
}
