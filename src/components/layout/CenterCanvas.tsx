import { useCallback, useMemo, useState } from 'react'
import { ReactFlow, Background, Controls, type Connection, type Edge, type EdgeChangeset, type NodeChangeset } from '@xyflow/react'
import dagre from 'dagre'
import { ArrowDownToLine, Database, LayoutGrid, Network, Palette, Rows3 } from 'lucide-react'
import { DesignPreviewCard } from '../canvas/DesignPreviewCard'
import { EntityNode, type EntityNodeData, type EntityNodeType } from '../canvas/EntityNode'
import { ServiceNode, type ServiceNodeData, type ServiceNodeType } from '../canvas/ServiceNode'
import type { EntityFieldSpec, ProjectSpec } from '../../types/spec.types'

type View = 'erd' | 'topology' | 'preview'
type CanvasNode = EntityNodeType | ServiceNodeType
type CanvasEdge = Edge

const nodeTypes = { entity: EntityNode, service: ServiceNode }
const tabs: { id: View; label: string; icon: typeof Rows3 }[] = [
  { id: 'erd', label: 'ERD SCHEMA', icon: Rows3 },
  { id: 'topology', label: 'SYSTEM TOPOLOGY', icon: Network },
  { id: 'preview', label: 'UI TOKEN PREVIEW', icon: Palette },
]

interface CenterCanvasProps {
  project: ProjectSpec
  activeStep: number
  onSelectStep: (step: number) => void
  onUpdateProject: (project: ProjectSpec) => void
}

function getErdNodes(project: ProjectSpec): CanvasNode[] {
  return project.data.entities.map((entity) => ({
    id: entity.id,
    type: 'entity',
    position: entity.position,
    data: { label: entity.name, rlsPolicy: entity.rlsPolicy, indexes: entity.indexes, fields: entity.fields },
  }))
}

function getErdEdges(project: ProjectSpec): CanvasEdge[] {
  return project.data.entities.flatMap((source) => source.fields.flatMap((field) => {
    if (!field.references) return []
    const target = project.data.entities.find((entity) => entity.name === field.references?.entity)
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
    }]
  }))
}

function getTopology(project: ProjectSpec): { nodes: CanvasNode[]; edges: CanvasEdge[] } {
  const nodes: CanvasNode[] = []
  const links: [string, string][] = []
  const push = (id: string, label: string, detail: string, kind: ServiceNodeData['kind']) => {
    nodes.push({ id, type: 'service', position: { x: 0, y: 0 }, data: { label, detail, kind, palette: { accent: project.designTokens.colors.accent ?? '#FF4F00', panel: project.designTokens.colors.panel ?? '#121316', primary: project.designTokens.colors.primary ?? '#F2F0EB', secondary: project.designTokens.colors.secondary ?? '#A0A5B1' } } })
  }
  push('client', 'Client App', project.stack.frontend || 'Frontend client', 'client')
  push('api', 'API Layer', project.stack.backend || 'API service', 'api')
  push('database', 'Database', project.stack.database || 'Data store', 'database')
  push('auth', 'Auth Provider', project.stack.authStrategy || 'Authentication', 'auth')
  links.push(['client', 'api'], ['api', 'database'], ['client', 'auth'], ['api', 'auth'])
  project.apis.webhooks.forEach((hook, index) => {
    const id = `webhook-${index}`
    push(id, hook.provider || `Webhook ${index + 1}`, `${hook.event || 'External event'} → ${hook.path || '/webhook'}`, 'webhook')
    links.push([id, 'api'])
  })
  return { nodes, edges: links.map(([source, target], index) => ({ id: `topology-${index}`, source, target, type: 'smoothstep', className: 'topology-edge' })) }
}

function layoutNodes(nodes: CanvasNode[], edges: CanvasEdge[], direction: 'LR' | 'TB'): CanvasNode[] {
  const graph = new dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}))
  graph.setGraph({ rankdir: direction, nodesep: 44, ranksep: 100, marginx: 36, marginy: 36 })
  nodes.forEach((node) => graph.setNode(node.id, { width: node.type === 'entity' ? 258 : 230, height: node.type === 'entity' ? 80 + ((node.data as EntityNodeData).fields.length * 29) : 88 }))
  edges.forEach((edge) => graph.setEdge(edge.source, edge.target))
  dagre.layout(graph)
  return nodes.map((node) => {
    const point = graph.node(node.id)
    const width = node.type === 'entity' ? 258 : 230
    const height = node.type === 'entity' ? 80 + ((node.data as EntityNodeData).fields.length * 29) : 88
    return { ...node, position: { x: point.x - width / 2, y: point.y - height / 2 } }
  })
}

