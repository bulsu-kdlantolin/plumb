import { Button } from '../ui/Button'
import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { toast } from 'sonner'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { Warning, Check, CheckCircle, Clipboard, FileCode, ShieldCheck } from '@phosphor-icons/react'
import type { LinterResult } from '../../core/linter/runSlopLinter'
import type { CompiledFileName, CompiledFiles } from '../../core/compiler/compileProject'
import type { ProjectSpec } from '../../types/spec.types'

interface RightCompilerProps {
  project: ProjectSpec
  files: CompiledFiles
  diagnostics: LinterResult
  activeFile: CompiledFileName
  theme: 'dark' | 'light'
  onSelectFile: (file: CompiledFileName) => void
  onFix: (stepIndex: number) => void
}

const fileTabs: { file: CompiledFileName; label: string; lang: 'markdown' | 'sql' }[] = [
  { file: 'AGENTS.md', label: 'AGENTS.md', lang: 'markdown' },
  { file: 'ARCHITECTURE.md', label: 'ARCHITECTURE.md', lang: 'markdown' },
  { file: 'DESIGN.md', label: 'DESIGN.md', lang: 'markdown' },
  { file: 'SCHEMA.sql', label: 'SCHEMA.sql', lang: 'sql' },
  { file: 'API_SPEC.md', label: 'API_SPEC.md', lang: 'markdown' },
  { file: 'PROMPT_PLAYBOOK.md', label: 'PLAYBOOK.md', lang: 'markdown' },
  { file: 'AI_HANDOFF.md', label: 'AI Handoff', lang: 'markdown' },
  { file: 'RESOURCE_LINKS.md', label: 'RESOURCES', lang: 'markdown' },
]

