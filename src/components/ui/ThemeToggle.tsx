interface Props { theme: 'dark' | 'light'; onToggle: () => void }

export function ThemeToggle({ theme, onToggle }: Props) {
  const next = theme === 'dark' ? 'light' : 'dark'
  return <button type="button" className="theme-toggle-control" data-theme={theme} aria-label={`Switch to ${next} theme`} aria-pressed={theme === 'dark'} onClick={onToggle}>
    <svg viewBox="0 0 40 24" width="40" height="24" aria-hidden="true">
      <rect x="1" y="1" width="38" height="22" fill="var(--bg-surface)" stroke="var(--border-strong)" />
      <path d="M8 7v10M32 7v10" stroke="var(--text-muted)" strokeWidth="1" />
      <rect className="theme-toggle-paddle" x="4" y="4" width="14" height="16" fill="var(--accent-primary)" />
      <circle cx="11" cy="12" r="2" fill="var(--text-on-accent)" />
    </svg>
    <span className="sr-only">{theme === 'dark' ? 'Dark theme active' : 'Light theme active'}</span>
  </button>
}
