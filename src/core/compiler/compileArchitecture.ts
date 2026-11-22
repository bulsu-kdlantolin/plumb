import type { ProjectSpec } from '../../types/spec.types'

export function compileEnvExample(project: ProjectSpec): string {
  return project.stack.envVars.map((env) => `# ${env.description}\n${env.key}=${env.scope === 'secret' ? '<set-in-secret-manager>' : ''}`).join('\n\n') + '\n'
}

export function compileArchitecture(project: ProjectSpec): string {
  const roles = project.scope.roles.map((role) => `| ${role.name} | ${role.permissions.join(', ')} |`).join('\n')
  const routes = project.scope.routes.map((route) => `| \`${route.path}\` | ${route.authRequired ? 'Required' : 'Public'} | ${route.redirectTo ?? '—'} | ${route.states.join(', ')} |`).join('\n')
  const dependencies = [...project.stack.dependencies.runtime.map((d) => ({ ...d, group: 'runtime' })), ...project.stack.dependencies.dev.map((d) => ({ ...d, group: 'development' }))]
  const manifest = dependencies.map((d) => `| \`${d.name}\` | \`${d.version}\` | ${d.group} |`).join('\n')
  return [
    `# ${project.name} — Architecture`, '', project.description, '', '## Scope', project.scope.elevatorPitch, '', `**Target user:** ${project.scope.targetUser}`, '', '### Core loop', ...project.scope.coreLoopSteps.map((step, i) => `${i + 1}. ${step}`), '', '## Roles', '| Role | Permissions |', '| --- | --- |', roles || '| None defined | — |', '', '## Route map', '| Path | Authentication | Redirect | Required UI states |', '| --- | --- | --- | --- |', routes || '| None defined | — | — | — |', '', '## Stack', `- Architecture: ${project.stack.architecturePattern}`, `- Frontend: ${project.stack.frontend}`, `- Backend: ${project.stack.backend}`, `- Database: ${project.stack.database}`, `- Authentication: ${project.stack.authStrategy}`, `- State management: ${project.stack.stateManagement}`, '', '## Folder tree', '```text', ...project.stack.folderStructure.map((path) => `- ${path}`), '```', '', '## Non-goals', ...project.scope.nonGoals.map((goal) => `- ${goal}`), '', '## Environment', 'See the bundled `.env.example`. Secret values must be provided through a server-side secret manager.', '', '## Dependency manifest', '| Package | Version | Group |', '| --- | --- | --- |', manifest || '| None specified | — | — |', '',
  ].join('\n')
}
