import type { ProjectSpec } from '../../types/spec.types'

export function compileApiSpec(project: ProjectSpec): string {
  const endpoints = project.apis.endpoints.map((endpoint) => [
    `### ${endpoint.method} ${endpoint.path}`, '', `**Authorization:** ${endpoint.authRole || 'Public'}`, '', '**Request**', '```text', endpoint.requestShape || 'No request body.', '```', '', '**Response**', '```text', endpoint.responseShape || 'No response shape specified.', '```',
  ].join('\n')).join('\n\n')
  const webhooks = project.apis.webhooks.map((hook) => `- **${hook.provider}** · \`${hook.event}\` → \`${hook.path}\``).join('\n')
  const jobs = project.apis.backgroundJobs.map((job) => `- **${job.name}** · \`${job.schedule}\` — ${job.purpose}`).join('\n')
  const states = project.scope.routes.map((route) => `- \`${route.path}\`: ${route.states.length ? route.states.join(', ') : 'No UI states specified.'}`).join('\n')
  const machines = project.uiStateMachines.map((machine) => `### ${machine.name || 'Untitled state machine'}\nStates: ${machine.states.join(', ') || 'Not specified.'}\n\n${machine.transitions.length ? machine.transitions.map((transition) => `- ${transition.from || '?'} — ${transition.event || '?'} → ${transition.to || '?'}`).join('\n') : 'No transitions specified.'}`).join('\n\n')
  const rules = project.securityRules.map((rule) => `- **${rule.name || 'Unnamed rule'}** · ${rule.target || 'Target not specified'}: ${rule.condition || 'Condition not specified.'}`).join('\n')
  return [`# ${project.name || 'Untitled plan'} — API Specification`, '', '## Endpoints', endpoints || 'No endpoints defined yet.', '', '## Error contract', '- Return a stable JSON envelope: `{ "error": { "code": "UPPER_SNAKE_CASE", "message": "Human-readable summary", "requestId": "..." } }`.', '- Use 4xx for invalid requests or denied access, 5xx for unexpected server failures.', '- Never return stack traces, credentials, or internal policy details to clients.', '', '## Webhooks', webhooks || 'No webhooks defined yet.', '', '## Background jobs', jobs || 'No background jobs defined yet.', '', '## Required route states', states || 'No routes defined yet.', '', '## UI state machines', machines || 'No explicit UI state machines defined yet.', '', '## Security', `Authentication strategy: ${project.stack.authStrategy || 'Not specified yet.'}.`, 'Validate authorization against the requested resource on every protected operation.', rules || 'No additional security rules specified yet.', ''].join('\n')
}
