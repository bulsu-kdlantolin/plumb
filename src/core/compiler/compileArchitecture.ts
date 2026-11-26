import type { ProjectSpec } from '../../types/spec.types'

export function compileEnvExample(project: ProjectSpec): string {
  return project.stack.envVars.length ? project.stack.envVars.map((env) => `# ${env.description}\n${env.key}=${env.scope === 'secret' ? '<set-in-secret-manager>' : ''}`).join('\n\n') + '\n' : '# No environment variables have been specified yet.\n'
}

export function compileArchitecture(project: ProjectSpec): string {
  const roles = project.scope.roles.map((role) => `| ${role.name} | ${role.permissions.join(', ')} |`).join('\n')
  const routes = project.scope.routes.map((route) => `| \`${route.path}\` | ${route.authRequired ? 'Required' : 'Public'} | ${route.redirectTo ?? '—'} | ${route.states.join(', ')} |`).join('\n')
  const dependencies = [...project.stack.dependencies.runtime.map((d) => ({ ...d, group: 'runtime' })), ...project.stack.dependencies.dev.map((d) => ({ ...d, group: 'development' }))]
  const manifest = dependencies.map((d) => `| \`${d.name}\` | \`${d.version}\` | ${d.group} |`).join('\n')
  const buckets = project.data.storageBuckets.map((bucket) => `| ${bucket.name || 'Unnamed'} | ${bucket.maxSizeMb || 'Not specified'} | ${bucket.allowedMimes.join(', ') || 'Not specified'} |`).join('\n')
  const security = project.securityRules.map((rule) => `- **${rule.name || 'Unnamed rule'}** (${rule.target || 'Target not specified'}): ${rule.condition || 'Condition not specified.'}`).join('\n')
  return [
    `# ${project.name || 'Untitled plan'} — Architecture`, '', project.description || 'Product idea not specified yet.', '', '## Scope', project.scope.elevatorPitch || 'Not specified yet.', '', `**Target user:** ${project.scope.targetUser || 'Not specified yet.'}`, '', '### Core loop', ...(project.scope.coreLoopSteps.length ? project.scope.coreLoopSteps.map((step, i) => `${i + 1}. ${step}`) : ['Not specified yet.']), '', '## Roles', '| Role | Permissions |', '| --- | --- |', roles || '| Not specified yet | — |', '', '## Route map', '| Path | Authentication | Redirect | Required UI states |', '| --- | --- | --- | --- |', routes || '| Not specified yet | — | — | — |', '', '## Stack', `- Architecture: ${project.stack.architecturePattern || 'Not specified yet.'}`, `- Frontend: ${project.stack.frontend || 'Not specified yet.'}`, `- Backend: ${project.stack.backend || 'Not specified yet.'}`, `- Database: ${project.stack.database || 'Not specified yet.'}`, `- Authentication: ${project.stack.authStrategy || 'Not specified yet.'}`, `- State management: ${project.stack.stateManagement || 'Not specified yet.'}`, '', '## Folder tree', '```text', ...(project.stack.folderStructure.length ? project.stack.folderStructure.map((path) => `- ${path}`) : ['Not specified yet.']), '```', '', '## Storage buckets', '| Name | Max size (MB) | Allowed MIME types |', '| --- | --- | --- |', buckets || '| None specified | — | — |', '', '## Security rules', security || 'No system-wide security rules specified yet.', '', '## Non-goals', ...(project.scope.nonGoals.length ? project.scope.nonGoals.map((goal) => `- ${goal}`) : ['Not specified yet.']), '', '## Environment', 'See the bundled `.env.example`. Secret values belong in a server-side secret manager.', '', '## Dependency manifest', '| Package | Version | Group |', '| --- | --- | --- |', manifest || '| None specified | — | — |', '',
  ].join('\n')
}
