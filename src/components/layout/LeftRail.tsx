import { Check, Circle } from 'lucide-react'
import { Step1ScopeForm } from '../pipeline/Step1ScopeForm'
import { Step2StackForm } from '../pipeline/Step2StackForm'
import { Step3DataApiForm } from '../pipeline/Step3DataApiForm'
import { Step4DesignForm } from '../pipeline/Step4DesignForm'
import type { ProjectSpec } from '../../types/spec.types'

const steps = ['SCOPE & ROLES', 'STACK & ENV', 'DATA & APIS', 'UI & STATES']

interface LeftRailProps {
  activeStep: number
  onSelectStep: (step: number) => void
  counts: { routes: number; entities: number; endpoints: number; envVars: number }
  project: ProjectSpec
  saveStatus: 'loading' | 'saving' | 'saved' | 'offline'
  onChangeProject: (project: ProjectSpec) => void
}

export function LeftRail({ activeStep, onSelectStep, counts, project, saveStatus, onChangeProject }: LeftRailProps) {
  const editorProps = { project, onChange: onChangeProject }
  const saveLabel = { loading: 'LOADING LOCAL SPEC', saving: 'SAVING LOCAL SPEC', saved: 'LOCAL SPEC SAVED', offline: 'IN-MEMORY ONLY' }[saveStatus]
  return (
    <aside className="left-rail">
      <div className="pane-heading"><span className="pane-title">WORKBENCH PIPELINE</span><span className="pane-index">4 STEPS</span></div>
      <nav className="pipeline-list" aria-label="Architecture pipeline">
        {steps.map((step, index) => (
          <button key={step} className="pipeline-tab" aria-current={activeStep === index ? 'step' : undefined} onClick={() => onSelectStep(index)}>
            <span className="step-number">[0{index + 1}]</span><span className="step-title">{step}</span>{index < activeStep ? <Check className="step-check" size={13} /> : <Circle size={10} />}
          </button>
        ))}
      </nav>
      <div className="editor-scroll" key={activeStep}>
        {activeStep === 0 && <Step1ScopeForm {...editorProps} />}
        {activeStep === 1 && <Step2StackForm {...editorProps} />}
        {activeStep === 2 && <Step3DataApiForm {...editorProps} />}
        {activeStep === 3 && <Step4DesignForm {...editorProps} />}
      </div>
      <div className="rail-footer">
        <span>{counts.entities} ENTITIES · {counts.endpoints} API CONTRACTS</span>
        <span className="rail-save-status" role="status" aria-live="polite"><i className="status-dot" data-status={saveStatus} />{saveLabel}</span>
      </div>
    </aside>
  )
}
