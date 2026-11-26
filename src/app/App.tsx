import { useCallback, useEffect, useMemo, useState } from 'react'
import JSZip from 'jszip'
import { toast, Toaster } from 'sonner'
import { MotionConfig } from 'motion/react'
import { CenterCanvas } from '../components/layout/CenterCanvas'
import { LeftRail } from '../components/layout/LeftRail'
import { ProjectStart } from '../components/layout/ProjectStart'
import { RightCompiler } from '../components/layout/RightCompiler'
import { TopBar } from '../components/layout/TopBar'
import { useSpecStore } from '../store/useSpecStore'
import { Loading } from 'loading-dev'
import { compileProject, projectSlug } from '../core/compiler/compileProject'
import { runSlopLinter } from '../core/linter/runSlopLinter'
import { CommandPalette, type PaletteView } from '../components/ui/CommandPalette'

export default function App() {
  const project = useSpecStore((state) => state.project)
  const projects = useSpecStore((state) => state.projects)
  const hydrated = useSpecStore((state) => state.hydrated)
  const saveStatus = useSpecStore((state) => state.saveStatus)
  const activeStep = useSpecStore((state) => state.activeStep)
  const compilerTab = useSpecStore((state) => state.compilerTab)
  const hydrate = useSpecStore((state) => state.hydrate)
  const setActiveStep = useSpecStore((state) => state.setActiveStep)
  const setCompilerTab = useSpecStore((state) => state.setCompilerTab)
  const updateProject = useSpecStore((state) => state.updateProject)
  const createProject = useSpecStore((state) => state.createProject)
  const selectProject = useSpecStore((state) => state.selectProject)
  const renameProject = useSpecStore((state) => state.renameProject)
  const duplicateProject = useSpecStore((state) => state.duplicateProject)
  const deleteProject = useSpecStore((state) => state.deleteProject)
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')
  const [exporting, setExporting] = useState(false)
  const [compilerOpen, setCompilerOpen] = useState(false)
  const [commandOpen, setCommandOpen] = useState(false)
  const [canvasRequest, setCanvasRequest] = useState<PaletteView | null>(null)
  const files = useMemo(() => project ? compileProject(project) : null, [project])
  const diagnostics = useMemo(() => project ? runSlopLinter(project) : null, [project])

  useEffect(() => { void hydrate() }, [hydrate])
  useEffect(() => {
    document.documentElement.dataset.theme = theme
    const themeColor = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')
    const canvasColor = getComputedStyle(document.documentElement).getPropertyValue('--bg-canvas').trim()
    if (themeColor && canvasColor) themeColor.content = canvasColor
  }, [theme])

  const exportBundle = useCallback(async () => {
    if (!project || !files) return
    setExporting(true)
    try {
      const zip = new JSZip()
      Object.entries(files).sort(([a], [b]) => a.localeCompare(b)).forEach(([name, content]) => zip.file(name, content, { date: new Date('2000-01-01T00:00:00.000Z') }))
      const blob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 9 } })
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement('a'); anchor.href = url; anchor.download = `${projectSlug(project)}-context-bundle.zip`; anchor.click()
      window.setTimeout(() => URL.revokeObjectURL(url), 1000)
      toast.success('Context bundle exported', { description: `${projectSlug(project)}-context-bundle.zip` })
    } catch { toast.error('Bundle export failed', { description: 'Check browser download permissions and try again.' }) }
    finally { setExporting(false) }
  }, [files, project])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!(event.metaKey || event.ctrlKey) || event.altKey || event.shiftKey) return
      const target = event.target
      const editing = target instanceof HTMLElement && (target.isContentEditable || Boolean(target.closest('input, textarea, select, [contenteditable="true"]')))
      if (editing && event.key.toLowerCase() !== 'k') return
      if (event.key.toLowerCase() === 'e') { event.preventDefault(); void exportBundle() }
      else if (event.key.toLowerCase() === 'k') { event.preventDefault(); setCommandOpen((open) => !open) }
    }
    window.addEventListener('keydown', onKeyDown); return () => window.removeEventListener('keydown', onKeyDown)
  }, [exportBundle])

  const copyHandoff = async () => {
    if (!files) return
    try {
      await navigator.clipboard.writeText(files['AI_HANDOFF.md'])
      toast.success('Master prompt copied', { description: 'Paste it into your coding agent to start the build.' })
    } catch { toast.error('Could not copy the master prompt', { description: 'Open HANDOFF and copy the AI_HANDOFF.md text manually.' }) }
  }

  return <MotionConfig reducedMotion="user"><div className="workbench">
    <TopBar projectName={project?.name ?? 'Start a plan'} theme={theme} onToggleTheme={() => setTheme((current) => current === 'dark' ? 'light' : 'dark')} onExport={() => void exportBundle()} onShowShortcuts={() => setCommandOpen(true)} exporting={exporting} exportAvailable={hydrated && Boolean(project)} saveStatus={saveStatus} onProjects={() => void selectProject(null)} onToggleCompiler={() => { if (!compilerOpen) setCompilerTab('AI_HANDOFF.md'); setCompilerOpen((open) => !open) }} compilerOpen={compilerOpen} onCopyHandoff={() => void copyHandoff()} />
    {!hydrated ? <div className="loading-state" role="status" aria-live="polite"><Loading size={24} color="var(--accent-primary)" /><span>Opening local plans</span></div> : !project ? <ProjectStart projects={projects} onCreate={(name, idea, example) => void createProject(name, idea, example)} onOpen={(id) => void selectProject(id)} onRename={(id, name) => void renameProject(id, name)} onDuplicate={(id) => void duplicateProject(id)} onDelete={(id) => void deleteProject(id)} /> : <div className={`shell${compilerOpen ? ' compiler-visible' : ' compiler-hidden'}`}>
      <LeftRail activeStep={activeStep} onSelectStep={setActiveStep} project={project} saveStatus={saveStatus} />
      <CenterCanvas project={project} activeStep={activeStep} onSelectStep={setActiveStep} onUpdateProject={(next) => updateProject(() => next)} requestedView={canvasRequest} onViewRequestHandled={() => setCanvasRequest(null)} />
      {compilerOpen && files && diagnostics && <RightCompiler project={project} files={files} diagnostics={diagnostics} activeFile={compilerTab} theme={theme} onSelectFile={setCompilerTab} onFix={(step) => setActiveStep(step)} />}
    </div>}
    <CommandPalette open={commandOpen} onOpenChange={setCommandOpen} onStep={(step) => { setActiveStep(step); setCanvasRequest(null) }} onCanvas={(view) => { setCanvasRequest(view); setActiveStep(2) }} onOutput={() => { if (!compilerOpen) setCompilerTab('AI_HANDOFF.md'); setCompilerOpen((open) => !open) }} onTheme={() => setTheme((current) => current === 'dark' ? 'light' : 'dark')} onProjects={() => void selectProject(null)} onCopy={() => void copyHandoff()} onExport={() => void exportBundle()} projectAvailable={Boolean(project)} />
    <Toaster theme={theme} position="bottom-right" toastOptions={{ classNames: { toast: 'plumb-toast', title: 'plumb-toast-title', description: 'plumb-toast-description' } }} />
    <span className="sr-only" aria-live="polite">{exporting ? 'Exporting context bundle' : ''}</span>
  </div></MotionConfig>
}