export function RightCompiler({ project, files, diagnostics, activeFile, theme, onSelectFile, onFix }: RightCompilerProps) {
  const reduceMotion = useReducedMotion()
  const [highlighted, setHighlighted] = useState('')
  const [copied, setCopied] = useState(false)
  const [copying, setCopying] = useState(false)
  const [linterOpen, setLinterOpen] = useState(true)
  const tabRefs = useRef<Partial<Record<CompiledFileName, HTMLButtonElement | null>>>({})
  const copyFeedbackTimer = useRef<number | null>(null)
  const content = files[activeFile]
  const lang = fileTabs.find((tab) => tab.file === activeFile)?.lang ?? 'markdown'
  const highlightTheme = theme === 'light' ? 'github-light' : 'github-dark'
  const activeTabId = `compiled-tab-${activeFile.replaceAll('.', '-')}`

  const handleFileTabKeyDown = (event: KeyboardEvent<HTMLButtonElement>, current: CompiledFileName) => {
    const currentIndex = fileTabs.findIndex((tab) => tab.file === current)
    let nextIndex: number | undefined
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') nextIndex = (currentIndex + 1) % fileTabs.length
    if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') nextIndex = (currentIndex - 1 + fileTabs.length) % fileTabs.length
    if (event.key === 'Home') nextIndex = 0
    if (event.key === 'End') nextIndex = fileTabs.length - 1
    if (nextIndex === undefined) return
    event.preventDefault()
    const nextFile = fileTabs[nextIndex].file
    onSelectFile(nextFile)
    tabRefs.current[nextFile]?.focus()
  }

  useEffect(() => {
    let current = true
    void Promise.all([import('@shikijs/core'), import('@shikijs/engine-javascript'), import('@shikijs/langs/markdown'), import('@shikijs/langs/sql'), import('@shikijs/themes/github-dark'), import('@shikijs/themes/github-light')])
      .then(([core, engine, markdown, sql, darkTheme, lightTheme]) => core.getSingletonHighlighterCore({ themes: [darkTheme.default, lightTheme.default], langs: [...markdown.default, ...sql.default], engine: engine.createJavaScriptRegexEngine() }))
      .then((highlighter) => highlighter.codeToHtml(content, { lang, theme: highlightTheme }))
      .then((html) => {
        const styledHtml = html.replace(/<span class="line">([\s\S]*?)<\/span>/g, (lineMarkup, inner: string) => {
          const plain = inner.replace(/<[^>]*>/g, '').replaceAll('&amp;', '&').replaceAll('&lt;', '<').trim()
          const lineClass = lang === 'markdown'
            ? plain.startsWith('#') ? 'markdown-heading' : plain.startsWith('**') ? 'markdown-key' : ''
            : /^(CREATE|ALTER|DROP|POLICY|INDEX|REFERENCES|ON DELETE)\b/i.test(plain) ? 'sql-key' : ''
          const decoratedLine = lineClass === 'markdown-heading'
            ? lineMarkup.replace(/>(#+)(<\/span>)/, '><span class="markdown-marker">$1</span>$2')
            : lineMarkup
          return lineClass ? decoratedLine.replace('<span class="line">', `<span class="line ${lineClass}">`) : lineMarkup
        })
        if (current) setHighlighted(styledHtml)
      })
      .catch(() => { if (current) setHighlighted('') })
    return () => { current = false }
  }, [content, lang, highlightTheme])

  const copy = async () => {
    if (copyFeedbackTimer.current !== null) window.clearTimeout(copyFeedbackTimer.current)
    copyFeedbackTimer.current = null
    setCopying(true)
    try {
      await navigator.clipboard.writeText(content)
      setCopied(true)
      toast.success(`${activeFile} copied`)
      copyFeedbackTimer.current = window.setTimeout(() => { setCopied(false); copyFeedbackTimer.current = null }, 1400)
    } catch {
      setCopied(false)
      toast.error('Could not copy output', { description: 'Select the output text and copy it manually, or try again.' })
    } finally {
      setCopying(false)
    }
  }

  useEffect(() => () => {
    if (copyFeedbackTimer.current !== null) window.clearTimeout(copyFeedbackTimer.current)
  }, [])

  return <aside className="right-compiler">
    <div className="pane-heading"><span className="pane-title">Agent handoff</span><span className="right-alignment-pill">DRAFT BUNDLE</span></div>
    <div className="compiler-file-tabs" role="tablist" aria-label="Compiled files">
      {fileTabs.map(({ file, label }) => <Button key={file} ref={(element) => { tabRefs.current[file] = element }} id={`compiled-tab-${file.replaceAll('.', '-')}`} type="button" role="tab" aria-selected={activeFile === file} aria-controls="compiler-panel" tabIndex={activeFile === file ? 0 : -1} className="compiler-file-tab focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] focus-visible:ring-offset-2 hover:bg-[var(--bg-elevated)] active:translate-y-px motion-reduce:transform-none disabled:cursor-not-allowed disabled:bg-[var(--bg-elevated)] disabled:text-[var(--text-primary)]" onKeyDown={(event) => handleFileTabKeyDown(event, file)} onClick={() => onSelectFile(file)}>{label}{activeFile === file && <motion.span aria-hidden="true" className="tab-active-indicator" layoutId="compiler-active-tab" transition={reduceMotion ? { duration: 0 } : { duration: 0.14, ease: [0.25, 0.46, 0.45, 0.94] }} />}</Button>)}
    </div>
    <div className="compiler-status"><span className="spec-compiled-badge" role="status"><CheckCircle size={14} weight="regular" color={diagnostics.diagnostics.some((d) => d.severity === 'error') ? 'var(--accent-crimson)' : 'var(--accent-emerald)'} />{diagnostics.diagnostics.some((d) => d.severity === 'error') ? 'Review required' : 'Spec compiled'}</span><Button type="button" className="copy-button focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] focus-visible:ring-offset-2 hover:bg-[var(--bg-elevated)] active:translate-y-px motion-reduce:transform-none disabled:cursor-not-allowed disabled:bg-[var(--bg-elevated)] disabled:text-[var(--text-primary)]" onClick={() => void copy()} aria-label={`${copying ? 'Copying' : 'Copy'} ${activeFile}`} disabled={copying}><motion.span key={copied ? 'copied' : 'copy'} initial={reduceMotion ? false : { opacity: 0, scale: 0.75 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: reduceMotion ? 0 : 0.12 }} aria-hidden="true">{copied ? <Check size={13} /> : <Clipboard size={13} />}</motion.span>{copying ? 'Copying' : copied ? 'Copied' : 'Copy'}</Button></div>
    <div id="compiler-panel" className="compiler-body compiler-code-body" role="tabpanel" aria-labelledby={activeTabId} tabIndex={0}>
      {highlighted ? <div className="shiki-output" dangerouslySetInnerHTML={{ __html: highlighted }} /> : <pre className="compiler-code">{content}</pre>}
    </div>
    <section className={`linter-drawer${linterOpen ? ' open' : ''}`}>
      <Button className="linter-drawer-toggle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] focus-visible:ring-offset-2 hover:bg-[var(--bg-elevated)] active:translate-y-px motion-reduce:transform-none disabled:cursor-not-allowed disabled:bg-[var(--bg-elevated)] disabled:text-[var(--text-primary)]" aria-expanded={linterOpen} onClick={() => setLinterOpen((open) => !open)}><span><ShieldCheck size={13} /> Plan review: {diagnostics.diagnostics.length} findings</span><strong>{diagnostics.diagnostics.some((d) => d.severity === 'error') ? 'Needs review' : diagnostics.diagnostics.length ? 'Review open items' : 'Looks complete'}</strong></Button>
      <AnimatePresence initial={false}>{linterOpen && <motion.div key="linter-content" className="linter-drawer-motion" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: reduceMotion ? 0 : 0.14, ease: [0.25, 0.46, 0.45, 0.94] }}><div className="linter-drawer-body">{diagnostics.diagnostics.length === 0 ? <p className="linter-clean">No architecture issues detected.</p> : diagnostics.diagnostics.map((item, index) => <article className="linter-item" key={`${item.code}-${index}`}><div className="diagnostic-line"><span className="diagnostic-code">{item.code}</span><span className={`diagnostic-severity severity-${item.severity}`}>{item.severity}</span></div><p>{item.message}</p><Button className="fix-button focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] focus-visible:ring-offset-2 hover:bg-[var(--bg-elevated)] active:translate-y-px motion-reduce:transform-none disabled:cursor-not-allowed disabled:bg-[var(--bg-elevated)] disabled:text-[var(--text-primary)]" onClick={() => onFix(item.stepIndex)}>{item.fixLabel}</Button></article>)}</div></motion.div>}</AnimatePresence>
      <div className="linter-footer"><Warning size={11} /> Export remains available while items are open.</div>
    </section>
    <div className="right-footer"><span><FileCode size={10} style={{ verticalAlign: 'middle', marginRight: 4 }} />Generated locally</span><span>{project.data.entities.length} tables</span></div>
  </aside>
}

