export interface Production {
  id: number
  type: string
  weightKg: number
  date: string
  registeredBy: string
}

export type CanteiroStatus = 'em-cultivo' | 'em-preparo' | 'em-descanso'

export type PlantingRecordType = 'plantio' | 'manejo' | 'colheita'

export interface Canteiro {
  id: number
  name: string
  sector: string
  currentCulture: string
  status: CanteiroStatus
  responsible: string
  plantedAt: string | null
}

export interface PlantingRecord {
  id: number
  canteiroId: number
  canteiroName: string
  sector: string
  type: PlantingRecordType
  culture: string
  quantityKg: number | null
  notes: string
  actor: string
  createdAt: string
}

export interface CanteirosState {
  canteiros: Canteiro[]
  records: PlantingRecord[]
}
