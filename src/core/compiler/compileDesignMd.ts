import type { ProjectSpec } from '../../types/spec.types'

export function compileDesignMd(project: ProjectSpec): string {
  const { designTokens: tokens } = project
  const colors = Object.entries(tokens.colors).map(([name, value]) => `| ${name} | \`${value}\` |`).join('\n')
  return [
    `# ${project.name} — Design System`, '', '## Direction', `Preset: **${tokens.presetId}** · polarity: **${tokens.themePolarity}**`, '', '## Color tokens', '| Token | Value |', '| --- | --- |', colors || '| None defined | — |', '', '## Typography', `- Heading: ${tokens.typography.heading}`, `- Body: ${tokens.typography.body}`, `- Monospace: ${tokens.typography.mono}`, `- Scale: ${tokens.typography.scale.join(' / ')}`, '', '## Geometry', `- Border radii: ${tokens.geometry.borderRadius.map((v) => `${v}px`).join(', ')}`, `- Border width: ${tokens.geometry.borderWidth}px`, `- Grid density: ${tokens.geometry.gridSize}px`, '', '## Banned UI patterns', ...tokens.bannedPatterns.map((pattern) => `- ${pattern}`), '', '## Structural rules', '- Use exposed hairline borders to define work areas.', '- Keep controls keyboard accessible with a visible focus state.', '- Keep interface copy specific to the product and its users.', '',
  ].join('\n')
}
