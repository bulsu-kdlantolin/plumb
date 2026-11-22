import { Handle, Position, type Node, type NodeProps } from '@xyflow/react'
import { KeyRound, Link2 } from 'lucide-react'

export interface EntityNodeData extends Record<string, unknown> {
  label: string
  rlsPolicy: string
  indexes: string[]
  fields: { id: string; name: string; type: string; isPrimary: boolean; references?: { entity: string; field: string } }[]
}

export type EntityNodeType = Node<EntityNodeData, 'entity'>

export function EntityNode({ data, selected }: NodeProps<EntityNodeType>) {
  return <div className={`erd-node${selected ? ' is-selected' : ''}`}>
    <div className="erd-node-top" />
    <header className="erd-node-head"><span className="erd-node-name">{data.label}</span><span className="erd-node-tag">TABLE</span></header>
    <div className="erd-node-fields">
      {data.fields.map((field) => <div className="erd-node-field" key={field.id}>
        <Handle id={`${field.id}-target`} type="target" position={Position.Left} className="erd-handle" />
        <span className={`erd-key-badge${field.isPrimary ? ' primary' : field.references ? ' foreign' : ''}`}>{field.isPrimary ? <KeyRound size={9} /> : field.references ? <Link2 size={9} /> : ''}{field.isPrimary ? 'PK' : field.references ? 'FK' : ''}</span>
        <span className="erd-field-name">{field.name}</span><span className="erd-field-type">{field.type}</span>
        <Handle id={`${field.id}-source`} type="source" position={Position.Right} className="erd-handle" />
      </div>)}
    </div>
    <footer className="erd-node-foot"><span>RLS · {data.rlsPolicy ? 'ACTIVE' : 'UNSET'}</span><span>{data.indexes.length} IDX</span></footer>
  </div>
}
