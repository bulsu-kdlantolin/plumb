import type { ProjectSpec } from '../../types/spec.types'
import { compileAgentsMd } from './compileAgentsMd'
import { compileApiSpec } from './compileApiSpec'
import { compileArchitecture, compileEnvExample } from './compileArchitecture'
import { compileDesignMd } from './compileDesignMd'
import { compilePlaybook } from './compilePlaybook'
import { compileSchemaSql } from './compileSchemaSql'

export type CompiledFileName = 'AGENTS.md' | '.cursorrules' | 'CLAUDE.md' | 'ARCHITECTURE.md' | 'DESIGN.md' | 'SCHEMA.sql' | 'API_SPEC.md' | 'PROMPT_PLAYBOOK.md' | 'AI_HANDOFF.md' | 'RESOURCE_LINKS.md' | '.env.example' | 'package.json' | 'requirements.txt'
export type CompiledFiles = Record<CompiledFileName, string>

const pythonNames = new Set(['fastapi', 'sqlalchemy', 'psycopg', 'psycopg2', 'pytest', 'ruff', 'uvicorn', 'pydantic', 'django', 'flask'])
const slugify = (value: string) => value.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'project'

function manifestFiles(project: ProjectSpec): Pick<CompiledFiles, 'package.json' | 'requirements.txt'> {
  const allDeps = [...project.stack.dependencies.runtime, ...project.stack.dependencies.dev]
  const backendIsPython = /python|fastapi|django|flask/i.test(project.stack.backend)
  const jsDeps = allDeps.filter((dependency) => !pythonNames.has(dependency.name.toLowerCase()))
  const pyDeps = allDeps.filter((dependency) => pythonNames.has(dependency.name.toLowerCase()))
  const hasJs = jsDeps.length > 0 || /react|next|vite|node/i.test(project.stack.frontend)
  const hasPython = backendIsPython || pyDeps.length > 0
  const packageJson = hasJs ? JSON.stringify({ name: slugify(project.name), private: true, type: 'module', scripts: { dev: 'vite', build: 'tsc -b && vite build' }, dependencies: Object.fromEntries(project.stack.dependencies.runtime.filter((dep) => !pythonNames.has(dep.name.toLowerCase())).map((dep) => [dep.name, dep.version])), devDependencies: Object.fromEntries(project.stack.dependencies.dev.filter((dep) => !pythonNames.has(dep.name.toLowerCase())).map((dep) => [dep.name, dep.version])) }, null, 2) + '\n' : '# Not applicable: selected stack has no JavaScript runtime dependencies.\n'
  const requirements = hasPython ? [...pyDeps.map((dependency) => `${dependency.name}==${dependency.version.replace(/^[~^=]+/, '')}`), ...(backendIsPython && pyDeps.length === 0 ? ['fastapi', 'uvicorn', 'sqlalchemy', 'psycopg[binary]'] : [])].sort().join('\n') + '\n' : '# Not applicable: selected stack has no Python runtime dependencies.\n'
  return { 'package.json': packageJson, 'requirements.txt': requirements }
}

export function compileProject(project: ProjectSpec): CompiledFiles {
  const incomplete = [
    !project.scope.elevatorPitch.trim() && !project.description.trim() ? 'Product idea' : '',
    project.scope.roles.length === 0 ? 'Roles and permissions' : '',
    project.scope.routes.length === 0 ? 'Route map and UI states' : '',
    !project.stack.frontend && !project.stack.backend && !project.stack.database ? 'Technology choices' : '',
    project.data.entities.length === 0 ? 'Data model' : '',
    project.securityRules.length === 0 ? 'Security rules' : '',
    project.uiStateMachines.length === 0 ? 'UI state machines' : '',
    project.buildPlaybook.length === 0 ? 'Build playbook' : '',
  ].filter(Boolean)
  const handoff = `# AI Coding Agent Handoff — ${project.name || 'Untitled plan'}\n\nBuild the product described in this context bundle. Read AGENTS.md, ARCHITECTURE.md, DESIGN.md, SCHEMA.sql, API_SPEC.md, and PROMPT_PLAYBOOK.md first. Follow their constraints and sequencing.\n\n## Product idea\n${project.description.trim() || project.scope.elevatorPitch.trim() || 'Not specified yet.'}\n\n## Working agreement\n- Treat this plan as the source of truth; do not invent missing product requirements, credentials, or data.\n- If a missing decision blocks implementation, ask a concise question and continue with independent work.\n- Keep secrets out of client code and commits.\n- Implement one playbook phase at a time and report changed files and verification.\n\n## Still to define\n${incomplete.length ? incomplete.map((item) => `- ${item}`).join('\n') : '- No major planning gaps detected; confirm details while implementing.'}\n\nThe plan may be incomplete. Use the explicit gaps above as open questions, not as permission to fabricate answers.\n`
  const resourceLinks = `# Project Resources\n\n${project.resources?.length ? project.resources.map((resource) => `## ${resource.label || 'Untitled resource'}\n${resource.url || 'URL not provided'}\n\n${resource.notes || 'No notes.'}`).join('\n\n') : 'No external resources have been added.'}\n`
  return {
    ...compileAgentsMd(project),
    'ARCHITECTURE.md': compileArchitecture(project),
    'DESIGN.md': compileDesignMd(project),
    'SCHEMA.sql': compileSchemaSql(project),
    'API_SPEC.md': compileApiSpec(project),
    'PROMPT_PLAYBOOK.md': compilePlaybook(project),
    'AI_HANDOFF.md': handoff,
    'RESOURCE_LINKS.md': resourceLinks,
    '.env.example': compileEnvExample(project),
    ...manifestFiles(project),
  }
}

export function projectSlug(project: ProjectSpec): string { return slugify(project.name) }
