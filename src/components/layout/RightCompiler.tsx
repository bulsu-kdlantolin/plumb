import { useEffect, useState } from 'react'
import { AlertTriangle, Check, CheckCircle2, Clipboard, FileCode2, ShieldCheck } from 'lucide-react'
import { runSlopLinter } from '../../core/linter/runSlopLinter'
import type { CompiledFileName, CompiledFiles } from '../../core/compiler/compileProject'
import type { ProjectSpec } from '../../types/spec.types'

interface RightCompilerProps {
  project: ProjectSpec
  files: CompiledFiles
  activeFile: CompiledFileName
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
]

export function RightCompiler({ project, files, activeFile, onSelectFile, onFix }: RightCompilerProps) {
  const [highlighted, setHighlighted] = useState('')
  const [copied, setCopied] = useState(false)
  const [linterOpen, setLinterOpen] = useState(true)
  const diagnostics = runSlopLinter(project)
  const content = files[activeFile]
  const lang = fileTabs.find((tab) => tab.file === activeFile)?.lang ?? 'markdown'

  useEffect(() => {
    let current = true
    void Promise.all([import('@shikijs/core'), import('@shikijs/engine-javascript'), import('@shikijs/langs/markdown'), import('@shikijs/langs/sql'), import('@shikijs/themes/github-dark')])
      .then(([core, engine, markdown, sql, theme]) => core.getSingletonHighlighterCore({ themes: [theme.default], langs: [...markdown.default, ...sql.default], engine: engine.createJavaScriptRegexEngine() }))
      .then((highlighter) => highlighter.codeToHtml(content, { lang, theme: 'github-dark' }))
      .then((html) => { if (current) setHighlighted(html) })
      .catch(() => { if (current) setHighlighted('') })
    return () => { current = false }
  }, [content, lang])

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(content)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1400)
    } catch { setCopied(false) }
  }

  return <aside className="right-compiler">
    <div className="pane-heading"><span className="pane-title">COMPILER OUTPUT</span><span className="pane-index">{diagnostics.alignmentScore} / 100</span></div>
    <div className="compiler-file-tabs" role="tablist" aria-label="Compiled files">
      {fileTabs.map(({ file, label }) => <button key={file} role="tab" aria-selected={activeFile === file} className="compiler-file-tab" onClick={() => onSelectFile(file)}>{label}</button>)}
    </div>
    <div className="compiler-status"><strong><CheckCircle2 size={14} color={diagnostics.diagnostics.some((d) => d.severity === 'error') ? 'var(--accent-crimson)' : 'var(--accent-emerald)'} />{diagnostics.diagnostics.some((d) => d.severity === 'error') ? 'REVIEW REQUIRED' : 'SPEC COMPILED'}</strong><button className="copy-button" onClick={() => void copy()} aria-label={`Copy ${activeFile}`}><>{copied ? <Check size={13} /> : <Clipboard size={13} />}{copied ? 'COPIED' : 'COPY'}</></button></div>
    <div className="compiler-body compiler-code-body" role="tabpanel" aria-label={activeFile}>
      {highlighted ? <div className="shiki-output" dangerouslySetInnerHTML={{ __html: highlighted }} /> : <pre className="compiler-code">{content}</pre>}
    </div>
    <section className={`linter-drawer${linterOpen ? ' open' : ''}`}>
      <button className="linter-drawer-toggle" aria-expanded={linterOpen} onClick={() => setLinterOpen((open) => !open)}><span><ShieldCheck size={13} /> SLOP LINTER · {diagnostics.diagnostics.length} FINDINGS</span><strong>ALIGNMENT {diagnostics.alignmentScore}</strong></button>
      {linterOpen && <div className="linter-drawer-body">{diagnostics.diagnostics.length === 0 ? <p className="linter-clean">No architecture issues detected.</p> : diagnostics.diagnostics.map((item, index) => <article className="linter-item" key={`${item.code}-${index}`}><div className="diagnostic-line"><span className="diagnostic-code">{item.code}</span><span className={`diagnostic-severity severity-${item.severity}`}>{item.severity}</span></div><p>{item.message}</p><button className="fix-button" onClick={() => onFix(item.stepIndex)}>[FIX] {item.fixLabel} →</button></article>)}</div>}
      <div className="linter-footer"><AlertTriangle size={11} /> SCORE DEDUCTIONS: −20 ERROR / −10 WARNING / −3 INFO</div>
    </section>
    <div className="right-footer"><span><FileCode2 size={10} style={{ verticalAlign: 'middle', marginRight: 4 }} />PURE SPEC OUTPUT</span><span>{project.data.entities.length} TABLES</span></div>
  </aside>
}
