import { Dialog } from '@base-ui/react/dialog'
import { Command } from 'cmdk'
import { ArrowSquareOut, Copy, DownloadSimple, Sun, FolderOpen, SidebarSimple, Rows, Graph, Palette } from '@phosphor-icons/react'
import type { ReactNode } from 'react'

export type PaletteView = 'erd' | 'topology' | 'preview'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  onStep: (step: number) => void
  onCanvas: (view: PaletteView) => void
  onOutput: () => void
  onTheme: () => void
  onProjects: () => void
  onCopy: () => void
  onExport: () => void
  projectAvailable: boolean
}

export function CommandPalette({ open, onOpenChange, onStep, onCanvas, onOutput, onTheme, onProjects, onCopy, onExport, projectAvailable }: Props) {
  const run = (action: () => void) => { onOpenChange(false); action() }
  const item = (label: string, hint: string, icon: ReactNode, action: () => void, disabled = false) => <Command.Item key={label} value={`${label} ${hint}`} disabled={disabled} onSelect={() => run(action)}>{icon}<span>{label}</span><kbd>{hint}</kbd></Command.Item>
  return <Dialog.Root open={open} onOpenChange={onOpenChange}>
    <Dialog.Portal>
      <Dialog.Backdrop className="command-backdrop" />
      <Dialog.Popup className="command-dialog" aria-label="Plumb commands">
        <Dialog.Title className="sr-only">Command menu</Dialog.Title>
        <Dialog.Description className="sr-only">Search and run a workbench action.</Dialog.Description>
        <Command className="command-surface" loop>
          <Command.Input autoFocus placeholder="Search phases, views, and actions…" aria-label="Search commands" />
          <Command.List>
            <Command.Empty>No matching command.</Command.Empty>
            <Command.Group heading="Planning phases">
              {item('Product definition', '01', <span className="command-index">01</span>, () => onStep(0))}
              {item('Technology choices', '02', <span className="command-index">02</span>, () => onStep(1))}
              {item('System architecture', '03', <span className="command-index">03</span>, () => onStep(2))}
              {item('Experience & delivery', '04', <span className="command-index">04</span>, () => onStep(3))}
            </Command.Group>
            <Command.Group heading="Canvas views">
              {item('ERD schema', 'VIEW', <Rows size={15} />, () => onCanvas('erd'))}
              {item('System topology', 'VIEW', <Graph size={15} />, () => onCanvas('topology'))}
              {item('UI token preview', 'VIEW', <Palette size={15} />, () => onCanvas('preview'))}
            </Command.Group>
            <Command.Group heading="Workbench">
              {item('Toggle agent handoff', 'PANEL', <SidebarSimple size={15} />, onOutput, !projectAvailable)}
              {item('Switch light or dark theme', 'THEME', <Sun size={15} />, onTheme)}
              {item('Open saved plans', 'PLANS', <FolderOpen size={15} />, onProjects)}
              {item('Copy master prompt', 'COPY', <Copy size={15} />, onCopy, !projectAvailable)}
              {item('Export context bundle', '⌘ E', <DownloadSimple size={15} />, onExport, !projectAvailable)}
            </Command.Group>
          </Command.List>
          <div className="command-footer"><span><ArrowSquareOut size={12} /> Select a command to run it</span><kbd>ESC</kbd></div>
        </Command>
      </Dialog.Popup>
    </Dialog.Portal>
  </Dialog.Root>
}
