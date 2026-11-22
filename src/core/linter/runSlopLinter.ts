import type { LinterDiagnostic, ProjectSpec } from '../../types/spec.types'

export interface LinterResult {
  alignmentScore: number
  diagnostics: LinterDiagnostic[]
}

const hexColors = (project: ProjectSpec) => Object.values(project.designTokens.colors).filter((value) => /^#[0-9a-f]{6}$/i.test(value))
const isSlopColor = (hex: string) => {
  const value = hex.toLowerCase()
  if (value === '#6366f1' || value === '#8b5cf6') return true
  const r = Number.parseInt(value.slice(1, 3), 16) / 255
  const g = Number.parseInt(value.slice(3, 5), 16) / 255
  const b = Number.parseInt(value.slice(5, 7), 16) / 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const delta = max - min
  let hue = 0
  if (delta) {
    if (max === r) hue = ((g - b) / delta) % 6
    else if (max === g) hue = (b - r) / delta + 2
    else hue = (r - g) / delta + 4
    hue *= 60
    if (hue < 0) hue += 360
  }
  return hue >= 235 && hue <= 285 && delta > 0.18
}

export function runSlopLinter(project: ProjectSpec): LinterResult {
  const diagnostics: LinterDiagnostic[] = []
  const add = (diagnostic: LinterDiagnostic) => diagnostics.push(diagnostic)
  if (!project.scope.nonGoals.some((goal) => goal.trim())) add({ code: 'SCOPE_NON_GOALS', severity: 'error', stepIndex: 0, message: 'No explicit non-goals are defined; scope boundaries cannot be checked.', fixLabel: 'Add non-goals' })
  const authEnabled = project.scope.routes.some((route) => route.authRequired) || /auth|oauth|oidc|jwt|session/i.test(project.stack.authStrategy)
  if (authEnabled && !project.data.entities.some((entity) => entity.name.toLowerCase() === 'users')) add({ code: 'AUTH_USERS_TABLE', severity: 'error', stepIndex: 2, message: 'Authentication is enabled, but the schema has no users table.', fixLabel: 'Add users entity' })
  const referencedEntities = new Set(project.data.entities.flatMap((entity) => entity.fields.flatMap((field) => field.references ? [field.references.entity.toLowerCase()] : [])))
  for (const entity of project.data.entities) {
    const hasRefs = entity.fields.some((field) => field.references)
    const isReferenced = referencedEntities.has(entity.name.toLowerCase())
    if (project.data.entities.length > 1 && !hasRefs && !isReferenced && entity.name.toLowerCase() !== 'users') add({ code: 'DATA_ORPHAN_ENTITY', severity: 'warning', stepIndex: 2, message: `Entity “${entity.name}” has no relationships to other entities.`, fixLabel: 'Review entity links' })
  }
  for (const route of project.scope.routes) {
    const missing = ['empty', 'error'].filter((state) => !route.states.includes(state as 'empty' | 'error'))
    if (missing.length) add({ code: 'ROUTE_RECOVERY_STATES', severity: 'warning', stepIndex: 0, message: `Route ${route.path} is missing ${missing.join(' and ')} state${missing.length === 1 ? '' : 's'}.`, fixLabel: 'Define route states' })
  }
  const offenders = [...new Set(hexColors(project).filter(isSlopColor))]
  if (offenders.length) add({ code: 'DESIGN_SLOP_PALETTE', severity: 'warning', stepIndex: 3, message: `Palette contains generic indigo/violet colors: ${offenders.join(', ')}.`, fixLabel: 'Review design palette' })
  const deductions = diagnostics.reduce((score, diagnostic) => score + (diagnostic.severity === 'error' ? 20 : diagnostic.severity === 'warning' ? 10 : 3), 0)
  return { alignmentScore: Math.max(0, Math.min(100, 100 - deductions)), diagnostics }
}
