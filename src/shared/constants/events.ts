import type { Event } from '../types'

export const INITIAL_EVENTS: Event[] = [
  {
    id: 1,
    title: 'Visita guiada — Turma de Agronomia UFRN',
    date: '2026-10-10',
    time: '09:00',
    capacity: 30,
    description: 'Tour pela horta com foco em técnicas de compostagem e cultivo orgânico.',
    createdBy: 'Ana Beatriz Costa',
  },
  {
    id: 2,
    title: 'Oficina de Plantio',
    date: '2026-10-18',
    time: '14:00',
    capacity: 20,
    description: 'Atividade prática de semeadura e transplante de mudas.',
    createdBy: 'Ana Beatriz Costa',
  },
]
