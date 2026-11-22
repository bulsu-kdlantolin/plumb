import { Handle, Position, type Node, type NodeProps } from '@xyflow/react'
import { AppWindow, Fingerprint, Globe2, HardDrive, Server } from 'lucide-react'

export interface ServiceNodeData extends Record<string, unknown> {
  label: string
  detail: string
  kind: 'client' | 'api' | 'database' | 'auth' | 'webhook'
  palette: { accent: string; panel: string; primary: string; secondary: string }
}

export type ServiceNodeType = Node<ServiceNodeData, 'service'>

const icons = { client: AppWindow, api: Server, database: HardDrive, auth: Fingerprint, webhook: Globe2 }

export function ServiceNode({ data }: NodeProps<ServiceNodeType>) {
  const Icon = icons[data.kind]
  return <div className={`service-node service-${data.kind}`} style={{ '--service-accent': data.palette.accent, '--service-panel': data.palette.panel, '--service-primary': data.palette.primary, '--service-secondary': data.palette.secondary } as React.CSSProperties}>
    <Handle type="target" position={Position.Left} className="service-handle" />
    <div className="service-icon"><Icon size={16} strokeWidth={1.8} /></div>
    <div className="service-copy"><span className="service-name">{data.label}</span><span className="service-detail">{data.detail}</span></div>
    <Handle type="source" position={Position.Right} className="service-handle" />
  </div>
}
