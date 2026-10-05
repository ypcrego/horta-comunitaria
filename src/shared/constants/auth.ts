import type { Role } from '../types'

export const MOCK_USERS: { email: string; password: string; name: string; role: Role }[] = [
  { email: 'coordenador@ufrn.br', password: 'senha123', name: 'Ana Beatriz Costa', role: 'coordenador' },
  { email: 'voluntario@ufrn.br', password: 'senha123', name: 'Carlos Eduardo Lima', role: 'voluntario' },
]
