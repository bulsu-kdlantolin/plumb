import type { CSSProperties } from 'react'
import { Activity, ArrowUpRight, CircleHelp, Ellipsis, Gauge, Users } from 'lucide-react'
import type { ProjectSpec } from '../../types/spec.types'

interface Props { project: ProjectSpec }
type PreviewStyle = CSSProperties & Record<`--preview-${string}`, string | number>

export function DesignPreviewCard({ project }: Props) {
  const tokens = project.designTokens
  const style: PreviewStyle = {
    '--preview-bg': tokens.colors.canvas ?? '#0C0D0E', '--preview-panel': tokens.colors.panel ?? '#121316', '--preview-surface': tokens.colors.surface ?? '#181A1E',
    '--preview-primary': tokens.colors.primary ?? '#F2F0EB', '--preview-secondary': tokens.colors.secondary ?? '#A0A5B1', '--preview-accent': tokens.colors.accent ?? '#FF4F00',
    '--preview-blueprint': tokens.colors.blueprint ?? '#2B7FFF', '--preview-radius': `${tokens.geometry.borderRadius[1] ?? tokens.geometry.borderRadius[0] ?? 0}px`, '--preview-grid': `${Math.max(8, Math.min(48, tokens.geometry.gridSize))}px`,
    '--preview-heading': tokens.typography.heading, '--preview-body': tokens.typography.body, '--preview-mono': tokens.typography.mono,
    color: 'var(--preview-primary)', background: 'var(--preview-bg)',
  }
  return <section className="design-preview" style={style} aria-label="Live UI token preview">
    <header className="preview-top"><span className="preview-brand"><span className="preview-mark"><Activity size={13} /></span>pulseboard</span><span className="preview-user">ACME / ENG</span><Ellipsis size={16} /></header>
    <div className="preview-body">
      <div className="preview-welcome"><div><span className="preview-kicker">WEEKLY PULSE / W24</span><h2>Team overview</h2><p>Signals from your workspace this week.</p></div><button className="preview-action">EXPORT <ArrowUpRight size={12} /></button></div>
      <div className="preview-metrics">
        <article><span>ACTIVE MEMBERS</span><strong><Users size={14} /> 18</strong><small>+2 this week</small></article>
        <article><span>DELIVERY PULSE</span><strong><Gauge size={14} /> 84<span className="preview-unit">/100</span></strong><small>Steady cadence</small></article>
        <article><span>EVENTS TRACKED</span><strong><Activity size={14} /> 246</strong><small>Across 4 projects</small></article>
      </div>
      <div className="preview-panel"><div className="preview-panel-head"><div><strong>Weekly activity</strong><span>Mon — Sun · events per day</span></div><CircleHelp size={14} /></div><div className="preview-chart">{[34, 55, 44, 72, 61, 88, 68, 100, 77, 91, 63, 80, 56, 72, 48, 62, 38, 58, 34, 48, 28, 42, 25, 35].map((height, i) => <span key={i} style={{ height: `${height}%` }} />)}</div><div className="preview-days"><span>MON</span><span>TUE</span><span>WED</span><span>THU</span><span>FRI</span><span>SAT</span><span>SUN</span></div></div>
      <div className="preview-bottom"><span><i /> LIVE PREVIEW · {tokens.presetId.toUpperCase()}</span><span>GRID {tokens.geometry.gridSize}px</span></div>
    </div>
  </section>
}
