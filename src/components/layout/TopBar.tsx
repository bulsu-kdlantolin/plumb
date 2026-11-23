import { Command, Download, Moon, Sun } from 'lucide-react'

interface TopBarProps {
  projectName: string
  alignmentScore: number
  theme: 'dark' | 'light'
  onToggleTheme: () => void
  onExport: () => void
  onShowShortcuts: () => void
  exporting: boolean
  exportAvailable: boolean
  saveStatus: 'loading' | 'saving' | 'saved' | 'offline'
}

export function TopBar({ projectName, alignmentScore, theme, onToggleTheme, onExport, onShowShortcuts, exporting, exportAvailable, saveStatus }: TopBarProps) {
  const saveLabel = { loading: 'Loading local spec', saving: 'Saving local spec', saved: 'Local spec saved', offline: 'In-memory only' }[saveStatus]
  return (
    <header className="topbar">
      <div className="topbar-left">
        <div className="brand"><span className="brand-mark"><svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="m10.586 5.414-5.172 5.172" /><path d="m18.586 13.414-5.172 5.172" /><path d="M6 12h12" /><circle cx="12" cy="20" r="2" /><circle cx="12" cy="4" r="2" /><circle cx="20" cy="12" r="2" /><circle cx="4" cy="12" r="2" /></svg></span>plumb</div>
        <div className="topbar-divider" />
        <div className="project-label"><span className="project-name">{projectName}</span><span className="project-type">Architecture</span></div>
      </div>
      <div className="topbar-right">
        <div className="status-line" role="status" aria-live="polite"><span className="status-dot" data-status={saveStatus} />{saveLabel}</div>
        <div className="topbar-actions">
          <span className="alignment-pill" aria-label={`Alignment score ${alignmentScore} out of 100`}>ALIGNMENT: <strong>{alignmentScore}/100</strong></span>
          <button className="export-button focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] focus-visible:ring-offset-2 hover:bg-[var(--bg-elevated)] active:translate-y-px motion-reduce:transform-none disabled:cursor-not-allowed disabled:opacity-60 disabled:bg-[var(--bg-elevated)] disabled:text-[var(--text-primary)]" onClick={onExport} disabled={exporting || !exportAvailable}><Download size={13} />{exporting ? 'BUILDING ZIP' : exportAvailable ? 'EXPORT BUNDLE' : 'LOADING SPEC'}</button>
          <button className="icon-button focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] focus-visible:ring-offset-2 hover:bg-[var(--bg-elevated)] active:translate-y-px motion-reduce:transform-none disabled:cursor-not-allowed disabled:bg-[var(--bg-elevated)] disabled:text-[var(--text-primary)]" onClick={onShowShortcuts} aria-label="Show keyboard shortcuts"><Command size={14} /><span>⌘ K</span></button>
          <button className="theme-button focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] focus-visible:ring-offset-2 hover:bg-[var(--bg-elevated)] active:translate-y-px motion-reduce:transform-none disabled:cursor-not-allowed disabled:bg-[var(--bg-elevated)] disabled:text-[var(--text-primary)]" onClick={onToggleTheme} aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}><>{theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}{theme === 'dark' ? 'Light' : 'Dark'}</></button>
        </div>
      </div>
    </header>
  )
}
