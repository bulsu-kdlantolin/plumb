export type RouteState = 'loading' | 'empty' | 'error' | 'overflow'
export type EnvScope = 'public' | 'secret'
export type ThemePolarity = 'light' | 'dark'
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

export interface RoleSpec {
  name: string
  permissions: string[]
}

export interface RouteSpec {
  path: string
  authRequired: boolean
  redirectTo?: string
  states: RouteState[]
}

export interface DependencySpec {
  name: string
  version: string
}

export interface EnvVarSpec {
  key: string
  scope: EnvScope
  description: string
}

export interface EntityFieldSpec {
  id: string
  name: string
  type: string
  isPrimary: boolean
  isNullable: boolean
  onDelete?: 'cascade' | 'restrict' | 'set-null' | 'no-action'
  references?: { entity: string; field: string }
}

export interface EntitySpec {
  id: string
  name: string
  position: { x: number; y: number }
  rlsPolicy: string
  indexes: string[]
  fields: EntityFieldSpec[]
}

export interface StorageBucketSpec {
  name: string
  maxSizeMb: number
  allowedMimes: string[]
}

export interface EndpointSpec {
  id: string
  method: HttpMethod
  path: string
  authRole: string
  requestShape: string
  responseShape: string
}

export interface WebhookSpec {
  provider: string
  event: string
  path: string
}

export interface BackgroundJobSpec {
  name: string
  schedule: string
  purpose: string
}

export interface UiTransitionSpec {
  from: string
  event: string
  to: string
}

export interface UiStateMachineSpec {
  id: string
  name: string
  states: string[]
  transitions: UiTransitionSpec[]
}

export interface SecurityRuleSpec {
  id: string
  name: string
  target: string
  condition: string
}

export interface BuildStepSpec {
  id: string
  order: number
  title: string
  instructions: string
  dependsOn: string[]
}

export interface ProjectSpec {
  id: string
  name: string
  description: string
  updatedAt: string
  scope: {
    elevatorPitch: string
    targetUser: string
    coreLoopSteps: string[]
    roles: RoleSpec[]
    routes: RouteSpec[]
    nonGoals: string[]
  }
  stack: {
    architecturePattern: string
    frontend: string
    backend: string
    database: string
    authStrategy: string
    stateManagement: string
    folderStructure: string[]
    dependencies: { runtime: DependencySpec[]; dev: DependencySpec[] }
    envVars: EnvVarSpec[]
  }
  data: {
    entities: EntitySpec[]
    storageBuckets: StorageBucketSpec[]
  }
  apis: {
    endpoints: EndpointSpec[]
    webhooks: WebhookSpec[]
    backgroundJobs: BackgroundJobSpec[]
  }
  designTokens: {
    presetId: string
    themePolarity: ThemePolarity
    colors: Record<string, string>
    typography: { heading: string; body: string; mono: string; scale: string[] }
    geometry: { borderRadius: number[]; borderWidth: number; gridSize: number }
    bannedPatterns: string[]
  }
  uiStateMachines: UiStateMachineSpec[]
  securityRules: SecurityRuleSpec[]
  buildPlaybook: BuildStepSpec[]
}

export interface LinterDiagnostic {
  code: string
  severity: 'error' | 'warning' | 'info'
  stepIndex: number
  message: string
  fixLabel: string
}
