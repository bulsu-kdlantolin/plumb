import { create } from 'zustand'
import { plumbDb } from '../db/dexie'
import type { ProjectSpec } from '../types/spec.types'
import type { CompiledFileName } from '../core/compiler/compileProject'

export const DEFAULT_PROJECT: ProjectSpec = {
  id: 'pulseboard',
  name: 'PulseBoard — Team Metrics Studio',
  description: 'A shared studio for turning team activity into clear, actionable metrics.',
  updatedAt: '2026-11-22T09:30:00.000Z',
  scope: {
    elevatorPitch: 'PulseBoard turns the work already happening across a team into a calm, trustworthy picture of progress.',
    targetUser: 'Engineering leads and product teams at growing software companies.',
    coreLoopSteps: ['Connect a workspace', 'Review the weekly pulse', 'Spot a trend', 'Share the next action'],
    roles: [
      { name: 'Owner', permissions: ['manage_workspace', 'manage_members', 'view_metrics', 'export_reports'] },
      { name: 'Member', permissions: ['view_metrics', 'add_event'] },
    ],
    routes: [
      { path: '/login', authRequired: false, states: ['loading', 'error'] },
      { path: '/app', authRequired: true, redirectTo: '/login', states: ['loading', 'empty', 'error', 'overflow'] },
      { path: '/settings/team', authRequired: true, redirectTo: '/login', states: ['loading', 'error'] },
    ],
    nonGoals: ['No employee surveillance or individual productivity scoring.', 'No public social feed or gamified leaderboards.', 'No replacement for the team’s source-of-truth issue tracker.'],
  },
  stack: {
    architecturePattern: 'Local-first modular monolith',
    frontend: 'React 19 + TypeScript + Vite',
    backend: 'Supabase Edge Functions',
    database: 'PostgreSQL 16',
    authStrategy: 'Supabase Auth — email magic link',
    stateManagement: 'Zustand + IndexedDB cache',
    folderStructure: ['src/app', 'src/components', 'src/core', 'src/db', 'src/store', 'src/types'],
    dependencies: {
      runtime: [
        { name: 'react', version: '^19.3.1' },
        { name: '@xyflow/react', version: '^13.0.2' },
        { name: 'zustand', version: '^5.1.0' },
        { name: 'dexie', version: '^4.4.7' },
      ],
      dev: [
        { name: 'vite', version: '^8.3.6' },
        { name: 'typescript', version: '~7.0.2' },
        { name: 'tailwindcss', version: '^4.3.5' },
      ],
    },
    envVars: [
      { key: 'VITE_SUPABASE_URL', scope: 'public', description: 'Supabase project URL.' },
      { key: 'VITE_SUPABASE_ANON_KEY', scope: 'public', description: 'Supabase public client key.' },
      { key: 'SUPABASE_SERVICE_ROLE_KEY', scope: 'secret', description: 'Server-only service role key; never expose to the browser.' },
    ],
  },
  data: {
    entities: [
      {
        id: 'users', name: 'users', position: { x: 100, y: 100 }, rlsPolicy: 'id = auth.uid()', indexes: ['users_email_key'],
        fields: [
          { id: 'users_id', name: 'id', type: 'uuid', isPrimary: true, isNullable: false },
          { id: 'users_email', name: 'email', type: 'text', isPrimary: false, isNullable: false },
          { id: 'users_name', name: 'display_name', type: 'text', isPrimary: false, isNullable: true },
          { id: 'users_created', name: 'created_at', type: 'timestamptz', isPrimary: false, isNullable: false },
        ],
      },
      {
        id: 'workspaces', name: 'workspaces', position: { x: 390, y: 100 }, rlsPolicy: 'is_workspace_member(id, auth.uid())', indexes: ['workspaces_slug_key', 'workspaces_owner_id_idx'],
        fields: [
          { id: 'workspaces_id', name: 'id', type: 'uuid', isPrimary: true, isNullable: false },
          { id: 'workspaces_owner', name: 'owner_id', type: 'uuid', isPrimary: false, isNullable: false, references: { entity: 'users', field: 'id' }, onDelete: 'restrict' },
          { id: 'workspaces_name', name: 'name', type: 'text', isPrimary: false, isNullable: false },
          { id: 'workspaces_slug', name: 'slug', type: 'text', isPrimary: false, isNullable: false },
          { id: 'workspaces_created', name: 'created_at', type: 'timestamptz', isPrimary: false, isNullable: false },
        ],
      },
      {
        id: 'events', name: 'events', position: { x: 680, y: 100 }, rlsPolicy: 'is_workspace_member(workspace_id, auth.uid())', indexes: ['events_workspace_created_idx', 'events_actor_id_idx'],
        fields: [
          { id: 'events_id', name: 'id', type: 'uuid', isPrimary: true, isNullable: false },
          { id: 'events_workspace', name: 'workspace_id', type: 'uuid', isPrimary: false, isNullable: false, references: { entity: 'workspaces', field: 'id' }, onDelete: 'cascade' },
          { id: 'events_actor', name: 'actor_id', type: 'uuid', isPrimary: false, isNullable: true, references: { entity: 'users', field: 'id' }, onDelete: 'set-null' },
          { id: 'events_kind', name: 'event_type', type: 'text', isPrimary: false, isNullable: false },
          { id: 'events_payload', name: 'payload', type: 'jsonb', isPrimary: false, isNullable: false },
          { id: 'events_created', name: 'created_at', type: 'timestamptz', isPrimary: false, isNullable: false },
        ],
      },
    ],
    storageBuckets: [{ name: 'report-exports', maxSizeMb: 20, allowedMimes: ['text/csv', 'application/pdf'] }],
  },
  apis: {
    endpoints: [
      { id: 'get-pulse', method: 'GET', path: '/api/v1/workspaces/:workspaceId/pulse', authRole: 'member', requestShape: 'Query: from, to, groupBy?', responseShape: 'PulseSummary { totals, series, generatedAt }' },
      { id: 'post-event', method: 'POST', path: '/api/v1/workspaces/:workspaceId/events', authRole: 'member', requestShape: 'CreateEvent { eventType, payload }', responseShape: 'Event { id, eventType, createdAt }' },
    ],
    webhooks: [{ provider: 'GitHub', event: 'pull_request.closed', path: '/api/v1/webhooks/github' }],
    backgroundJobs: [{ name: 'weekly-pulse-digest', schedule: '0 9 * * MON', purpose: 'Prepare and send each workspace weekly pulse summary.' }],
  },
  designTokens: {
    presetId: 'precision-drafting', themePolarity: 'dark',
    colors: { canvas: '#0C0D0E', panel: '#121316', primary: '#F2F0EB', accent: '#FF4F00', blueprint: '#2B7FFF' },
    typography: { heading: 'Space Grotesk', body: 'Plus Jakarta Sans', mono: 'JetBrains Mono', scale: ['10px', '12px', '14px', '18px', '28px'] },
    geometry: { borderRadius: [0, 2], borderWidth: 1, gridSize: 16 },
    bannedPatterns: ['purple gradients', 'ambient blur blobs', 'floating shadow cards', 'spring animations'],
  },
  uiStateMachines: [
    { id: 'workspace-load', name: 'Workspace load', states: ['idle', 'loading', 'ready', 'empty', 'error'], transitions: [{ from: 'idle', event: 'OPEN', to: 'loading' }, { from: 'loading', event: 'RESOLVED', to: 'ready' }, { from: 'loading', event: 'NO_DATA', to: 'empty' }, { from: 'loading', event: 'FAILED', to: 'error' }] },
  ],
  securityRules: [
    { id: 'workspace-boundary', name: 'Workspace data boundary', target: 'workspaces and events', condition: 'Allow access only to authenticated workspace members; writes require owner or member permissions.' },
    { id: 'secret-env', name: 'Server-only credentials', target: 'SUPABASE_SERVICE_ROLE_KEY', condition: 'Keep in server runtime secrets; never serialize into client bundles or exported public config.' },
  ],
  buildPlaybook: [
    { id: 'step-data', order: 1, title: 'Establish schema and access rules', instructions: 'Create users, workspaces, and events with indexes and member-scoped row-level security.', dependsOn: [] },
    { id: 'step-api', order: 2, title: 'Implement pulse and event APIs', instructions: 'Validate payloads, enforce workspace membership, and return stable response contracts.', dependsOn: ['step-data'] },
    { id: 'step-ui', order: 3, title: 'Build the weekly pulse workbench', instructions: 'Render loading, empty, error, and overflow states with accessible keyboard navigation.', dependsOn: ['step-api'] },
  ],
}

