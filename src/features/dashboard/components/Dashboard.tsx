import type { User, Production, Event } from '@/shared/types'
import { PLANTING_RECORD_TYPE_LABELS } from '@/shared/constants'
import { today, formatDate } from '@/shared/utils'
import { TypeBadge } from '@/shared/components'
import { useCanteiros } from '@/features/production/hooks/useCanteiros'
import { getCanteiroStats } from '@/features/production/lib/canteiros'

export function Dashboard({
  user,
  productions,
  events,
}: {
  user: User
  productions: Production[]
  events: Event[]
}) {
  const { canteiros, records } = useCanteiros()
  const canteiroStats = getCanteiroStats({ canteiros, records })
  const lastRecord = records[records.length - 1] ?? null

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

      {/* Canteiros */}
      <div
        className="mb-6 p-5"
        style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}
      >
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <h3
            className="text-base"
            style={{ fontFamily: 'Fraunces, serif', color: 'var(--foreground)' }}
          >
            Canteiros e plantio
          </h3>
          <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
            {canteiroStats.total} canteiros mapeados
          </span>
        </div>

        <div
          className="grid gap-3"
          style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))' }}
        >
          <div>
            <p className="text-xs uppercase tracking-widest mb-1" style={{ color: 'var(--muted-foreground)' }}>
              Em cultivo
            </p>
            <p
              data-testid="dashboard-canteiros-cultivo"
              className="text-2xl"
              style={{ fontFamily: 'Fraunces, serif', color: 'var(--primary)' }}
            >
              {canteiroStats.emCultivo}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest mb-1" style={{ color: 'var(--muted-foreground)' }}>
              Em preparo/descanso
            </p>
            <p
              data-testid="dashboard-canteiros-descanso"
              className="text-2xl"
              style={{ fontFamily: 'Fraunces, serif', color: 'var(--primary)' }}
            >
              {canteiroStats.emPreparo + canteiroStats.emDescanso}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest mb-1" style={{ color: 'var(--muted-foreground)' }}>
              Registros no histórico
            </p>
            <p
              data-testid="dashboard-canteiros-registros"
              className="text-2xl"
              style={{ fontFamily: 'Fraunces, serif', color: 'var(--primary)' }}
            >
              {canteiroStats.registros}
            </p>
          </div>
        </div>

        <p className="text-xs mt-4" style={{ color: 'var(--muted-foreground)' }}>
          {lastRecord
            ? `Última atividade: ${PLANTING_RECORD_TYPE_LABELS[lastRecord.type]} de ${
                lastRecord.culture
              } no ${lastRecord.canteiroName}, por ${lastRecord.actor} em ${formatDate(
                lastRecord.date,
              )}.`
            : 'Nenhum registro de plantio, manejo ou colheita ainda.'}
        </p>
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
