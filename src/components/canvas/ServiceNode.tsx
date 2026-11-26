import { Handle, Position, type Node, type NodeProps } from '@xyflow/react'
import { AppWindow, Fingerprint, Globe, HardDrive, Stack } from '@phosphor-icons/react'

export interface ServiceNodeData extends Record<string, unknown> {
  label: string
  detail: string
  kind: 'client' | 'api' | 'database' | 'auth' | 'webhook'
}

export type ServiceNodeType = Node<ServiceNodeData, 'service'>

const icons = { client: AppWindow, api: Stack, database: HardDrive, auth: Fingerprint, webhook: Globe }

export function ServiceNode({ data }: NodeProps<ServiceNodeType>) {
  const Icon = icons[data.kind]
  return <div className={`service-node service-${data.kind}`}>
    <Handle type="target" position={Position.Left} className="service-handle" />
    <div className="service-icon"><Icon size={16} weight="regular" /></div>
    <div className="service-copy"><span className="service-name">{data.label}</span><span className="service-detail">{data.detail}</span></div>
    <Handle type="source" position={Position.Right} className="service-handle" />
  </div>
}
