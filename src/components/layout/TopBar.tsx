import { Button } from '../ui/Button'
import { Command, DownloadSimple, FolderOpen, SidebarSimple, Copy } from '@phosphor-icons/react'
import { ThemeToggle } from '../ui/ThemeToggle'
import { Ring } from 'loading-dev'

interface TopBarProps {
  projectName: string
  theme: 'dark' | 'light'
  onToggleTheme: () => void
  onExport: () => void
  onShowShortcuts: () => void
  exporting: boolean
  exportAvailable: boolean
  saveStatus: 'loading' | 'saving' | 'saved' | 'offline'
  onProjects: () => void
  onToggleCompiler: () => void
  compilerOpen: boolean
  onCopyHandoff: () => void
}

export function TopBar({ projectName, theme, onToggleTheme, onExport, onShowShortcuts, exporting, exportAvailable, saveStatus, onProjects, onToggleCompiler, compilerOpen, onCopyHandoff }: TopBarProps) {
  const saveLabel = { loading: 'Loading local spec', saving: 'Saving local spec', saved: 'Local spec saved', offline: 'In-memory only' }[saveStatus]
  return (
    <header className="topbar">
      <div className="topbar-left">
        <div className="brand"><span className="brand-mark"><svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="m10.586 5.414-5.172 5.172" /><path d="m18.586 13.414-5.172 5.172" /><path d="M6 12h12" /><circle cx="12" cy="20" r="2" /><circle cx="12" cy="4" r="2" /><circle cx="20" cy="12" r="2" /><circle cx="4" cy="12" r="2" /></svg></span>plumb</div>
        <Button className="icon-button project-switch-button" onClick={onProjects}><FolderOpen size={13} /> PLANS</Button>
        <div className="topbar-divider" />
        <div className="project-label"><span className="project-name">{projectName}</span><span className="project-type">Architecture</span></div>
      </div>
      <div className="topbar-right">
        <div className="status-line" role="status" aria-live="polite">{saveStatus === 'saving' && <Ring size={13} color="var(--accent-primary)" duration={700} />}<span className="status-dot" data-status={saveStatus} />{saveLabel}</div>
        <div className="topbar-actions">
          <Button className="icon-button" onClick={onToggleCompiler} aria-pressed={compilerOpen}><SidebarSimple size={14} /><span>{compilerOpen ? 'HIDE OUTPUT' : 'HANDOFF'}</span></Button>
          <Button className="icon-button" onClick={onCopyHandoff} disabled={!exportAvailable} title="Copy the master prompt for your coding agent"><Copy size={14} /><span>COPY PROMPT</span></Button>
          <Button className="export-button focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] focus-visible:ring-offset-2 hover:bg-[var(--bg-elevated)] active:translate-y-px motion-reduce:transform-none disabled:cursor-not-allowed disabled:opacity-60 disabled:bg-[var(--bg-elevated)] disabled:text-[var(--text-primary)]" onClick={onExport} disabled={exporting || !exportAvailable}>{exporting ? <Ring size={14} color="var(--text-on-accent)" duration={700} /> : <DownloadSimple size={13} />}{exporting ? 'BUILDING ZIP' : exportAvailable ? 'EXPORT BUNDLE' : 'LOADING SPEC'}</Button>
          <Button className="icon-button focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] focus-visible:ring-offset-2 hover:bg-[var(--bg-elevated)] active:translate-y-px motion-reduce:transform-none disabled:cursor-not-allowed disabled:bg-[var(--bg-elevated)] disabled:text-[var(--text-primary)]" onClick={onShowShortcuts} aria-label="Show keyboard shortcuts"><Command size={14} /><span>⌘ K</span></Button>
          <ThemeToggle theme={theme} onToggle={onToggleTheme} />
        </div>
      </div>
    </header>
  )
}
