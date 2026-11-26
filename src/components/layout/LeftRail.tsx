import { Button } from '../ui/Button'
import { Check, Circle } from '@phosphor-icons/react'
import type { ProjectSpec } from '../../types/spec.types'

const steps = ['PRODUCT', 'TECHNOLOGY', 'SYSTEM', 'EXPERIENCE & DELIVERY']
const layers = ['Scope, roles & routes', 'Architecture, stack, folder & env', 'Data, storage, APIs, jobs & security', 'UI states, design tokens & playbook']
interface LeftRailProps { activeStep: number; onSelectStep: (step: number) => void; project: ProjectSpec; saveStatus: 'loading' | 'saving' | 'saved' | 'offline' }
export function LeftRail({ activeStep, onSelectStep, project, saveStatus }: LeftRailProps) {
  const done = [Boolean(project.scope.elevatorPitch || project.scope.targetUser), Boolean(project.stack.frontend || project.stack.backend || project.stack.database), Boolean(project.data.entities.length || project.apis.endpoints.length || project.securityRules.length), Boolean(project.uiStateMachines.length || project.designTokens.presetId || project.buildPlaybook.length)]
  return <aside className="left-rail">
    <div className="pane-heading"><span className="pane-title">PLAN</span><span className="pane-index">4 PHASES · 8 LAYERS</span></div>
    <nav className="pipeline-list" aria-label="Plan phases">{steps.map((step, index) => <Button key={step} className="pipeline-tab" aria-current={activeStep === index ? 'step' : undefined} onClick={() => onSelectStep(index)}><span className="step-number">[0{index + 1}]</span><span className="step-title">{step}</span>{done[index] ? <Check className="step-check" size={13} /> : <Circle size={10} />}</Button>)}</nav>
    <div className="phase-summary"><span className="micro-label">CURRENT PHASE</span><h2>{steps[activeStep]}</h2><p>{layers[activeStep]}</p><div className="phase-count">{done.filter(Boolean).length} / 4 phases started</div></div>
    <div className="rail-footer"><span>Local-first · saved in this browser</span><span className="rail-save-status" role="status"><i className="status-dot" data-status={saveStatus} />{{ loading: 'Loading', saving: 'Saving', saved: 'Saved locally', offline: 'Memory only' }[saveStatus]}</span></div>
  </aside>
}
