import { useState } from 'react'

type Role = 'coordenador' | 'voluntario'

interface User {
  name: string
  email: string
  role: Role
}

interface Production {
  id: number
  type: string
  weightKg: number
  date: string
  registeredBy: string
}

interface Event {
  id: number
  title: string
  date: string
  time: string
  capacity: number
  description: string
  createdBy: string
}

const MOCK_USERS: { email: string; password: string; name: string; role: Role }[] = [
  { email: 'coordenador@ufrn.br', password: 'senha123', name: 'Ana Beatriz Costa', role: 'coordenador' },
  { email: 'voluntario@ufrn.br', password: 'senha123', name: 'Carlos Eduardo Lima', role: 'voluntario' },
]

const PRODUCTION_TYPES = ['Raízes', 'Folhas', 'Frutos', 'Sementes', 'Flores', 'Composto']

const INITIAL_PRODUCTIONS: Production[] = [
  { id: 1, type: 'Folhas', weightKg: 12.5, date: '2026-09-10', registeredBy: 'Ana Beatriz Costa' },
  { id: 2, type: 'Frutos', weightKg: 8.3, date: '2026-09-15', registeredBy: 'Ana Beatriz Costa' },
  { id: 3, type: 'Composto', weightKg: 45.0, date: '2026-09-20', registeredBy: 'Ana Beatriz Costa' },
  { id: 4, type: 'Raízes', weightKg: 6.8, date: '2026-09-25', registeredBy: 'Ana Beatriz Costa' },
]