interface SpecStore {
  project: ProjectSpec
  hydrated: boolean
  saveStatus: 'loading' | 'saving' | 'saved' | 'offline'
  activeStep: number
  compilerTab: CompiledFileName
  hydrate: () => Promise<void>
  updateProject: (updater: (project: ProjectSpec) => ProjectSpec) => void
  setActiveStep: (step: number) => void
  setCompilerTab: (tab: SpecStore['compilerTab']) => void
}

let saveQueue = Promise.resolve()
let saveRevision = 0

export const useSpecStore = create<SpecStore>((set, get) => ({
  project: DEFAULT_PROJECT,
  hydrated: false,
  saveStatus: 'loading',
  activeStep: 2,
  compilerTab: 'ARCHITECTURE.md',
  hydrate: async () => {
    if (get().hydrated) return
    try {
      const stored = await plumbDb.projects.get(DEFAULT_PROJECT.id)
      const project = stored?.spec ?? DEFAULT_PROJECT
      if (!stored) await plumbDb.projects.put({ id: project.id, spec: project, savedAt: new Date().toISOString() })
      set({ project, hydrated: true, saveStatus: 'saved' })
    } catch {
      // IndexedDB can be unavailable in private browsing; the starter spec remains usable in memory.
      set({ hydrated: true, saveStatus: 'offline' })
    }
  },
  updateProject: (updater) => {
    const project = { ...updater(get().project), updatedAt: new Date().toISOString() }
    const revision = ++saveRevision
    set({ project, saveStatus: 'saving' })
    saveQueue = saveQueue
      .catch(() => undefined)
      .then(async () => {
        await plumbDb.projects.put({ id: project.id, spec: project, savedAt: new Date().toISOString() })
        if (revision === saveRevision) set({ saveStatus: 'saved' })
      })
      .catch(() => { if (revision === saveRevision) set({ saveStatus: 'offline' }) })
  },
  setActiveStep: (activeStep) => set({ activeStep }),
  setCompilerTab: (compilerTab) => set({ compilerTab }),
}))
