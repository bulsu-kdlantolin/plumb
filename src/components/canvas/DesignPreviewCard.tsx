import type { CSSProperties } from 'react'
import { Pulse, ArrowUpRight, Question, DotsThree, Gauge, Users } from '@phosphor-icons/react'
import { AESTHETIC_PRESETS } from '../../core/presets/aestheticPresets'
import type { ProjectSpec } from '../../types/spec.types'

interface Props { project: ProjectSpec }
type PreviewStyle = CSSProperties & Record<`--preview-${string}`, string | number>

function readableTextOn(color: string) {
  const match = /^#([\da-f]{6})$/i.exec(color)
  if (!match) return '#0A0808'

  const channels = [0, 2, 4].map((start) => parseInt(match[1].slice(start, start + 2), 16) / 255)
  const linear = channels.map((channel) => channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4)
  const luminance = 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2]
  const whiteContrast = 1.05 / (luminance + 0.05)
  const inkLuminance = 0.0027
  const inkContrast = (luminance + 0.05) / (inkLuminance + 0.05)
  return whiteContrast >= inkContrast ? '#ffffff' : '#0A0808'
}

export function DesignPreviewCard({ project }: Props) {
  const tokens = project.designTokens
  const presetName = AESTHETIC_PRESETS.find((preset) => preset.id === tokens.presetId)?.name ?? tokens.presetId.replaceAll('-', ' ')
  const previewAccent = tokens.colors.accent ?? '#CD412B'
  const style: PreviewStyle = {
    '--preview-bg': tokens.colors.canvas ?? '#0A0808', '--preview-panel': tokens.colors.panel ?? '#110D0D', '--preview-surface': tokens.colors.surface ?? '#181212',
    '--preview-primary': tokens.colors.primary ?? '#F0EAE6', '--preview-secondary': tokens.colors.secondary ?? '#A89B96', '--preview-accent': previewAccent, '--preview-accent-text': readableTextOn(previewAccent),
    '--preview-blueprint': tokens.colors.blueprint ?? '#4B83A6', '--preview-radius': `${tokens.geometry.borderRadius[1] ?? tokens.geometry.borderRadius[0] ?? 0}px`, '--preview-grid': `${Math.max(8, Math.min(48, tokens.geometry.gridSize))}px`,
    '--preview-heading': tokens.typography.heading, '--preview-body': tokens.typography.body, '--preview-mono': tokens.typography.mono,
    color: 'var(--preview-primary)', background: 'var(--preview-bg)',
  }
  return <section className="design-preview" style={style} aria-label="Live UI token preview">
      <header className="preview-top"><span className="preview-brand"><span className="preview-mark"><Pulse size={13} /></span>pulseboard</span><span className="preview-user">Acme / Eng</span><DotsThree size={16} /></header>
    <div className="preview-body">
      <div className="preview-welcome"><div><span className="preview-kicker">Weekly pulse / W24</span><h2>Team overview</h2><p>Signals from your workspace this week.</p></div><span className="preview-action">Export <ArrowUpRight size={12} /></span></div>
      <div className="preview-metrics">
        <article><span>Active members</span><strong><Users size={14} /> 18</strong><small>+2 this week</small></article>
        <article><span>Delivery pulse</span><strong><Gauge size={14} /> 84<span className="preview-unit">/100</span></strong><small>Steady cadence</small></article>
        <article><span>Events tracked</span><strong><Pulse size={14} /> 246</strong><small>Across 4 projects</small></article>
      </div>
      <div className="preview-panel"><div className="preview-panel-head"><div><strong>Weekly activity</strong><span>Mon — Sun · events per day</span></div><Question size={14} /></div><div className="preview-chart">{[34, 55, 44, 72, 61, 88, 68, 100, 77, 91, 63, 80, 56, 72, 48, 62, 38, 58, 34, 48, 28, 42, 25, 35].map((height, i) => <span key={i} style={{ height: `${height}%` }} />)}</div><div className="preview-days"><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span></div></div>
      <div className="preview-bottom"><span><i /> Live preview · {presetName}</span><span>Grid {tokens.geometry.gridSize}px</span></div>
    </div>
  </section>
}