export function CenterCanvas({ project, activeStep, onSelectStep, onUpdateProject }: CenterCanvasProps) {
  const [view, setView] = useState<View>('erd')
  const [localNodes, setLocalNodes] = useState<CanvasNode[] | null>(null)
  const [localEdges, setLocalEdges] = useState<CanvasEdge[] | null>(null)
  const baseErdNodes = useMemo(() => getErdNodes(project), [project.data.entities])
  const baseErdEdges = useMemo(() => getErdEdges(project), [project.data.entities])
  const topology = useMemo(() => getTopology(project), [project.stack, project.apis.webhooks, project.designTokens])
  const nodes = view === 'erd' ? baseErdNodes : topology.nodes
  const edges = view === 'erd' ? baseErdEdges : topology.edges
  const flowNodes = (localNodes ?? nodes).map((node) => ({ ...node, data: nodes.find((latest) => latest.id === node.id)?.data ?? node.data })) as CanvasNode[]
  const flowEdges = localEdges ?? edges

  const onNodesChange = useCallback((changes: NodeChangeset<CanvasNode>) => {
    setLocalNodes((current) => changes.applyTo(current ?? nodes))
  }, [nodes])
  const onEdgesChange = useCallback((changes: EdgeChangeset<CanvasEdge>) => {
    setLocalEdges((current) => changes.applyTo(current ?? edges))
  }, [edges])

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
      setLocalNodes(laidOut)
      onUpdateProject({ ...project, data: { ...project.data, entities: project.data.entities.map((entity) => ({ ...entity, position: positions.get(entity.id) ?? entity.position })) } })
    } else setLocalNodes(laidOut)
    setLocalEdges(edges)
  }

  const changeView = (next: View) => { setView(next); setLocalNodes(null); setLocalEdges(null) }
  const currentLabel = ['SCOPE', 'STACK', 'DATA', 'UI'][activeStep] ?? 'DATA'

  return <main className="center-canvas">
    <div className="canvas-toolbar canvas-toolbar-views">
      <div className="canvas-context"><span>[0{activeStep + 1} // {currentLabel}]</span><span>/</span><strong>{view === 'erd' ? 'RELATIONAL SCHEMA' : view === 'topology' ? 'SYSTEM TOPOLOGY' : 'TOKEN VERIFICATION'}</strong></div>
      <div className="canvas-view-switcher" role="tablist" aria-label="Canvas view">
        {tabs.map(({ id, label, icon: Icon }) => <button key={id} role="tab" aria-selected={view === id} className="canvas-view-tab" onClick={() => changeView(id)}><Icon size={13} />{label}</button>)}
      </div>
    </div>
    <div className="canvas-flow-tools">
      <span className="canvas-coordinate">{view === 'erd' ? `${project.data.entities.length} TABLES / ${baseErdEdges.length} RELATIONS` : view === 'topology' ? `${topology.nodes.length} SERVICES / ${topology.edges.length} LINKS` : 'DESIGN TOKENS / LIVE'}</span>
      {view !== 'preview' && <button className="flow-action" onClick={autoLayout}><LayoutGrid size={13} /> AUTO-LAYOUT</button>}
      {view === 'preview' && <span className="canvas-coordinate"><ArrowDownToLine size={12} /> EXPORT PREVIEW</span>}
    </div>
    <div className={`canvas-scroll canvas-flow-area ${view === 'preview' ? 'preview-area' : ''}`}>
      {view === 'preview' ? <DesignPreviewCard project={project} /> : view === 'erd' && project.data.entities.length === 0 ? <div className="canvas-empty-state"><Database size={22} /><h2>No entities in the schema</h2><p>Add your first entity to map fields and relationships.</p><button className="flow-action" onClick={() => onSelectStep(2)}>OPEN DATA EDITOR</button></div> : <ReactFlow<CanvasNode, CanvasEdge>
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
        fitViewOptions={{ padding: 0.18 }}
        minZoom={0.25}
        maxZoom={1.5}
        proOptions={{ hideAttribution: true }}
      ><Background gap={16} size={1} color="var(--border-strong)" /><Controls showInteractive={false} /></ReactFlow>}
    </div>
  </main>
}
