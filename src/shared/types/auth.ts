export type Role = 'coordenador' | 'voluntario'

export interface User {
  name: string
  email: string
  role: Role
}
