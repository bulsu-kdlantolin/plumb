import type { ProjectSpec } from '../../types/spec.types'

export interface StackPreset {
  id: string
  name: string
  summary: string
  stack: ProjectSpec['stack']
}

export const STACK_PRESETS: StackPreset[] = [
  {
    id: 'next-supabase-drizzle', name: 'Next.js 15 + Supabase + Drizzle', summary: 'Full-stack app with managed Postgres and typed schema.',
    stack: {
      architecturePattern: 'Full-stack modular monolith', frontend: 'Next.js 15 + React 19 + TypeScript', backend: 'Next.js Route Handlers + Supabase', database: 'Supabase PostgreSQL + Drizzle ORM', authStrategy: 'Supabase Auth — PKCE', stateManagement: 'React Server Components + Zustand',
      folderStructure: ['src/app', 'src/components', 'src/db', 'src/lib', 'src/server', 'src/types'],
      dependencies: { runtime: [{ name: 'next', version: '^15.0.0' }, { name: 'react', version: '^19.0.0' }, { name: '@supabase/supabase-js', version: '^2.0.0' }, { name: 'drizzle-orm', version: '^0.38.0' }], dev: [{ name: 'typescript', version: '^5.7.0' }, { name: 'drizzle-kit', version: '^0.30.0' }, { name: 'tailwindcss', version: '^4.0.0' }] },
      envVars: [{ key: 'NEXT_PUBLIC_SUPABASE_URL', scope: 'public', description: 'Supabase project URL.' }, { key: 'NEXT_PUBLIC_SUPABASE_ANON_KEY', scope: 'public', description: 'Supabase browser client key.' }, { key: 'SUPABASE_SERVICE_ROLE_KEY', scope: 'secret', description: 'Server-only elevated key.' }],
    },
  },
  {
    id: 'react-vite-local-first', name: 'React 19 + Vite + Local-First Dexie', summary: 'Offline-capable browser app with IndexedDB persistence.',
    stack: {
      architecturePattern: 'Local-first modular application', frontend: 'React 19 + TypeScript + Vite', backend: 'Optional sync API', database: 'IndexedDB + Dexie.js', authStrategy: 'Optional OIDC via hosted identity provider', stateManagement: 'Zustand + Dexie live queries',
      folderStructure: ['src/app', 'src/components', 'src/core', 'src/db', 'src/store', 'src/types'],
      dependencies: { runtime: [{ name: 'react', version: '^19.0.0' }, { name: 'vite', version: '^6.0.0' }, { name: 'zustand', version: '^5.0.0' }, { name: 'dexie', version: '^4.0.0' }], dev: [{ name: 'typescript', version: '^5.7.0' }, { name: 'vite', version: '^6.0.0' }, { name: 'tailwindcss', version: '^4.0.0' }] },
      envVars: [{ key: 'VITE_API_BASE_URL', scope: 'public', description: 'Optional sync service URL.' }, { key: 'VITE_OIDC_CLIENT_ID', scope: 'public', description: 'Public identity client ID.' }, { key: 'SYNC_SERVER_TOKEN', scope: 'secret', description: 'Server-side sync credential; never ship to the browser.' }],
    },
  },
  {
    id: 'react-fastapi-postgres', name: 'React + FastAPI + PostgreSQL', summary: 'Separate SPA and Python API with explicit contracts.',
    stack: {
      architecturePattern: 'Decoupled SPA + REST API', frontend: 'React 19 + TypeScript + Vite', backend: 'Python 3.12 + FastAPI', database: 'PostgreSQL 16 + SQLAlchemy', authStrategy: 'OAuth 2.1 bearer tokens', stateManagement: 'TanStack Query + Zustand',
      folderStructure: ['web/src/app', 'web/src/components', 'web/src/features', 'api/app/routers', 'api/app/models', 'api/tests'],
      dependencies: { runtime: [{ name: 'react', version: '^19.0.0' }, { name: 'fastapi', version: '^0.115.0' }, { name: 'sqlalchemy', version: '^2.0.0' }, { name: 'psycopg', version: '^3.2.0' }], dev: [{ name: 'typescript', version: '^5.7.0' }, { name: 'pytest', version: '^8.0.0' }, { name: 'ruff', version: '^0.8.0' }] },
      envVars: [{ key: 'VITE_API_BASE_URL', scope: 'public', description: 'FastAPI public base URL.' }, { key: 'DATABASE_URL', scope: 'secret', description: 'PostgreSQL connection string.' }, { key: 'JWT_SIGNING_KEY', scope: 'secret', description: 'API token signing secret.' }],
    },
  },
  {
    id: 'rails-postgres-hotwire', name: 'Rails 8 + PostgreSQL + Hotwire', summary: 'Server-rendered product with progressive enhancement.',
    stack: {
      architecturePattern: 'Server-rendered modular monolith', frontend: 'Ruby on Rails 8 + Hotwire', backend: 'Rails controllers and jobs', database: 'PostgreSQL 16 + Active Record', authStrategy: 'Rails session cookies', stateManagement: 'Turbo + Stimulus',
      folderStructure: ['app/controllers', 'app/models', 'app/views', 'app/javascript/controllers', 'app/jobs', 'config'],
      dependencies: { runtime: [{ name: 'rails', version: '~> 8.0' }, { name: 'pg', version: '~> 1.5' }, { name: 'solid_queue', version: '~> 1.0' }], dev: [{ name: 'rubocop', version: '~> 1.0' }, { name: 'rspec-rails', version: '~> 7.0' }] },
      envVars: [{ key: 'DATABASE_URL', scope: 'secret', description: 'PostgreSQL connection string.' }, { key: 'RAILS_MASTER_KEY', scope: 'secret', description: 'Decrypts Rails credentials.' }, { key: 'APP_HOST', scope: 'public', description: 'Canonical application hostname.' }],
    },
  },
]
