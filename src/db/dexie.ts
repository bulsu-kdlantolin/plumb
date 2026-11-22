import Dexie, { type Table } from 'dexie'
import type { ProjectSpec } from '../types/spec.types'

export interface StoredProject {
  id: string
  spec: ProjectSpec
  savedAt: string
}

class PlumbDatabase extends Dexie {
  projects!: Table<StoredProject, string>

  constructor() {
    super('plumb-local')
    this.version(1).stores({ projects: '&id, savedAt' })
  }
}

export const plumbDb = new PlumbDatabase()