const INITIAL_EVENTS: Event[] = [
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

function formatDate(dateStr: string) {
  const [y, m, d] = dateStr.split('-')
  return `${d}/${m}/${y}`
}

function today() {
  return new Date().toISOString().split('T')[0]
}

// ── Login ────────────────────────────────────────────────────────────────────

function LoginPage({ onLogin }: { onLogin: (user: User) => void }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setTimeout(() => {
      const match = MOCK_USERS.find((u) => u.email === email && u.password === password)
      if (match) {
        onLogin({ name: match.name, email: match.email, role: match.role })
      } else {
        setError('E-mail ou senha incorretos.')
      }
      setLoading(false)
    }, 600)
  }

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--background)' }}>
      {/* Sidebar panel */}
      <div
        className="hidden md:flex flex-col justify-between w-80 p-10"
        style={{ background: 'var(--primary)' }}
      >
        <div>
          <div className="mb-8">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
              <circle cx="20" cy="20" r="20" fill="#f4ede0" fillOpacity="0.12" />
              <path d="M20 8c0 0-8 6-8 14a8 8 0 0016 0c0-8-8-14-8-14z" fill="#f4ede0" fillOpacity="0.9" />
              <path d="M20 14v14M14 20h12" stroke="var(--primary)" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
          <h1
            className="text-3xl leading-tight mb-3"
            style={{ fontFamily: 'Fraunces, serif', color: 'var(--primary-foreground)' }}
          >
            Horta Comunitária UFRN
          </h1>
          <p className="text-sm leading-relaxed" style={{ color: '#a8c5b0' }}>
            Sistema de gestão de produção, compostagem e eventos da horta universitária.
          </p>
        </div>
        <div className="text-xs" style={{ color: '#7aad8a' }}>
          <p className="mb-1 font-semibold uppercase tracking-widest text-[10px]">Acesso de demonstração</p>
          <p>coordenador@ufrn.br</p>
          <p>voluntario@ufrn.br</p>
          <p className="mt-1 opacity-70">senha: senha123</p>
        </div>
      </div>

      {/* Form panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-10 md:hidden">
            <h1
              className="text-2xl mb-1"
              style={{ fontFamily: 'Fraunces, serif', color: 'var(--primary)' }}
            >
              Horta UFRN
            </h1>
          </div>
          <h2
            className="text-2xl mb-1"
            style={{ fontFamily: 'Fraunces, serif', color: 'var(--foreground)' }}
          >
            Entrar no sistema
          </h2>
          <p className="text-sm mb-8" style={{ color: 'var(--muted-foreground)' }}>
            Acesso restrito a membros da horta comunitária.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-medium uppercase tracking-widest mb-2" style={{ color: 'var(--muted-foreground)' }}>
                E-mail
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="seu@email.com"
                className="w-full px-4 py-3 text-sm outline-none transition-all"
                style={{
                  background: 'var(--card)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)',
                  color: 'var(--foreground)',
                }}
                onFocus={(e) => (e.target.style.borderColor = 'var(--primary)')}
                onBlur={(e) => (e.target.style.borderColor = 'var(--border)')}
              />
            </div>
            <div>
              <label className="block text-xs font-medium uppercase tracking-widest mb-2" style={{ color: 'var(--muted-foreground)' }}>
                Senha
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full px-4 py-3 text-sm outline-none transition-all"
                style={{
                  background: 'var(--card)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)',
                  color: 'var(--foreground)',
                }}
                onFocus={(e) => (e.target.style.borderColor = 'var(--primary)')}
                onBlur={(e) => (e.target.style.borderColor = 'var(--border)')}
              />
            </div>

            {error && (
              <div
                className="px-4 py-3 text-sm"
                style={{
                  background: '#fdf0ec',
                  border: '1px solid #e2a090',
                  borderRadius: 'var(--radius)',
                  color: 'var(--accent)',
                }}
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 text-sm font-semibold uppercase tracking-widest transition-opacity"
              style={{
                background: 'var(--primary)',
                color: 'var(--primary-foreground)',
                borderRadius: 'var(--radius)',
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? 'Verificando…' : 'Entrar'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

// ── Shell / Sidebar ──────────────────────────────────────────────────────────

type Tab = 'dashboard' | 'producao' | 'eventos'

function Sidebar({
  user,
  activeTab,
  onTabChange,
  onLogout,
}: {
  user: User
  activeTab: Tab
  onTabChange: (t: Tab) => void
  onLogout: () => void
}) {
  const navItems: { id: Tab; label: string; icon: React.ReactNode; coordOnly?: boolean }[] = [
    {
      id: 'dashboard',
      label: 'Painel',
      icon: (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <rect x="1" y="1" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.3" />
          <rect x="9" y="1" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.3" />
          <rect x="1" y="9" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.3" />
          <rect x="9" y="9" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.3" />
        </svg>
      ),
    },
    {
      id: 'producao',
      label: 'Produção',
      icon: (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M8 2c0 0-5 3.5-5 8a5 5 0 0010 0c0-4.5-5-8-5-8z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
          <path d="M8 7v5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
        </svg>
      ),
      coordOnly: false,
    },
    {
      id: 'eventos',
      label: 'Eventos',
      icon: (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <rect x="2" y="3" width="12" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
          <path d="M5 1v3M11 1v3M2 7h12" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
        </svg>
      ),
    },
  ]

  return (
    <aside
      className="flex flex-col h-screen w-56 shrink-0"
      style={{ background: 'var(--primary)', position: 'sticky', top: 0 }}
    >
      <div className="px-5 pt-7 pb-6 border-b" style={{ borderColor: '#2d6040' }}>
        <div className="flex items-center gap-2 mb-1">
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <circle cx="11" cy="11" r="11" fill="#f4ede0" fillOpacity="0.1" />
            <path d="M11 4c0 0-5 3.5-5 8a5 5 0 0010 0c0-4.5-5-8-5-8z" fill="#f4ede0" fillOpacity="0.85" />
          </svg>
          <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#a8c5b0' }}>
            Horta UFRN
          </span>
        </div>
      </div>

      <nav className="flex-1 py-4 px-3 space-y-0.5">
        {navItems.map((item) => {
          const active = activeTab === item.id
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-left transition-all"
              style={{
                borderRadius: 'var(--radius)',
                background: active ? 'rgba(244,237,224,0.12)' : 'transparent',
                color: active ? '#f4ede0' : '#a8c5b0',
                fontWeight: active ? 500 : 400,
              }}
            >
              <span style={{ opacity: active ? 1 : 0.7 }}>{item.icon}</span>
              {item.label}
            </button>
          )
        })}
      </nav>

      <div className="px-4 py-5 border-t" style={{ borderColor: '#2d6040' }}>
        <div className="mb-3">
          <p className="text-xs font-semibold truncate" style={{ color: '#f4ede0' }}>
            {user.name}
          </p>
          <p className="text-xs truncate" style={{ color: '#7aad8a' }}>
            {user.role === 'coordenador' ? 'Coordenador(a)' : 'Voluntário(a)'}
          </p>
        </div>
        <button
          onClick={onLogout}
          className="w-full text-xs py-2 px-3 text-left transition-opacity hover:opacity-80"
          style={{
            background: 'rgba(244,237,224,0.08)',
            color: '#a8c5b0',
            borderRadius: 'var(--radius)',
          }}
        >
          Sair do sistema
        </button>
      </div>
    </aside>
  )
}

// ── Dashboard ────────────────────────────────────────────────────────────────

function Dashboard({
  user,
  productions,
  events,
}: {
  user: User
  productions: Production[]
  events: Event[]
}) {
  const totalKg = productions.reduce((s, p) => s + p.weightKg, 0)
  const compostKg = productions.filter((p) => p.type === 'Composto').reduce((s, p) => s + p.weightKg, 0)
  const foodKg = totalKg - compostKg
  const upcoming = events.filter((e) => e.date >= today()).length

  const stats = [
    { label: 'Total produzido', value: `${totalKg.toFixed(1)} kg`, sub: 'acumulado geral' },
    { label: 'Alimentos', value: `${foodKg.toFixed(1)} kg`, sub: 'raízes, folhas, frutos…' },
    { label: 'Composto', value: `${compostKg.toFixed(1)} kg`, sub: 'compostagem orgânica' },
    { label: 'Eventos futuros', value: String(upcoming), sub: 'próximos agendados' },
  ]

  return (
    <div>
      <div className="mb-8">
        <h2
          className="text-3xl mb-1"
          style={{ fontFamily: 'Fraunces, serif', color: 'var(--foreground)' }}
        >
          Bom dia, {user.name.split(' ')[0]}.
        </h2>
        <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
          {user.role === 'coordenador'
            ? 'Você tem acesso completo ao sistema de gestão.'
            : 'Você está logado como voluntário — acesso de leitura.'}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
        {stats.map((s, i) => (
          <div
            key={i}
            className="px-6 py-5"
            style={{
              background: 'var(--card)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
            }}
          >
            <p className="text-xs uppercase tracking-widest mb-2" style={{ color: 'var(--muted-foreground)' }}>
              {s.label}
            </p>
            <p
              className="text-3xl mb-0.5"
              style={{ fontFamily: 'Fraunces, serif', color: 'var(--primary)' }}
            >
              {s.value}
            </p>
            <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
              {s.sub}
            </p>
          </div>
        ))}
      </div>

      {/* Recent productions */}
      <div
        className="mb-6 p-5"
        style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}
      >
        <h3
          className="text-base mb-4"
          style={{ fontFamily: 'Fraunces, serif', color: 'var(--foreground)' }}
        >
          Últimos registros de produção
        </h3>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              {['Data', 'Tipo', 'Peso (kg)'].map((h) => (
                <th
                  key={h}
                  className="text-left pb-2 text-xs uppercase tracking-widest font-medium"
                  style={{ color: 'var(--muted-foreground)' }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {productions.slice(-5).reverse().map((p) => (
              <tr key={p.id} style={{ borderBottom: '1px solid var(--muted)' }}>
                <td className="py-2.5" style={{ color: 'var(--muted-foreground)', fontVariantNumeric: 'tabular-nums' }}>
                  {formatDate(p.date)}
                </td>
                <td className="py-2.5">
                  <TypeBadge type={p.type} />
                </td>
                <td className="py-2.5 font-medium" style={{ fontVariantNumeric: 'tabular-nums' }}>
                  {p.weightKg.toFixed(1)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Upcoming events */}
      <div
        className="p-5"
        style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}
      >
        <h3
          className="text-base mb-4"
          style={{ fontFamily: 'Fraunces, serif', color: 'var(--foreground)' }}
        >
          Próximos eventos
        </h3>
        {events.filter((e) => e.date >= today()).length === 0 ? (
          <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
            Nenhum evento futuro agendado.
          </p>
        ) : (
          <div className="space-y-3">
            {events
              .filter((e) => e.date >= today())
              .map((ev) => (
                <div
                  key={ev.id}
                  className="flex items-start gap-4 py-3"
                  style={{ borderBottom: '1px solid var(--muted)' }}
                >
                  <div
                    className="shrink-0 text-center px-3 py-1"
                    style={{
                      background: 'var(--primary)',
                      color: 'var(--primary-foreground)',
                      borderRadius: 'var(--radius)',
                      minWidth: 52,
                    }}
                  >
                    <p className="text-xs uppercase tracking-wide opacity-70">
                      {new Date(ev.date + 'T00:00:00').toLocaleDateString('pt-BR', { month: 'short' })}
                    </p>
                    <p className="text-xl font-semibold leading-tight" style={{ fontFamily: 'Fraunces, serif' }}>
                      {ev.date.split('-')[2]}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">{ev.title}</p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
                      {ev.time} · {ev.capacity} vagas
                    </p>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Shared ───────────────────────────────────────────────────────────────────

const TYPE_COLORS: Record<string, string> = {
  Raízes: '#7b4f2e',
  Folhas: '#2e6b35',
  Frutos: '#b5400a',
  Sementes: '#8a6e00',
  Flores: '#7a3070',
  Composto: '#3d5a35',
}

function TypeBadge({ type }: { type: string }) {
  const color = TYPE_COLORS[type] ?? 'var(--muted-foreground)'
  return (
    <span
      className="text-xs px-2 py-0.5 font-medium"
      style={{
        background: color + '18',
        color,
        borderRadius: 12,
        border: `1px solid ${color}30`,
      }}
    >
      {type}
    </span>
  )
}

// ── Produção ─────────────────────────────────────────────────────────────────

function ProducaoPage({
  user,
  productions,
  onAdd,
}: {
  user: User
  productions: Production[]
  onAdd: (p: Omit<Production, 'id'>) => void
}) {
  const [showForm, setShowForm] = useState(false)
  const [type, setType] = useState(PRODUCTION_TYPES[0])
  const [weight, setWeight] = useState('')
  const [success, setSuccess] = useState(false)
  const [filterType, setFilterType] = useState('Todos')

  const isCoord = user.role === 'coordenador'

  const totalKg = productions.reduce((s, p) => s + p.weightKg, 0)
  const byType: Record<string, number> = {}
  for (const p of productions) {
    byType[p.type] = (byType[p.type] ?? 0) + p.weightKg
  }

  const filtered = filterType === 'Todos' ? productions : productions.filter((p) => p.type === filterType)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const kg = parseFloat(weight)
    if (isNaN(kg) || kg <= 0) return
    onAdd({ type, weightKg: kg, date: today(), registeredBy: user.name })
    setWeight('')
    setShowForm(false)
    setSuccess(true)
    setTimeout(() => setSuccess(false), 3000)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl mb-1" style={{ fontFamily: 'Fraunces, serif' }}>
            Produção
          </h2>
          <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
            Registro de alimentos e compostagem em kg.
          </p>
        </div>
        {isCoord && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2.5 text-sm font-medium transition-opacity hover:opacity-90"
            style={{
              background: 'var(--primary)',
              color: 'var(--primary-foreground)',
              borderRadius: 'var(--radius)',
            }}
          >
            + Novo registro
          </button>
        )}
      </div>

      {/* Restricted notice for volunteers */}
      {!isCoord && (
        <div
          className="mb-6 px-4 py-3 text-sm"
          style={{
            background: '#fdf5e6',
            border: '1px solid #d4a84b',
            borderRadius: 'var(--radius)',
            color: '#7a5c00',
          }}
        >
          Você está visualizando os dados como voluntário. O cadastro de novos registros é restrito ao coordenador.
        </div>
      )}

      {success && (
        <div
          className="mb-4 px-4 py-3 text-sm"
          style={{
            background: '#eaf4ec',
            border: '1px solid #6aaa7a',
            borderRadius: 'var(--radius)',
            color: '#1e4d2b',
          }}
        >
          Registro salvo com sucesso para {today().split('-').reverse().join('/')}.
        </div>
      )}

      {/* Form */}
      {showForm && isCoord && (
        <div
          className="mb-6 p-5"
          style={{
            background: 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
          }}
        >
          <h3 className="text-base mb-4" style={{ fontFamily: 'Fraunces, serif' }}>
            Novo registro de produção
          </h3>
          <form onSubmit={handleSubmit} className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-40">
              <label className="block text-xs uppercase tracking-widest mb-1.5" style={{ color: 'var(--muted-foreground)' }}>
                Tipo
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full px-3 py-2.5 text-sm outline-none"
                style={{
                  background: 'var(--background)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)',
                  color: 'var(--foreground)',
                }}
              >
                {PRODUCTION_TYPES.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </div>
            <div className="flex-1 min-w-40">
              <label className="block text-xs uppercase tracking-widest mb-1.5" style={{ color: 'var(--muted-foreground)' }}>
                Peso (kg)
              </label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                required
                placeholder="ex: 12.5"
                className="w-full px-3 py-2.5 text-sm outline-none"
                style={{
                  background: 'var(--background)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)',
                  color: 'var(--foreground)',
                }}
              />
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2.5 text-sm"
                style={{ color: 'var(--muted-foreground)' }}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2.5 text-sm font-medium"
                style={{
                  background: 'var(--primary)',
                  color: 'var(--primary-foreground)',
                  borderRadius: 'var(--radius)',
                }}
              >
                Salvar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Summary totals */}
      <div
        className="mb-6 p-5"
        style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}
      >
        <p className="text-xs uppercase tracking-widest mb-3" style={{ color: 'var(--muted-foreground)' }}>
          Total acumulado — {totalKg.toFixed(1)} kg
        </p>
        <div className="flex flex-wrap gap-4">
          {Object.entries(byType).map(([t, kg]) => (
            <div key={t} className="flex items-center gap-2">
              <TypeBadge type={t} />
              <span className="text-sm font-medium" style={{ fontVariantNumeric: 'tabular-nums' }}>
                {kg.toFixed(1)} kg
              </span>
            </div>
          ))}
        </div>
        {/* Progress bar visual */}
        <div className="mt-4 h-2 rounded-full overflow-hidden flex" style={{ background: 'var(--muted)' }}>
          {Object.entries(byType).map(([t, kg]) => (
            <div
              key={t}
              style={{
                width: `${(kg / totalKg) * 100}%`,
                background: TYPE_COLORS[t] ?? 'var(--muted-foreground)',
              }}
              title={`${t}: ${kg.toFixed(1)} kg`}
            />
          ))}
        </div>
      </div>

      {/* Table */}
      <div
        style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}
      >
        <div className="flex items-center justify-between px-5 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
          <p className="text-sm font-medium">{filtered.length} registros</p>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="text-xs px-2 py-1.5 outline-none"
            style={{
              background: 'var(--background)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              color: 'var(--foreground)',
            }}
          >
            <option>Todos</option>
            {PRODUCTION_TYPES.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              {['Data', 'Tipo', 'Peso (kg)', 'Registrado por'].map((h) => (
                <th
                  key={h}
                  className="text-left px-5 py-3 text-xs uppercase tracking-widest font-medium"
                  style={{ color: 'var(--muted-foreground)' }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[...filtered].reverse().map((p) => (
              <tr key={p.id} style={{ borderBottom: '1px solid var(--muted)' }}>
                <td className="px-5 py-3" style={{ color: 'var(--muted-foreground)', fontVariantNumeric: 'tabular-nums' }}>
                  {formatDate(p.date)}
                </td>
                <td className="px-5 py-3">
                  <TypeBadge type={p.type} />
                </td>
                <td className="px-5 py-3 font-medium" style={{ fontVariantNumeric: 'tabular-nums' }}>
                  {p.weightKg.toFixed(1)}
                </td>
                <td className="px-5 py-3 text-xs" style={{ color: 'var(--muted-foreground)' }}>
                  {p.registeredBy}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={4} className="px-5 py-8 text-center text-sm" style={{ color: 'var(--muted-foreground)' }}>
                  Nenhum registro encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ── Eventos ──────────────────────────────────────────────────────────────────

function EventosPage({
  user,
  events,
  onAdd,
}: {
  user: User
  events: Event[]
  onAdd: (e: Omit<Event, 'id'>) => void
}) {
  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [capacity, setCapacity] = useState('')
  const [description, setDescription] = useState('')
  const [success, setSuccess] = useState(false)
  const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming')

  const isCoord = user.role === 'coordenador'

  const upcoming = events.filter((e) => e.date >= today())
  const past = events.filter((e) => e.date < today())
  const displayed = tab === 'upcoming' ? upcoming : past

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onAdd({
      title,
      date,
      time,
      capacity: parseInt(capacity),
      description,
      createdBy: user.name,
    })
    setTitle('')
    setDate('')
    setTime('')
    setCapacity('')
    setDescription('')
    setShowForm(false)
    setSuccess(true)
    setTimeout(() => setSuccess(false), 3000)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl mb-1" style={{ fontFamily: 'Fraunces, serif' }}>
            Eventos
          </h2>
          <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
            Visitas guiadas, oficinas e ações externas.
          </p>
        </div>
        {isCoord && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2.5 text-sm font-medium transition-opacity hover:opacity-90"
            style={{
              background: 'var(--primary)',
              color: 'var(--primary-foreground)',
              borderRadius: 'var(--radius)',
            }}
          >
            + Novo evento
          </button>
        )}
      </div>

      {!isCoord && (
        <div
          className="mb-6 px-4 py-3 text-sm"
          style={{
            background: '#fdf5e6',
            border: '1px solid #d4a84b',
            borderRadius: 'var(--radius)',
            color: '#7a5c00',
          }}
        >
          Você está visualizando os eventos como voluntário. O agendamento de novos eventos é restrito ao coordenador.
        </div>
      )}

      {success && (
        <div
          className="mb-4 px-4 py-3 text-sm"
          style={{
            background: '#eaf4ec',
            border: '1px solid #6aaa7a',
            borderRadius: 'var(--radius)',
            color: '#1e4d2b',
          }}
        >
          Evento criado com sucesso e adicionado à lista de próximos eventos.
        </div>
      )}

      {/* Form */}
      {showForm && isCoord && (
        <div
          className="mb-6 p-5"
          style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}
        >
          <h3 className="text-base mb-4" style={{ fontFamily: 'Fraunces, serif' }}>
            Novo Evento
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs uppercase tracking-widest mb-1.5" style={{ color: 'var(--muted-foreground)' }}>
                Título
              </label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                placeholder="ex: Visita guiada — Turma de Biologia"
                className="w-full px-3 py-2.5 text-sm outline-none"
                style={{
                  background: 'var(--background)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)',
                  color: 'var(--foreground)',
                }}
              />
            </div>
            <div className="flex gap-4 flex-wrap">
              <div className="flex-1 min-w-36">
                <label className="block text-xs uppercase tracking-widest mb-1.5" style={{ color: 'var(--muted-foreground)' }}>
                  Data
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  min={today()}
                  className="w-full px-3 py-2.5 text-sm outline-none"
                  style={{
                    background: 'var(--background)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius)',
                    color: 'var(--foreground)',
                  }}
                />
              </div>
              <div className="flex-1 min-w-28">
                <label className="block text-xs uppercase tracking-widest mb-1.5" style={{ color: 'var(--muted-foreground)' }}>
                  Horário
                </label>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  required
                  className="w-full px-3 py-2.5 text-sm outline-none"
                  style={{
                    background: 'var(--background)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius)',
                    color: 'var(--foreground)',
                  }}
                />
              </div>
              <div className="flex-1 min-w-28">
                <label className="block text-xs uppercase tracking-widest mb-1.5" style={{ color: 'var(--muted-foreground)' }}>
                  Vagas
                </label>
                <input
                  type="number"
                  min="1"
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value)}
                  required
                  placeholder="ex: 30"
                  className="w-full px-3 py-2.5 text-sm outline-none"
                  style={{
                    background: 'var(--background)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius)',
                    color: 'var(--foreground)',
                  }}
                />
              </div>
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest mb-1.5" style={{ color: 'var(--muted-foreground)' }}>
                Descrição
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Descreva brevemente o evento…"
                className="w-full px-3 py-2.5 text-sm outline-none resize-none"
                style={{
                  background: 'var(--background)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)',
                  color: 'var(--foreground)',
                }}
              />
            </div>
            <div className="flex gap-2 justify-end pt-1">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 text-sm"
                style={{ color: 'var(--muted-foreground)' }}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium"
                style={{
                  background: 'var(--primary)',
                  color: 'var(--primary-foreground)',
                  borderRadius: 'var(--radius)',
                }}
              >
                Agendar evento
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab switcher */}
      <div
        className="flex gap-1 mb-5 p-1"
        style={{
          background: 'var(--muted)',
          borderRadius: 'var(--radius)',
          display: 'inline-flex',
        }}
      >
        {(['upcoming', 'past'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="px-4 py-1.5 text-sm transition-all"
            style={{
              background: tab === t ? 'var(--card)' : 'transparent',
              color: tab === t ? 'var(--foreground)' : 'var(--muted-foreground)',
              borderRadius: 'var(--radius)',
              fontWeight: tab === t ? 500 : 400,
              border: tab === t ? '1px solid var(--border)' : '1px solid transparent',
            }}
          >
            {t === 'upcoming' ? `Próximos (${upcoming.length})` : `Histórico (${past.length})`}
          </button>
        ))}
      </div>

      {/* Event cards */}
      <div className="space-y-3">
        {displayed.length === 0 && (
          <div
            className="text-center py-12 text-sm"
            style={{ color: 'var(--muted-foreground)', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}
          >
            {tab === 'upcoming' ? 'Nenhum evento futuro agendado.' : 'Nenhum evento passado no histórico.'}
          </div>
        )}
        {displayed.map((ev) => (
          <div
            key={ev.id}
            className="flex gap-4 p-5"
            style={{
              background: 'var(--card)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
            }}
          >
            <div
              className="shrink-0 text-center px-3 py-1.5"
              style={{
                background: tab === 'upcoming' ? 'var(--primary)' : 'var(--muted)',
                color: tab === 'upcoming' ? 'var(--primary-foreground)' : 'var(--muted-foreground)',
                borderRadius: 'var(--radius)',
                minWidth: 56,
              }}
            >
              <p className="text-xs uppercase tracking-wide opacity-80">
                {new Date(ev.date + 'T00:00:00').toLocaleDateString('pt-BR', { month: 'short' })}
              </p>
              <p className="text-2xl font-semibold" style={{ fontFamily: 'Fraunces, serif' }}>
                {ev.date.split('-')[2]}
              </p>
            </div>
            <div className="flex-1">
              <div className="flex items-start justify-between gap-2">
                <p className="font-medium text-sm">{ev.title}</p>
                {!isCoord && (
                  <span
                    className="text-xs px-2 py-0.5 shrink-0"
                    style={{
                      background: 'var(--muted)',
                      color: 'var(--muted-foreground)',
                      borderRadius: 12,
                    }}
                  >
                    somente leitura
                  </span>
                )}
              </div>
              {ev.description && (
                <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>
                  {ev.description}
                </p>
              )}
              <div className="flex gap-4 mt-2 text-xs" style={{ color: 'var(--muted-foreground)' }}>
                <span>{formatDate(ev.date)}</span>
                <span>{ev.time}</span>
                <span>{ev.capacity} vagas</span>
                <span>por {ev.createdBy}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Root App ─────────────────────────────────────────────────────────────────

export default function App() {
  const [user, setUser] = useState<User | null>(null)
  const [activeTab, setActiveTab] = useState<Tab>('dashboard')
  const [productions, setProductions] = useState<Production[]>(INITIAL_PRODUCTIONS)
  const [events, setEvents] = useState<Event[]>(INITIAL_EVENTS)

  function addProduction(p: Omit<Production, 'id'>) {
    setProductions((prev) => [...prev, { ...p, id: prev.length + 1 }])
  }

  function addEvent(e: Omit<Event, 'id'>) {
    setEvents((prev) => [...prev, { ...e, id: prev.length + 1 }])
  }

  if (!user) {
    return <LoginPage onLogin={setUser} />
  }

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--background)' }}>
      <Sidebar
        user={user}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onLogout={() => {
          setUser(null)
          setActiveTab('dashboard')
        }}
      />
      <main className="flex-1 px-8 py-8 max-w-4xl">
        {activeTab === 'dashboard' && (
          <Dashboard user={user} productions={productions} events={events} />
        )}
        {activeTab === 'producao' && (
          <ProducaoPage user={user} productions={productions} onAdd={addProduction} />
        )}
        {activeTab === 'eventos' && (
          <EventosPage user={user} events={events} onAdd={addEvent} />
        )}
      </main>
    </div>
  )
}
