import type { ProjectSpec } from '../../types/spec.types'

const phases = [
  ['Phase 1 — Foundation', 'Set up the selected stack, folder structure, environment configuration, and project conventions.'],
  ['Phase 2 — Data and access', 'Implement the schema, indexes, foreign keys, and row-level security policies.'],
  ['Phase 3 — API contracts', 'Implement and validate endpoints, webhook handlers, and scheduled jobs against the API specification.'],
  ['Phase 4 — Product interface', 'Build routes, roles, UI states, and design tokens for the target users and core loop.'],
  ['Phase 5 — Production hardening', 'Review authorization boundaries, secrets, failure recovery, performance, accessibility, and operational logging.'],
  ['Phase 6 — Release verification', 'Run migrations and acceptance smoke tests in a staging environment, document rollback steps, then prepare deployment and handoff.'],
]

export function compilePlaybook(project: ProjectSpec): string {
  const steps = [...project.buildPlaybook].sort((a, b) => a.order - b.order).map((step) => `- [ ] **${step.order}. ${step.title}** — ${step.instructions}${step.dependsOn.length ? ` (Depends on: ${step.dependsOn.join(', ')})` : ''}`).join('\n')
  return [
    `# ${project.name} — Prompt Playbook`, '', 'Use one phase prompt at a time. Keep completed work, decisions, and verification output available to the next phase.', '', `## Project brief\n${project.scope.elevatorPitch}\n\nTarget user: ${project.scope.targetUser}`, '', ...phases.flatMap(([title, intent], index) => [
      `## ${title}`, '', `> Implement Phase ${index + 1} for ${project.name}. ${intent}`, '', 'Use the bundled `AGENTS.md`, `ARCHITECTURE.md`, `DESIGN.md`, `SCHEMA.sql`, and `API_SPEC.md` as the source of truth. Preserve explicit non-goals and report conflicts before changing architecture.', '', '### Acceptance smoke tests', '- [ ] Application builds and starts using the documented commands.', '- [ ] Core user flow works with the declared roles and route authorization.', '- [ ] Loading, empty, error, and overflow states behave as specified.', '- [ ] Data access and secret handling match the schema and security rules.', '- [ ] No console errors or broken navigation in the changed flow.', '',
    ]), '## Ordered project tasks', steps || 'No project-specific build steps defined.', '', '## Explicit non-goals', ...project.scope.nonGoals.map((goal) => `- ${goal}`), '',
  ].join('\n')
}
