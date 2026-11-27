import { TextInput, TextArea } from '../ui/TextInput'
import { Button } from '../ui/Button'
import { useCallback, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import { ReactFlow, Background, Controls, MarkerType, type Connection, type Edge, type EdgeChangeset, type NodeChangeset } from '@xyflow/react'
import dagre from 'dagre'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { ArrowLineDown, Database, GridFour, Graph, Palette, Rows } from '@phosphor-icons/react'
import { DesignPreviewCard } from '../canvas/DesignPreviewCard'
import { EntityNode, type EntityNodeData, type EntityNodeType } from '../canvas/EntityNode'
import { ServiceNode, type ServiceNodeData, type ServiceNodeType } from '../canvas/ServiceNode'
import type { EntityFieldSpec, ProjectSpec } from '../../types/spec.types'
import { Step1ScopeForm } from '../pipeline/Step1ScopeForm'
import { Step2StackForm } from '../pipeline/Step2StackForm'
import { Step3DataApiForm } from '../pipeline/Step3DataApiForm'
import { Step4DesignForm } from '../pipeline/Step4DesignForm'
import { ClickSpark } from '../ui/ClickSpark'

type View = 'erd' | 'topology' | 'preview'
type CanvasNode = EntityNodeType | ServiceNodeType
type CanvasEdge = Edge

const nodeTypes = { entity: EntityNode, service: ServiceNode }
const tabs: { id: View; label: string; icon: typeof Rows }[] = [
  { id: 'erd', label: 'ERD SCHEMA', icon: Rows },
  { id: 'topology', label: 'SYSTEM TOPOLOGY', icon: Graph },
  { id: 'preview', label: 'UI TOKEN PREVIEW', icon: Palette },
]

interface CenterCanvasProps {
  project: ProjectSpec
  activeStep: number
  onSelectStep: (step: number) => void
  onUpdateProject: (project: ProjectSpec) => void
  mode: 'plan' | 'canvas'
  view: View
  onModeChange: (mode: 'plan' | 'canvas') => void
  onViewChange: (view: View) => void
}

function getErdNodes(entities: ProjectSpec['data']['entities']): CanvasNode[] {
  return entities.map((entity) => ({
    id: entity.id,
    type: 'entity',
    position: entity.position,
    data: { label: entity.name, rlsPolicy: entity.rlsPolicy, indexes: entity.indexes, fields: entity.fields },
  }))
}

function getErdEdges(entities: ProjectSpec['data']['entities']): CanvasEdge[] {
  return entities.flatMap((source) => source.fields.flatMap((field) => {
    if (!field.references) return []
    const target = entities.find((entity) => entity.name === field.references?.entity)
    if (!target) return []
    const targetField = target.fields.find((candidate) => candidate.name === field.references?.field)
    if (!targetField) return []
    return [{
      id: `${source.id}-${field.id}-${target.id}-${targetField.id}`,
      source: source.id,
      sourceHandle: `${field.id}-source`,
      target: target.id,
      targetHandle: `${targetField.id}-target`,
      type: 'smoothstep',
      label: field.onDelete ? `ON DELETE ${field.onDelete.toUpperCase()}` : undefined,
      className: 'erd-edge',
      markerEnd: { type: MarkerType.ArrowClosed, color: 'var(--text-muted)', width: 12, height: 12 },
      labelStyle: { fill: 'var(--text-primary)', fontFamily: 'var(--font-mono)', fontSize: 10 },
      labelBgStyle: { fill: 'var(--bg-panel)', stroke: 'var(--border-strong)', strokeWidth: 1 },
      labelBgPadding: [6, 3],
      labelBgBorderRadius: 2,
    }]
  }))
}

function getTopology(stack: ProjectSpec['stack'], webhooks: ProjectSpec['apis']['webhooks']): { nodes: CanvasNode[]; edges: CanvasEdge[] } {
  const nodes: CanvasNode[] = []
  const links: [string, string][] = []
  const push = (id: string, label: string, detail: string, kind: ServiceNodeData['kind']) => {
    nodes.push({ id, type: 'service', position: { x: 0, y: 0 }, data: { label, detail, kind } })
  }
  push('client', 'Client App', stack.frontend || 'Frontend client', 'client')
  push('api', 'API Layer', stack.backend || 'API service', 'api')
  push('database', 'Database', stack.database || 'Data store', 'database')
  push('auth', 'Auth Provider', stack.authStrategy || 'Authentication', 'auth')
  links.push(['client', 'api'], ['api', 'database'], ['client', 'auth'], ['api', 'auth'])
  webhooks.forEach((hook, index) => {
    const id = `webhook-${index}`
    push(id, hook.provider || `Webhook ${index + 1}`, `${hook.event || 'External event'} → ${hook.path || '/webhook'}`, 'webhook')
    links.push([id, 'api'])
  })
  return { nodes, edges: links.map(([source, target], index) => ({ id: `topology-${index}`, source, target, type: 'smoothstep', className: 'topology-edge', markerEnd: { type: MarkerType.ArrowClosed, color: 'var(--text-muted)', width: 12, height: 12 } })) }
}

function layoutNodes(nodes: CanvasNode[], edges: CanvasEdge[], direction: 'LR' | 'TB'): CanvasNode[] {
  const graph = new dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}))
  graph.setGraph({ rankdir: direction, nodesep: 65, ranksep: 120, marginx: 36, marginy: 36 })
  nodes.forEach((node) => graph.setNode(node.id, { width: node.type === 'entity' ? 300 : 260, height: node.type === 'entity' ? 80 + ((node.data as EntityNodeData).fields.length * 29) : 104 }))
  edges.forEach((edge) => graph.setEdge(edge.source, edge.target))
  dagre.layout(graph)
  return nodes.map((node) => {
    const point = graph.node(node.id)
    const width = node.type === 'entity' ? 300 : 260
    const height = node.type === 'entity' ? 80 + ((node.data as EntityNodeData).fields.length * 29) : 104
    return { ...node, position: { x: point.x - width / 2, y: point.y - height / 2 } }
  })
}

