import { TextInput, TextArea } from '../ui/TextInput'
import { Checkbox } from '../ui/Checkbox'
import { Button } from '../ui/Button'
import { Dialog } from '@base-ui/react/dialog'
import { Copy, FilePlus, FolderOpen, Pencil, Trash } from '@phosphor-icons/react'
import { useRef, useState, type FormEvent } from 'react'
import type { ProjectSpec } from '../../types/spec.types'

interface Props {
  projects: ProjectSpec[]
  onCreate: (name: string, idea: string, example?: boolean) => void
  onOpen: (id: string) => void
  onRename: (id: string, name: string) => void
  onDuplicate: (id: string) => void
  onDelete: (id: string) => void
}

export function ProjectStart({ projects, onCreate, onOpen, onRename, onDuplicate, onDelete }: Props) {
  const [name, setName] = useState('')
  const [idea, setIdea] = useState('')
  const [example, setExample] = useState(false)
  const [formError, setFormError] = useState('')
  const [dialogProject, setDialogProject] = useState<{ kind: 'rename' | 'delete'; project: ProjectSpec } | null>(null)
  const [renameValue, setRenameValue] = useState('')
  const dialogInput = useRef<HTMLInputElement>(null)

  const submit = (event: FormEvent) => {
    event.preventDefault()
    if (!name.trim() || !idea.trim()) {
      setFormError('Add a project name and one-sentence idea to continue.')
      return
    }
    setFormError('')
    onCreate(name, idea, example)
  }

  const closeDialog = () => setDialogProject(null)

  return <main className="project-start">
    <section className="project-create">
      <div className="micro-label">LOCAL-FIRST · PRE-FLIGHT ARCHITECTURE</div>
      <h1>Plan the system before the first prompt.</h1>
      <p>Build a clear, editable brief for your coding agent. Start with what you know; refine each phase and export whenever you’re ready.</p>
      <form noValidate onSubmit={submit}>
        <label>PROJECT NAME<TextInput value={name} onChange={(event) => setName(event.target.value)} placeholder="e.g. Field Notes" /></label>
        <label>ONE-SENTENCE IDEA<TextArea rows={2} value={idea} onChange={(event) => setIdea(event.target.value)} placeholder="What are you building, and who is it for?" /></label>
        {formError && <p className="form-error" role="alert">{formError}</p>}
        <label className="example-choice"><Checkbox aria-label="Use the PulseBoard example as starting content" checked={example} onCheckedChange={setExample} /><span>Use the PulseBoard example as starting content</span></label>
        <Button type="submit" className="export-button"><FilePlus size={15} /> CREATE PLAN</Button>
      </form>
    </section>

    <section className="project-library">
      <div className="pane-heading"><span className="pane-title">YOUR PLANS</span><span className="pane-index">{projects.length}</span></div>
      {projects.length === 0 ? <div className="library-empty"><FolderOpen size={20} /><strong>No saved plans yet</strong><span>Your plans stay in this browser.</span></div> : projects.map((project) => <article className="project-row" key={project.id}>
        <Button className="project-open" onClick={() => onOpen(project.id)}><strong>{project.name || 'Untitled plan'}</strong><span>{project.description || 'No idea added yet'}</span></Button>
        <div className="project-actions">
          <Button aria-label={`Rename ${project.name}`} title="Rename" onClick={() => { setRenameValue(project.name); setDialogProject({ kind: 'rename', project }) }}><Pencil size={13} /></Button>
          <Button aria-label={`Duplicate ${project.name}`} title="Duplicate" onClick={() => onDuplicate(project.id)}><Copy size={13} /></Button>
          <Button aria-label={`Delete ${project.name}`} title="Delete" onClick={() => setDialogProject({ kind: 'delete', project })}><Trash size={13} /></Button>
        </div>
      </article>)}
    </section>

    <Dialog.Root open={dialogProject !== null} onOpenChange={(open) => { if (!open) closeDialog() }}>
      <Dialog.Portal>
        <Dialog.Backdrop className="project-dialog-backdrop" />
        <Dialog.Popup className="project-dialog" initialFocus={dialogProject?.kind === 'rename' ? dialogInput : undefined}>
          <span className="micro-label">PROJECT LIBRARY</span>
          <Dialog.Title className="project-dialog-title">{dialogProject?.kind === 'rename' ? 'Rename plan' : 'Delete plan?'}</Dialog.Title>
          {dialogProject?.kind === 'rename' ? <form noValidate onSubmit={(event) => {
            event.preventDefault()
            if (renameValue.trim()) {
              onRename(dialogProject.project.id, renameValue)
              closeDialog()
            }
          }}>
            <label>PLAN NAME<TextInput ref={dialogInput} value={renameValue} onChange={(event) => setRenameValue(event.target.value)} /></label>
            <div className="project-dialog-actions"><Button type="button" className="flow-action" onClick={closeDialog}>CANCEL</Button><Button type="submit" className="export-button">SAVE NAME</Button></div>
          </form> : dialogProject && <>
            <Dialog.Description className="project-dialog-description">“{dialogProject.project.name}” will be removed from this browser’s local plans.</Dialog.Description>
            <div className="project-dialog-actions"><Button className="flow-action" onClick={closeDialog}>KEEP PLAN</Button><Button className="export-button danger-action" onClick={() => { onDelete(dialogProject.project.id); closeDialog() }}>DELETE PLAN</Button></div>
          </>}
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  </main>
}
