import { Plus, X } from 'lucide-react'
import type { ProjectSpec, RouteState } from '../../types/spec.types'

interface Props { project: ProjectSpec; onChange: (project: ProjectSpec) => void }
const states: RouteState[] = ['loading', 'empty', 'error', 'overflow']

type Route = ProjectSpec['scope']['routes'][number]

export function Step1ScopeForm({ project, onChange }: Props) {
  const scope = project.scope
  const set = (patch: Partial<ProjectSpec['scope']>) => onChange({ ...project, scope: { ...scope, ...patch } })
  const updateRoute = (index: number, patch: Partial<Route>) => set({ routes: scope.routes.map((route, at) => at === index ? { ...route, ...patch } : route) })
  const updateList = (key: 'coreLoopSteps' | 'nonGoals', index: number, value: string) => set({ [key]: scope[key].map((item, at) => at === index ? value : item) })

  return <div className="step-editor">
    <div className="editor-title">Scope & roles<span>Layer 01</span></div>
    <label className="editor-field"><span>Elevator pitch</span><textarea value={scope.elevatorPitch} rows={3} onChange={(event) => set({ elevatorPitch: event.target.value })} /></label>
    <label className="editor-field"><span>Target user</span><input value={scope.targetUser} onChange={(event) => set({ targetUser: event.target.value })} /></label>

    <section className="editor-section">
      <div className="editor-section-title">Core loop</div>
      {scope.coreLoopSteps.map((step, index) => <div className="editor-row" key={`loop-${index}`}>
        <span className="editor-index">{String(index + 1).padStart(2, '0')}</span>
        <input aria-label={`Core loop step ${index + 1}`} value={step} onChange={(event) => updateList('coreLoopSteps', index, event.target.value)} />
        <button className="editor-icon" aria-label="Remove step" onClick={() => set({ coreLoopSteps: scope.coreLoopSteps.filter((_, at) => at !== index) })}><X size={13} /></button>
      </div>)}
      <button className="editor-add" onClick={() => set({ coreLoopSteps: [...scope.coreLoopSteps, 'New step'] })}><Plus size={12} /> Add step</button>
    </section>

    <section className="editor-section">
      <div className="editor-section-title">User roles</div>
      {scope.roles.map((role, index) => <div className="editor-block" key={`role-${index}`}>
        <div className="editor-micro-field"><span>ROLE</span><div className="editor-row">
          <input aria-label="Role name" value={role.name} onChange={(event) => set({ roles: scope.roles.map((item, at) => at === index ? { ...item, name: event.target.value } : item) })} />
          <button className="editor-icon" aria-label="Remove role" onClick={() => set({ roles: scope.roles.filter((_, at) => at !== index) })}><X size={13} /></button>
        </div></div>
        <label className="editor-micro-field"><span>PERMISSIONS</span><input aria-label={`Permissions for ${role.name}`} placeholder="Comma-separated permissions" value={role.permissions.join(', ')} onChange={(event) => set({ roles: scope.roles.map((item, at) => at === index ? { ...item, permissions: event.target.value.split(',').map((permission) => permission.trim()).filter(Boolean) } : item) })} /></label>
      </div>)}
      <button className="editor-add" onClick={() => set({ roles: [...scope.roles, { name: 'New role', permissions: [] }] })}><Plus size={12} /> Add role</button>
    </section>

    <section className="editor-section">
      <div className="editor-section-title">Route map</div>
      {scope.routes.length === 0 && <p className="editor-empty">No routes defined. Add a route to start mapping access and UI states.</p>}
      {scope.routes.map((route, index) => <div className="editor-block" key={`route-${index}`}>
        <div className="editor-micro-field"><span>PATH</span><div className="editor-row">
          <input aria-label="Route path" value={route.path} onChange={(event) => updateRoute(index, { path: event.target.value })} />
          <button className="editor-icon" aria-label="Remove route" onClick={() => set({ routes: scope.routes.filter((_, at) => at !== index) })}><X size={13} /></button>
        </div></div>
        <label className="editor-micro-field"><span>REDIRECT</span><input aria-label={`Redirect destination for ${route.path}`} placeholder="No redirect" value={route.redirectTo ?? ''} onChange={(event) => updateRoute(index, { redirectTo: event.target.value })} /></label>
        <label className="editor-check"><input type="checkbox" aria-label={`Authentication required for ${route.path}`} checked={route.authRequired} onChange={(event) => updateRoute(index, { authRequired: event.target.checked })} />Auth required</label>
        <div className="state-toggles">{states.map((state) => <label key={state}><input type="checkbox" aria-label={`${state} state for ${route.path}`} checked={route.states.includes(state)} onChange={(event) => updateRoute(index, { states: event.target.checked ? [...route.states, state] : route.states.filter((item) => item !== state) })} />{state[0].toUpperCase() + state.slice(1)}</label>)}</div>
      </div>)}
      <button className="editor-add" onClick={() => set({ routes: [...scope.routes, { path: '/new-route', authRequired: true, states: ['loading', 'empty', 'error', 'overflow'] }] })}><Plus size={12} /> Add route</button>
    </section>

    <section className="editor-section">
      <div className="editor-section-title">Explicit non-goals</div>
      {scope.nonGoals.map((goal, index) => <div className="editor-row" key={`goal-${index}`}>
        <input aria-label={`Non-goal ${index + 1}`} value={goal} onChange={(event) => updateList('nonGoals', index, event.target.value)} />
        <button className="editor-icon" aria-label="Remove non-goal" onClick={() => set({ nonGoals: scope.nonGoals.filter((_, at) => at !== index) })}><X size={13} /></button>
      </div>)}
      <button className="editor-add" onClick={() => set({ nonGoals: [...scope.nonGoals, 'New non-goal'] })}><Plus size={12} /> Add non-goal</button>
    </section>
  </div>
}
