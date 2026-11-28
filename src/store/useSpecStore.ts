import { create } from 'zustand'
import { plumbDb } from '../db/dexie'
import type { ProjectSpec } from '../types/spec.types'
import type { CompiledFileName } from '../core/compiler/compileProject'

export const PULSEBOARD_EXAMPLE: ProjectSpec = {
  id: 'pulseboard',
  name: 'PulseBoard - Team Metrics Studio',
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
    nonGoals: ['No employee surveillance or individual productivity scoring.', 'No public social feed or gamified leaderboards.', "No replacement for the team's source-of-truth issue tracker."],
  },
  stack: {
    architecturePattern: 'Local-first modular monolith',
    frontend: 'React 19 + TypeScript + Vite',
    backend: 'Supabase Edge Functions',
    database: 'PostgreSQL 16',
    authStrategy: 'Supabase Auth - email magic link',
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
    presetId: 'carbon-drafting-slate', themePolarity: 'dark',
    colors: { canvas: '#0A0808', panel: '#110D0D', surface: '#181212', elevated: '#221919', primary: '#F0EAE6', secondary: '#A89B96', accent: '#CD412B', blueprint: '#4B83A6' },
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
  resources: [],
}

interface SpecStore {
  project: ProjectSpec | null
  projects: ProjectSpec[]
  hydrated: boolean
  saveStatus: 'loading' | 'saving' | 'saved' | 'offline'
  activeStep: number
  compilerTab: CompiledFileName
  hydrate: () => Promise<void>
  createProject: (name: string, description: string, fromExample?: boolean) => Promise<void>
  selectProject: (id: string | null) => Promise<void>
  renameProject: (id: string, name: string) => Promise<void>
  duplicateProject: (id: string) => Promise<void>
  deleteProject: (id: string) => Promise<void>
  updateProject: (updater: (project: ProjectSpec) => ProjectSpec) => void
  setActiveStep: (step: number) => void
  setCompilerTab: (tab: SpecStore['compilerTab']) => void
}

let saveQueue = Promise.resolve()
let saveRevision = 0

export const useSpecStore = create<SpecStore>((set, get) => ({
  project: null,
  projects: [],
  hydrated: false,
  saveStatus: 'loading',
  activeStep: 0,
  compilerTab: 'ARCHITECTURE.md',
  hydrate: async () => {
    if (get().hydrated) return
    try {
      const all = await plumbDb.projects.toArray()
      let activeId = (await plumbDb.settings.get('activeProjectId'))?.value ?? null
      const active = all.find((item) => item.id === activeId && item.kind !== 'example')
      if (!active) activeId = null
      set({ projects: all.filter((item) => item.kind !== 'example').map((item) => item.spec), project: active?.spec ?? null, hydrated: true, saveStatus: 'saved' })
    } catch {
      // IndexedDB can be unavailable in private browsing; the starter spec remains usable in memory.
      set({ hydrated: true, saveStatus: 'offline' })
    }
  },
  createProject: async (name, description, fromExample = false) => {
    const id = crypto.randomUUID()
    let legacyExample
    if (fromExample) {
      try { legacyExample = await plumbDb.projects.get(PULSEBOARD_EXAMPLE.id) } catch { legacyExample = undefined }
    }
    const source = fromExample ? legacyExample?.spec ?? PULSEBOARD_EXAMPLE : null
    const empty = source ? structuredClone(source) : {
      ...structuredClone(PULSEBOARD_EXAMPLE),
      scope: { elevatorPitch: '', targetUser: '', coreLoopSteps: [], roles: [], routes: [], nonGoals: [] },
      stack: { ...structuredClone(PULSEBOARD_EXAMPLE.stack), architecturePattern: '', frontend: '', backend: '', database: '', authStrategy: '', stateManagement: '', folderStructure: [], dependencies: { runtime: [], dev: [] }, envVars: [] },
      data: { entities: [], storageBuckets: [] }, apis: { endpoints: [], webhooks: [], backgroundJobs: [] },
      designTokens: { presetId: '', themePolarity: 'dark' as const, colors: {}, typography: { heading: '', body: '', mono: '', scale: [] }, geometry: { borderRadius: [0, 2], borderWidth: 1, gridSize: 16 }, bannedPatterns: [] },
      uiStateMachines: [], securityRules: [], buildPlaybook: [], resources: [],
    }
    const project = { ...empty, id, name: name.trim(), description: description.trim(), scope: { ...empty.scope, elevatorPitch: description.trim() }, updatedAt: new Date().toISOString() }
    const nextProjects = [...get().projects, project]
    set({ project, projects: nextProjects, activeStep: 0, saveStatus: 'saving' })
    try {
      await plumbDb.projects.put({ id, spec: project, savedAt: new Date().toISOString(), kind: 'project' })
      await plumbDb.settings.put({ key: 'activeProjectId', value: id })
      set({ saveStatus: 'saved' })
    } catch { set({ saveStatus: 'offline' }) }
  },
  selectProject: async (id) => {
    const project = id ? get().projects.find((item) => item.id === id) ?? null : null
    set({ project, activeStep: 0 })
    try {
      if (id) await plumbDb.settings.put({ key: 'activeProjectId', value: id })
      else await plumbDb.settings.delete('activeProjectId')
    } catch { set({ saveStatus: 'offline' }) }
  },
  renameProject: async (id, name) => {
    const projects = get().projects.map((item) => item.id === id ? { ...item, name: name.trim(), updatedAt: new Date().toISOString() } : item)
    set({ projects, project: get().project?.id === id ? projects.find((item) => item.id === id)! : get().project })
    const item = projects.find((entry) => entry.id === id)
    if (item) try { await plumbDb.projects.put({ id, spec: item, kind: 'project', savedAt: new Date().toISOString() }) } catch { set({ saveStatus: 'offline' }) }
  },
  duplicateProject: async (id) => {
    const source = get().projects.find((item) => item.id === id)
    if (!source) return
    const copy = { ...structuredClone(source), id: crypto.randomUUID(), name: `${source.name} copy`, updatedAt: new Date().toISOString() }
    set({ projects: [...get().projects, copy], project: copy, activeStep: 0 })
    try {
      await plumbDb.projects.put({ id: copy.id, spec: copy, kind: 'project', savedAt: new Date().toISOString() })
      await plumbDb.settings.put({ key: 'activeProjectId', value: copy.id })
    } catch { set({ saveStatus: 'offline' }) }
  },
  deleteProject: async (id) => {
    const projects = get().projects.filter((item) => item.id !== id)
    const wasActive = get().project?.id === id
    set({ projects, project: wasActive ? null : get().project })
    try {
      await plumbDb.projects.delete(id)
      if (wasActive) await plumbDb.settings.delete('activeProjectId')
    } catch { set({ saveStatus: 'offline' }) }
  },
  updateProject: (updater) => {
    const current = get().project
    if (!current) return
    const project = { ...updater(current), updatedAt: new Date().toISOString() }
    const revision = ++saveRevision
    set({ project, saveStatus: 'saving' })
    saveQueue = saveQueue
      .catch(() => undefined)
      .then(async () => {
        await plumbDb.projects.put({ id: project.id, spec: project, kind: 'project', savedAt: new Date().toISOString() })
        set({ projects: get().projects.map((item) => item.id === project.id ? project : item) })
        if (revision === saveRevision) set({ saveStatus: 'saved' })
      })
      .catch(() => { if (revision === saveRevision) set({ saveStatus: 'offline' }) })
  },
  setActiveStep: (activeStep) => set({ activeStep }),
  setCompilerTab: (compilerTab) => set({ compilerTab }),
}))
