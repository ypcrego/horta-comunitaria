import type { Production } from '../types'

export const PRODUCTION_TYPES = ['Raízes', 'Folhas', 'Frutos', 'Sementes', 'Flores', 'Composto']

export const INITIAL_PRODUCTIONS: Production[] = [
  { id: 1, type: 'Folhas', weightKg: 12.5, date: '2026-09-10', registeredBy: 'Ana Beatriz Costa' },
  { id: 2, type: 'Frutos', weightKg: 8.3, date: '2026-09-15', registeredBy: 'Ana Beatriz Costa' },
  { id: 3, type: 'Composto', weightKg: 45.0, date: '2026-09-20', registeredBy: 'Ana Beatriz Costa' },
  { id: 4, type: 'Raízes', weightKg: 6.8, date: '2026-09-25', registeredBy: 'Ana Beatriz Costa' },
]
