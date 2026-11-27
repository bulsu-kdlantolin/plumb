import { Popover } from '@base-ui/react/popover'
import { Button } from './Button'
import { CaretDown, Check, FolderOpen } from '@phosphor-icons/react'
import { useState } from 'react'
import type { ProjectSpec } from '../../types/spec.types'

interface ProjectSwitcherProps {
  projects: ProjectSpec[]
  activeProjectId: string | null
  onSelect: (id: string) => void
  onShowAll: () => void
}

export function ProjectSwitcher({ projects, activeProjectId, onSelect, onShowAll }: ProjectSwitcherProps) {
  const [open, setOpen] = useState(false)
  const visibleProjects = projects.slice(0, 6)

  return <Popover.Root open={open} onOpenChange={setOpen}>
    <Popover.Trigger className="icon-button project-switch-button" aria-label="Switch project">
      <FolderOpen size={13} /><span className="project-switch-label">PLANS</span><CaretDown size={11} aria-hidden="true" />
    </Popover.Trigger>
    <Popover.Portal>
      <Popover.Positioner sideOffset={5} align="start" className="project-switch-positioner">
        <Popover.Popup className="project-switch-menu" aria-label="Saved projects">
          <div className="project-switch-heading"><span>RECENT PLANS</span><span>{projects.length}</span></div>
          {visibleProjects.length === 0 ? <p className="project-switch-empty">No saved plans yet. Create a plan to start.</p> : visibleProjects.map((project) => <Button key={project.id} className="project-switch-item" aria-current={project.id === activeProjectId ? 'page' : undefined} onClick={() => { setOpen(false); onSelect(project.id) }}>
            <span className="project-switch-copy"><strong>{project.name || 'Untitled plan'}</strong><span>{project.description || 'No one-sentence idea yet'}</span></span>
            {project.id === activeProjectId && <Check size={14} aria-hidden="true" />}
          </Button>)}
          <Button className="project-switch-all" onClick={() => { setOpen(false); onShowAll() }}>ALL PLANS <span aria-hidden="true">→</span></Button>
        </Popover.Popup>
      </Popover.Positioner>
    </Popover.Portal>
  </Popover.Root>
}
