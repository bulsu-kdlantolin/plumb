import Dexie, { type Table } from 'dexie'
import type { ProjectSpec } from '../types/spec.types'

export interface StoredProject {
  id: string
  spec: ProjectSpec
  savedAt: string
  kind?: 'project' | 'example'
}

export interface StoredSetting { key: string; value: string }

class PlumbDatabase extends Dexie {
  projects!: Table<StoredProject, string>
  settings!: Table<StoredSetting, string>

  constructor() {
    super('plumb-local')
    this.version(1).stores({ projects: '&id, savedAt' })
    this.version(2).stores({ projects: '&id, savedAt, kind', settings: '&key' }).upgrade(async (tx) => {
      const legacy = await tx.table('projects').toCollection().toArray() as StoredProject[]
      for (const project of legacy) {
        if (project.id === 'pulseboard') await tx.table('projects').put({ ...project, kind: 'example' })
        else await tx.table('projects').put({ ...project, kind: 'project' })
      }
    })
  }
}

export const plumbDb = new PlumbDatabase()
