import { Expand } from '@theme-toggles/react'

interface Props { theme: 'dark' | 'light'; onToggle: () => void }

export function ThemeToggle({ theme, onToggle }: Props) {
  const next = theme === 'dark' ? 'light' : 'dark'
  return <Expand className="theme-toggle-control" duration={140} toggled={theme === 'dark'} aria-label={`Switch to ${next} theme`} title={`Switch to ${next} theme`} onClick={onToggle} />
}
