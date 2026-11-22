import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import JSZip from 'jszip'
import { CenterCanvas } from '../components/layout/CenterCanvas'
import { LeftRail } from '../components/layout/LeftRail'
import { RightCompiler } from '../components/layout/RightCompiler'
import { TopBar } from '../components/layout/TopBar'
import { useSpecStore } from '../store/useSpecStore'
import { compileProject, projectSlug } from '../core/compiler/compileProject'

export default function App() {
  const project = useSpecStore((state) => state.project)
  const hydrated = useSpecStore((state) => state.hydrated)
  const saveStatus = useSpecStore((state) => state.saveStatus)
  const activeStep = useSpecStore((state) => state.activeStep)
  const compilerTab = useSpecStore((state) => state.compilerTab)
  const hydrate = useSpecStore((state) => state.hydrate)
  const setActiveStep = useSpecStore((state) => state.setActiveStep)
  const setCompilerTab = useSpecStore((state) => state.setCompilerTab)
  const updateProject = useSpecStore((state) => state.updateProject)
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')
  const [exporting, setExporting] = useState(false)
  const [shortcutHelpOpen, setShortcutHelpOpen] = useState(false)
  const [exportError, setExportError] = useState('')
  const shortcutDialogRef = useRef<HTMLElement>(null)
  const files = useMemo(() => compileProject(project), [project])

  useEffect(() => { void hydrate() }, [hydrate])
  useEffect(() => {
    document.documentElement.dataset.theme = theme
    const themeColor = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')
    if (themeColor) themeColor.content = theme === 'dark' ? '#0C0D0E' : '#ECEAE4'
  }, [theme])

  const counts = { routes: project.scope.routes.length, entities: project.data.entities.length, endpoints: project.apis.endpoints.length, envVars: project.stack.envVars.length }

  const exportBundle = useCallback(async () => {
    setExporting(true)
    setExportError('')
    try {
      const zip = new JSZip()
      Object.entries(files).sort(([a], [b]) => a.localeCompare(b)).forEach(([name, content]) => zip.file(name, content, { date: new Date('2000-01-01T00:00:00.000Z') }))
      const blob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 9 } })
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = `${projectSlug(project)}-context-bundle.zip`
      anchor.click()
      window.setTimeout(() => URL.revokeObjectURL(url), 1000)
    } catch {
      setExportError('Bundle export failed. Check browser download permissions and try again.')
    } finally { setExporting(false) }
  }, [files, project])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && shortcutHelpOpen) { setShortcutHelpOpen(false); return }
      if (!(event.metaKey || event.ctrlKey) || event.altKey || event.shiftKey) return
      const target = event.target
      const editing = target instanceof HTMLElement && (target.isContentEditable || Boolean(target.closest('input, textarea, select, [contenteditable="true"]')))
      if (editing && event.key.toLowerCase() !== 'k') return
      if (event.key.toLowerCase() === 'e') {
        event.preventDefault()
        void exportBundle()
      } else if (event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setShortcutHelpOpen((open) => !open)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [exportBundle, shortcutHelpOpen])

  useEffect(() => {
    if (!shortcutHelpOpen) return
    const previousFocus = document.activeElement
    shortcutDialogRef.current?.querySelector<HTMLButtonElement>('button')?.focus()
    return () => { if (previousFocus instanceof HTMLElement) previousFocus.focus() }
  }, [shortcutHelpOpen])

  return <div className="workbench">
    <TopBar projectName={project.name} theme={theme} onToggleTheme={() => setTheme((current) => current === 'dark' ? 'light' : 'dark')} onExport={() => void exportBundle()} onShowShortcuts={() => setShortcutHelpOpen(true)} exporting={exporting} exportAvailable={hydrated} saveStatus={saveStatus} />
    <div className="shell" inert={!hydrated} aria-busy={!hydrated}>
      <LeftRail activeStep={activeStep} onSelectStep={setActiveStep} counts={counts} project={project} saveStatus={saveStatus} onChangeProject={(next) => updateProject(() => next)} />
      <CenterCanvas project={project} activeStep={activeStep} onSelectStep={setActiveStep} onUpdateProject={(next) => updateProject(() => next)} />
      <RightCompiler project={project} files={files} activeFile={compilerTab} onSelectFile={setCompilerTab} onFix={setActiveStep} />
    </div>
    {exportError && <div className="export-error" role="alert">{exportError}<button onClick={() => setExportError('')} aria-label="Dismiss export error">×</button></div>}
    {shortcutHelpOpen && <div className="shortcut-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setShortcutHelpOpen(false) }}><section ref={shortcutDialogRef} className="shortcut-dialog" role="dialog" aria-modal="true" aria-labelledby="shortcut-title" onKeyDown={(event) => { if (event.key === 'Tab') event.preventDefault() }}><header><h2 id="shortcut-title">Keyboard shortcuts</h2><button className="editor-icon" onClick={() => setShortcutHelpOpen(false)} aria-label="Close keyboard shortcuts">×</button></header><div><span>Export context bundle</span><kbd>⌘ / Ctrl + E</kbd></div><div><span>Show this panel</span><kbd>⌘ / Ctrl + K</kbd></div><div><span>Close this panel</span><kbd>Esc</kbd></div></section></div>}
    <span className="sr-only" aria-live="polite">{exporting ? 'Exporting context bundle' : ''}</span>
    {!hydrated && <span aria-live="polite" style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0, 0, 0, 0)' }}>Loading local project</span>}
  </div>
}