export function CenterCanvas({ project, activeStep, onSelectStep, onUpdateProject, mode, view, onModeChange, onViewChange }: CenterCanvasProps) {
  const [localNodes, setLocalNodes] = useState<{ view: View; nodes: CanvasNode[] } | null>(null)
  const [localEdges, setLocalEdges] = useState<{ view: View; edges: CanvasEdge[] } | null>(null)
  const reduceMotion = useReducedMotion()
  const tabRefs = useRef<Partial<Record<View, HTMLButtonElement | null>>>({})
  const baseErdNodes = useMemo(() => getErdNodes(project.data.entities), [project.data.entities])
  const baseErdEdges = useMemo(() => getErdEdges(project.data.entities), [project.data.entities])
  const topology = useMemo(() => getTopology(project.stack, project.apis.webhooks), [project.stack, project.apis.webhooks])
  const nodes = view === 'erd' ? baseErdNodes : topology.nodes
  const edges = view === 'erd' ? baseErdEdges : topology.edges
  const flowNodes = (localNodes?.view === view ? localNodes.nodes : nodes).map((node) => ({ ...node, data: nodes.find((latest) => latest.id === node.id)?.data ?? node.data })) as CanvasNode[]
  const flowEdges = localEdges?.view === view ? localEdges.edges : edges

  const onNodesChange = useCallback((changes: NodeChangeset<CanvasNode>) => {
    setLocalNodes((current) => ({ view, nodes: changes.applyTo(current?.view === view ? current.nodes : nodes) }))
  }, [nodes, setLocalNodes, view])
  const onEdgesChange = useCallback((changes: EdgeChangeset<CanvasEdge>) => {
    setLocalEdges((current) => ({ view, edges: changes.applyTo(current?.view === view ? current.edges : edges) }))
  }, [edges, setLocalEdges, view])

  const onDelete = useCallback(({ edges: deletedEdges }: { nodes: CanvasNode[]; edges: CanvasEdge[] }) => {
    if (view !== 'erd' || deletedEdges.length === 0) return
    const ids = new Set(deletedEdges.map((edge) => edge.id))
    const refs = new Set(baseErdEdges.filter((edge) => ids.has(edge.id)).map((edge) => `${edge.source}:${edge.sourceHandle?.replace(/-source$/, '')}`))
    if (refs.size) onUpdateProject({ ...project, data: { ...project.data, entities: project.data.entities.map((entity) => ({ ...entity, fields: entity.fields.map((field) => refs.has(`${entity.id}:${field.id}`) ? { ...field, references: undefined, onDelete: undefined } : field) })) } })
  }, [baseErdEdges, onUpdateProject, project, view])

  const onConnect = useCallback((connection: Connection) => {
    if (view !== 'erd' || !connection.source || !connection.target || !connection.sourceHandle || !connection.targetHandle) return
    const sourceFieldId = connection.sourceHandle.replace(/-source$/, '')
    const targetFieldId = connection.targetHandle.replace(/-target$/, '')
    const sourceEntity = project.data.entities.find((entity) => entity.id === connection.source)
    const targetEntity = project.data.entities.find((entity) => entity.id === connection.target)
    const sourceField = sourceEntity?.fields.find((field) => field.id === sourceFieldId)
    const targetField = targetEntity?.fields.find((field) => field.id === targetFieldId)
    if (!sourceEntity || !targetEntity || !sourceField || !targetField || sourceField.id === targetField.id) return
    const nextField: EntityFieldSpec = { ...sourceField, references: { entity: targetEntity.name, field: targetField.name }, onDelete: sourceField.onDelete ?? 'restrict' }
    const nextProject = { ...project, data: { ...project.data, entities: project.data.entities.map((entity) => entity.id === sourceEntity.id ? { ...entity, fields: entity.fields.map((field) => field.id === sourceField.id ? nextField : field) } : entity) } }
    onUpdateProject(nextProject)
  }, [onUpdateProject, project, view])

  const autoLayout = () => {
    const laidOut = layoutNodes(nodes, edges, view === 'erd' ? 'LR' : 'TB')
    if (view === 'erd') {
      const positions = new Map(laidOut.map((node) => [node.id, node.position]))
      setLocalNodes({ view, nodes: laidOut })
      onUpdateProject({ ...project, data: { ...project.data, entities: project.data.entities.map((entity) => ({ ...entity, position: positions.get(entity.id) ?? entity.position })) } })
    } else setLocalNodes({ view, nodes: laidOut })
    setLocalEdges({ view, edges })
  }

  const changeView = (next: View) => { onViewChange(next); setLocalNodes(null); setLocalEdges(null) }
  const handleViewTabKeyDown = (event: KeyboardEvent<HTMLButtonElement>, current: View) => {
    const currentIndex = tabs.findIndex((tab) => tab.id === current)
    let nextIndex: number | undefined
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') nextIndex = (currentIndex + 1) % tabs.length
    if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') nextIndex = (currentIndex - 1 + tabs.length) % tabs.length
    if (event.key === 'Home') nextIndex = 0
    if (event.key === 'End') nextIndex = tabs.length - 1
    if (nextIndex === undefined) return
    event.preventDefault()
    const nextView = tabs[nextIndex].id
    changeView(nextView)
    tabRefs.current[nextView]?.focus()
  }
  const activeTabId = `canvas-tab-${view}`
  const currentLabel = ['SCOPE', 'STACK', 'DATA', 'UI'][activeStep] ?? 'DATA'

  if (mode === 'plan') return <main className="center-canvas plan-canvas">
    <div className="plan-toolbar"><div><span className="micro-label">PHASE 0{activeStep + 1} / 04</span><strong>{['Product definition', 'Technology choices', 'System architecture', 'Experience & delivery'][activeStep]}</strong></div><Button type="button" className="flow-action" onClick={() => onModeChange('canvas')}>OPEN CANVAS →</Button></div>
    <div className="plan-editor-scroll"><AnimatePresence mode="wait" initial={false}><motion.div key={activeStep} initial={{ opacity: 0, x: reduceMotion ? 0 : 5 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: reduceMotion ? 0 : -3 }} transition={{ duration: 0.14, ease: [0.25, 0.46, 0.45, 0.94] }}>{activeStep === 0 && <Step1ScopeForm project={project} onChange={onUpdateProject} />}{activeStep === 1 && <Step2StackForm project={project} onChange={onUpdateProject} />}{activeStep === 2 && <Step3DataApiForm project={project} onChange={onUpdateProject} />}{activeStep === 3 && <><Step4DesignForm project={project} onChange={onUpdateProject} /><ResourceLinks project={project} onChange={onUpdateProject} /></>}</motion.div></AnimatePresence></div>
  </main>

  return <main className="center-canvas">
    <div className="canvas-toolbar canvas-toolbar-views">
      <div className="canvas-context"><Button type="button" className="canvas-view-tab" onClick={() => onModeChange('plan')}>← PLAN</Button><span>[0{activeStep + 1} // {currentLabel}]</span><span>/</span><strong>{view === 'erd' ? 'RELATIONAL SCHEMA' : view === 'topology' ? 'SYSTEM TOPOLOGY' : 'TOKEN VERIFICATION'}</strong></div>
      <div className="canvas-view-switcher" role="tablist" aria-label="Canvas view">
        {tabs.map(({ id, label, icon: Icon }) => <Button key={id} ref={(element) => { tabRefs.current[id] = element }} id={`canvas-tab-${id}`} type="button" role="tab" aria-selected={view === id} aria-controls="canvas-panel" tabIndex={view === id ? 0 : -1} className="canvas-view-tab focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] focus-visible:ring-offset-2 hover:bg-[var(--bg-elevated)] active:translate-y-px motion-reduce:transform-none disabled:cursor-not-allowed disabled:bg-[var(--bg-elevated)] disabled:text-[var(--text-primary)]" onKeyDown={(event) => handleViewTabKeyDown(event, id)} onClick={() => changeView(id)}><Icon size={13} />{label}{view === id && <motion.span aria-hidden="true" className="tab-active-indicator" layoutId="canvas-active-tab" transition={reduceMotion ? { duration: 0 } : { duration: 0.14, ease: [0.25, 0.46, 0.45, 0.94] }} />}</Button>)}
      </div>
    </div>
    <div className="canvas-flow-tools">
      <span className="canvas-coordinate">{view === 'erd' ? `${project.data.entities.length} TABLES / ${baseErdEdges.length} RELATIONS` : view === 'topology' ? `${topology.nodes.length} SERVICES / ${topology.edges.length} LINKS` : 'DESIGN TOKENS / LIVE'}</span>
      {view !== 'preview' && <ClickSpark><Button className="flow-action focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] focus-visible:ring-offset-2 hover:bg-[var(--bg-elevated)] active:translate-y-px motion-reduce:transform-none disabled:cursor-not-allowed disabled:bg-[var(--bg-elevated)] disabled:text-[var(--text-primary)]" onClick={autoLayout}><GridFour size={13} /> AUTO-LAYOUT</Button></ClickSpark>}
      {view === 'preview' && <span className="canvas-coordinate"><ArrowLineDown size={12} /> EXPORT PREVIEW</span>}
    </div>
    <div id="canvas-panel" role="tabpanel" aria-labelledby={activeTabId} tabIndex={0} className={`canvas-scroll canvas-flow-area ${view === 'preview' ? 'preview-area' : ''}`}>
      {view === 'preview' ? <DesignPreviewCard project={project} /> : view === 'erd' && project.data.entities.length === 0 ? <div className="canvas-empty-state"><Database size={22} /><h2>No entities in the schema</h2><p>Add your first entity to map fields and relationships.</p><Button className="flow-action focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] focus-visible:ring-offset-2 hover:bg-[var(--bg-elevated)] active:translate-y-px motion-reduce:transform-none disabled:cursor-not-allowed disabled:bg-[var(--bg-elevated)] disabled:text-[var(--text-primary)]" onClick={() => onSelectStep(2)}>Open data editor</Button></div> : <ReactFlow<CanvasNode, CanvasEdge>
        key={view}
        nodes={flowNodes}
        edges={flowEdges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onDelete={onDelete}
        onConnect={onConnect}
        onNodeDragStop={(_, node) => { if (view === 'erd') onUpdateProject({ ...project, data: { ...project.data, entities: project.data.entities.map((entity) => entity.id === node.id ? { ...entity, position: node.position } : entity) } }) }}
        nodesDraggable
        nodesConnectable={view === 'erd'}
        elementsSelectable
        fitView
        fitViewOptions={{ padding: 0.08 }}
        minZoom={0.25}
        maxZoom={2}
      ><Background gap={16} size={1} color="var(--border-strong)" /><Controls showInteractive={false} /></ReactFlow>}
    </div>
  </main>
}

function ResourceLinks({ project, onChange }: { project: ProjectSpec; onChange: (project: ProjectSpec) => void }) {
  const resources = project.resources ?? []
  return <section className="step-editor editor-section"><div className="editor-title">Project resources<span>LINKS & NOTES</span></div><p className="editor-empty">Keep useful documentation, repositories, and references beside the plan. Links and notes are included in the handoff bundle.</p>{resources.map((item) => <div className="editor-block" key={item.id}><label className="editor-field"><span>LABEL</span><TextInput value={item.label} onChange={(event) => onChange({ ...project, resources: resources.map((resource) => resource.id === item.id ? { ...resource, label: event.target.value } : resource) })} /></label><label className="editor-field"><span>URL</span><TextInput type="url" value={item.url} onChange={(event) => onChange({ ...project, resources: resources.map((resource) => resource.id === item.id ? { ...resource, url: event.target.value } : resource) })} /></label><label className="editor-field"><span>NOTES</span><TextArea value={item.notes} rows={2} onChange={(event) => onChange({ ...project, resources: resources.map((resource) => resource.id === item.id ? { ...resource, notes: event.target.value } : resource) })} /></label><Button className="editor-add" onClick={() => onChange({ ...project, resources: resources.filter((resource) => resource.id !== item.id) })}>Remove link</Button></div>)}<Button className="editor-add" onClick={() => onChange({ ...project, resources: [...resources, { id: crypto.randomUUID(), label: '', url: '', notes: '' }] })}>+ Add resource</Button></section>
}
