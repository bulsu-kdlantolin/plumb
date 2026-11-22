import { Command, Download, Moon, Sun, Waypoints } from 'lucide-react'

interface TopBarProps {
  projectName: string
  theme: 'dark' | 'light'
  onToggleTheme: () => void
  onExport: () => void
  onShowShortcuts: () => void
  exporting: boolean
  exportAvailable: boolean
  saveStatus: 'loading' | 'saving' | 'saved' | 'offline'
}

export function TopBar({ projectName, theme, onToggleTheme, onExport, onShowShortcuts, exporting, exportAvailable, saveStatus }: TopBarProps) {
  const saveLabel = { loading: 'LOADING LOCAL SPEC', saving: 'SAVING LOCAL SPEC', saved: 'LOCAL SPEC SAVED', offline: 'IN-MEMORY ONLY' }[saveStatus]
  return (
    <header className="topbar">
      <div className="topbar-left">
        <div className="brand"><span className="brand-mark"><Waypoints size={16} strokeWidth={1.8} /></span>plumb</div>
        <div className="topbar-divider" />
        <div className="project-label"><span className="project-name">{projectName}</span><span className="project-type">ARCHITECTURE</span></div>
      </div>
      <div className="topbar-right">
        <div className="status-line" role="status" aria-live="polite"><span className="status-dot" data-status={saveStatus} />{saveLabel}</div>
        <div className="topbar-actions">
          <button className="export-button" onClick={onExport} disabled={exporting || !exportAvailable}><Download size={13} />{exporting ? 'BUILDING ZIP' : exportAvailable ? 'EXPORT CONTEXT BUNDLE' : 'LOADING SPEC'}</button>
          <button className="icon-button" onClick={onShowShortcuts} aria-label="Show keyboard shortcuts"><Command size={14} /><span>⌘ K</span></button>
          <button className="theme-button" onClick={onToggleTheme} aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}><>{theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}{theme === 'dark' ? 'LIGHT' : 'DARK'}</></button>
        </div>
      </div>
    </header>
  )
}
