import { AESTHETIC_PRESETS } from '../../core/presets/aestheticPresets'
import type { ProjectSpec } from '../../types/spec.types'

interface Props { project: ProjectSpec; onChange: (project: ProjectSpec) => void }
export function Step4DesignForm({ project, onChange }: Props) {
  const tokens = project.designTokens
  const set = (next: ProjectSpec['designTokens']) => onChange({ ...project, designTokens: next })
  return <div className="step-editor">
    <div className="editor-title">Design system<span> LAYERS 05—08</span></div>
    <label className="editor-field"><span>LOAD AESTHETIC PRESET</span><select value={tokens.presetId} onChange={(e) => { const preset = AESTHETIC_PRESETS.find((p) => p.id === e.target.value); if (preset) set(structuredClone(preset.tokens)) }}><option value="">Choose preset…</option>{AESTHETIC_PRESETS.map((p) => <option value={p.id} key={p.id}>{p.name}</option>)}</select></label>
    <div className="preset-note">{AESTHETIC_PRESETS.find((p) => p.id === tokens.presetId)?.summary ?? 'Custom token set'}</div>
    <section className="editor-section"><div className="editor-section-title">COLOR TOKENS</div>{Object.entries(tokens.colors).map(([key, value]) => <label className="editor-row color-editor" key={key}><span>{key.toUpperCase()}</span><input type="color" aria-label={`${key} color`} value={/^#[0-9A-Fa-f]{6}$/.test(value) ? value : '#000000'} onChange={(e) => set({ ...tokens, colors: { ...tokens.colors, [key]: e.target.value } })} /><input aria-label={`${key} hex value`} value={value} onChange={(e) => set({ ...tokens, colors: { ...tokens.colors, [key]: e.target.value } })} /></label>)}</section>
    <section className="editor-section"><div className="editor-section-title">TYPE & GEOMETRY</div>{(['heading', 'body', 'mono'] as const).map((key) => <label className="editor-field" key={key}><span>{key.toUpperCase()} FONT</span><input value={tokens.typography[key]} onChange={(e) => set({ ...tokens, typography: { ...tokens.typography, [key]: e.target.value } })} /></label>)}<label className="editor-field"><span>BORDER RADIUS · PX (COMMA SEPARATED)</span><input value={tokens.geometry.borderRadius.join(', ')} onChange={(e) => set({ ...tokens, geometry: { ...tokens.geometry, borderRadius: e.target.value.split(',').map(Number).filter(Number.isFinite) } })} /></label><label className="editor-field"><span>BORDER WIDTH · PX</span><input type="number" min="0" max="4" value={tokens.geometry.borderWidth} onChange={(e) => set({ ...tokens, geometry: { ...tokens.geometry, borderWidth: Number(e.target.value) } })} /></label></section>
    <section className="editor-section"><div className="editor-section-title">BANNED UI PATTERNS</div><div className="guardrail-list">{tokens.bannedPatterns.map((pattern, i) => <div className="guardrail-row" key={`${pattern}-${i}`}><span className="guardrail-mark">BLOCK</span><span>{pattern}</span></div>)}</div><div className="preset-note">Preset guardrails stay attached when colors and typography are customized.</div></section>
  </div>
}
