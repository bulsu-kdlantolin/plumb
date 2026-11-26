import type { ProjectSpec } from '../../types/spec.types'

export type AgentInstructionFiles = { 'AGENTS.md': string; '.cursorrules': string; 'CLAUDE.md': string }

export function compileAgentsMd(project: ProjectSpec): AgentInstructionFiles {
  const projectRules = [
    `# ${project.name} — Agent Instructions`,
    '',
    `> ${project.scope.elevatorPitch}`,
    '',
    '## Product and audience',
    project.scope.targetUser,
    '',
    '## Stack',
    `- Architecture: ${project.stack.architecturePattern}`,
    `- Frontend: ${project.stack.frontend}`,
    `- Backend: ${project.stack.backend}`,
    `- Database: ${project.stack.database}`,
    `- Authentication: ${project.stack.authStrategy}`,
    `- State: ${project.stack.stateManagement}`,
    '',
    '## Engineering constraints',
    '- Preserve the architecture and conventions listed in this bundle.',
    '- Keep secrets out of browser code, generated client artifacts, and committed environment files.',
    '- Enforce the declared authorization policy at every data boundary.',
    ...project.securityRules.map((rule) => `- Security rule — ${rule.name || 'Unnamed'} (${rule.target || 'target TBD'}): ${rule.condition || 'condition TBD.'}`),
    '- Implement loading, empty, error, and overflow states for routes where applicable.',
    '- Keep changes scoped to the requested task and update relevant documentation.',
    '',
    '## Explicit non-goals',
    ...project.scope.nonGoals.map((goal) => `- ${goal}`),
    '',
    '## Build sequence',
    ...[...project.buildPlaybook].sort((a, b) => a.order - b.order).map((step) => `${step.order}. **${step.title}** — ${step.instructions}`),
    '',
    '## Acceptance',
    '- Run the project build and relevant automated checks.',
    '- Confirm generated output matches the architecture and security rules in this bundle.',
  ].join('\n')
  return { 'AGENTS.md': projectRules, '.cursorrules': projectRules, 'CLAUDE.md': projectRules }
}
