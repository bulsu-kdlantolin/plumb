import type { ProjectSpec } from '../../types/spec.types'
import { compileAgentsMd } from './compileAgentsMd'
import { compileApiSpec } from './compileApiSpec'
import { compileArchitecture, compileEnvExample } from './compileArchitecture'
import { compileDesignMd } from './compileDesignMd'
import { compilePlaybook } from './compilePlaybook'
import { compileSchemaSql } from './compileSchemaSql'

export type CompiledFileName = 'AGENTS.md' | '.cursorrules' | 'CLAUDE.md' | 'ARCHITECTURE.md' | 'DESIGN.md' | 'SCHEMA.sql' | 'API_SPEC.md' | 'PROMPT_PLAYBOOK.md' | '.env.example' | 'package.json' | 'requirements.txt'
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
  return {
    ...compileAgentsMd(project),
    'ARCHITECTURE.md': compileArchitecture(project),
    'DESIGN.md': compileDesignMd(project),
    'SCHEMA.sql': compileSchemaSql(project),
    'API_SPEC.md': compileApiSpec(project),
    'PROMPT_PLAYBOOK.md': compilePlaybook(project),
    '.env.example': compileEnvExample(project),
    ...manifestFiles(project),
  }
}

export function projectSlug(project: ProjectSpec): string { return slugify(project.name) }
