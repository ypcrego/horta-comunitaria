import type { Canteiro, CanteiroStatus, PlantingRecordType, Production } from '../types'

export const PRODUCTION_TYPES = ['Raízes', 'Folhas', 'Frutos', 'Sementes', 'Flores', 'Composto']

export const INITIAL_PRODUCTIONS: Production[] = [
  { id: 1, type: 'Folhas', weightKg: 12.5, date: '2026-09-10', registeredBy: 'Ana Beatriz Costa' },
  { id: 2, type: 'Frutos', weightKg: 8.3, date: '2026-09-15', registeredBy: 'Ana Beatriz Costa' },
  { id: 3, type: 'Composto', weightKg: 45.0, date: '2026-09-20', registeredBy: 'Ana Beatriz Costa' },
  { id: 4, type: 'Raízes', weightKg: 6.8, date: '2026-09-25', registeredBy: 'Ana Beatriz Costa' },
]

export const CANTEIROS_STORAGE_KEY = 'horta-comunitaria:canteiros:v1'

export const CANTEIRO_STATUSES: CanteiroStatus[] = ['em-cultivo', 'em-preparo', 'em-descanso']

export const CANTEIRO_STATUS_LABELS: Record<CanteiroStatus, string> = {
  'em-cultivo': 'Em cultivo',
  'em-preparo': 'Em preparo',
  'em-descanso': 'Em descanso',
}

export const PLANTING_RECORD_TYPES: PlantingRecordType[] = ['plantio', 'manejo', 'colheita']

export const PLANTING_RECORD_TYPE_LABELS: Record<PlantingRecordType, string> = {
  plantio: 'Plantio',
  manejo: 'Manejo',
  colheita: 'Colheita',
}

export const INITIAL_CANTEIROS: Canteiro[] = [
  {
    id: 1,
    name: 'Canteiro 1',
    sector: 'Setor A — Hortaliças',
    currentCulture: 'Alface crespa',
    status: 'em-cultivo',
    responsible: 'Ana Beatriz Costa',
    plantedAt: '2026-09-12',
  },
  {
    id: 2,
    name: 'Canteiro 2',
    sector: 'Setor A — Hortaliças',
    currentCulture: 'Couve-manteiga',
    status: 'em-cultivo',
    responsible: 'Carlos Eduardo Lima',
    plantedAt: '2026-09-18',
  },
  {
    id: 3,
    name: 'Canteiro 3',
    sector: 'Setor A — Hortaliças',
    currentCulture: 'Cenoura',
    status: 'em-preparo',
    responsible: 'Mariana Alves',
    plantedAt: null,
  },
  {
    id: 4,
    name: 'Canteiro 4',
    sector: 'Setor B — Raízes e Tubérculos',
    currentCulture: 'Batata-doce',
    status: 'em-cultivo',
    responsible: 'João Pedro Santos',
    plantedAt: '2026-08-30',
  },
  {
    id: 5,
    name: 'Canteiro 5',
    sector: 'Setor B — Raízes e Tubérculos',
    currentCulture: 'Feijão-de-corda',
    status: 'em-descanso',
    responsible: 'Ana Beatriz Costa',
    plantedAt: null,
  },
  {
    id: 6,
    name: 'Canteiro 6',
    sector: 'Setor C — Flores e Compostagem',
    currentCulture: 'Girassol',
    status: 'em-cultivo',
    responsible: 'Mariana Alves',
    plantedAt: '2026-09-05',
  },
]
