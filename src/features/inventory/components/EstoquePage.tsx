import { useState } from 'react'
import type React from 'react'
import type { InventoryItem, InventoryMovement, User } from '@/shared/types'
import {
  INVENTORY_CATEGORIES,
  INVENTORY_MOVEMENT_LABELS,
  INVENTORY_STATUS_LABELS,
} from '@/shared/constants'
import { formatDateTime } from '@/shared/utils'
import {
  getActiveLoans,
  getItemActiveLoans,
  getItemRequesters,
  getItemStatus,
} from '../lib/inventory'
import { useInventory } from '../hooks/useInventory'

type Feedback = {
  type: 'success' | 'error'
  message: string
}

function quantityLabel(quantity: number) {
  return quantity === 1 ? '1 unidade' : `${quantity} unidades`
}

export function EstoquePage({ user }: { user: User }) {
  const { items, movements, requestItem, returnLoan, addItem } = useInventory()
  const [showAddForm, setShowAddForm] = useState(false)
  const [addName, setAddName] = useState('')
  const [addCategory, setAddCategory] = useState<string>(INVENTORY_CATEGORIES[0])
  const [addQuantity, setAddQuantity] = useState('1')
  const [requestingItemId, setRequestingItemId] = useState<number | null>(null)
  const [requestQuantity, setRequestQuantity] = useState('1')
  const [feedback, setFeedback] = useState<Feedback | null>(null)

  const isCoord = user.role === 'coordenador'
  const activeLoans = getActiveLoans(movements)
  const requestingItem = items.find((item) => item.id === requestingItemId) ?? null
  const availableUnits = items.reduce((total, item) => total + item.availableQuantity, 0)
  const totalUnits = items.reduce((total, item) => total + item.totalQuantity, 0)
  const inUseUnits = activeLoans.reduce((total, loan) => total + loan.quantity, 0)
  const itemsInUse = new Set(activeLoans.map((loan) => loan.itemId)).size

  const stats = [
    { label: 'Itens cadastrados', value: String(items.length), sub: 'tipos de ferramentas' },
    { label: 'Unidades disponíveis', value: String(availableUnits), sub: `de ${totalUnits} no total` },
    { label: 'Unidades em uso', value: String(inUseUnits), sub: `${itemsInUse} item(ns) solicitado(s)` },
    { label: 'Retiradas ativas', value: String(activeLoans.length), sub: 'aguardando devolução' },
  ]

  function openAddForm() {
    setRequestingItemId(null)
    setFeedback(null)
    setShowAddForm((current) => !current)
  }

  function openRequestForm(item: InventoryItem) {
    setShowAddForm(false)
    setFeedback(null)
    setRequestingItemId(item.id)
    setRequestQuantity('1')
  }

  function handleAddItem(e: React.FormEvent) {
    e.preventDefault()
    const quantity = Number.parseInt(addQuantity, 10)
    const toolName = addName.trim()
    const error = addItem({ name: toolName, category: addCategory, quantity }, user.name)

    if (error) {
      setFeedback({ type: 'error', message: error })
      return
    }

    setFeedback({
      type: 'success',
      message: `${toolName} cadastrada. A quantidade disponível no estoque foi atualizada.`,
    })
    setAddName('')
    setAddCategory(INVENTORY_CATEGORIES[0])
    setAddQuantity('1')
    setShowAddForm(false)
  }

  function handleRequestItem(e: React.FormEvent) {
    e.preventDefault()
    if (!requestingItem) return

    const quantity = Number.parseInt(requestQuantity, 10)
    const error = requestItem(requestingItem.id, quantity, user.name)
    if (error) {
      setFeedback({ type: 'error', message: error })
      return
    }

    setFeedback({
      type: 'success',
      message: `Solicitação registrada. ${requestingItem.name} está como ${INVENTORY_STATUS_LABELS.solicitada}.`,
    })
    setRequestingItemId(null)
    setRequestQuantity('1')
  }

  function handleReturnLoan(loan: InventoryMovement) {
    const error = returnLoan(loan.id, user.name)
    if (error) {
      setFeedback({ type: 'error', message: error })
      return
    }

    setFeedback({
      type: 'success',
      message: `Devolução registrada. ${quantityLabel(loan.quantity)} de ${loan.itemName} ${
        loan.quantity === 1 ? 'voltou' : 'voltaram'
      } ao estoque.`,
    })
  }

  return (
    <div>
      <div className="flex items-start justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl mb-1" style={{ fontFamily: 'Fraunces, serif' }}>
            Estoque
          </h2>
          <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
            Consulta de ferramentas, solicitações de retirada e devoluções.
          </p>
        </div>
        {isCoord && (
          <button
            onClick={openAddForm}
            className="px-4 py-2.5 text-sm font-medium transition-opacity hover:opacity-90"
            style={{
              background: 'var(--primary)',
              color: 'var(--primary-foreground)',
              borderRadius: 'var(--radius)',
            }}
          >
            + Nova ferramenta
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
          Você pode solicitar a retirada de ferramentas disponíveis. O cadastro de novos itens e o
          registro de devoluções são restritos ao coordenador.
        </div>
      )}

      {feedback && (
        <div
          role={feedback.type === 'error' ? 'alert' : 'status'}
          className="mb-4 px-4 py-3 text-sm"
          style={{
            background: feedback.type === 'error' ? '#fdf0ec' : '#eaf4ec',
            border: `1px solid ${feedback.type === 'error' ? '#e2a090' : '#6aaa7a'}`,
            borderRadius: 'var(--radius)',
            color: feedback.type === 'error' ? 'var(--accent)' : '#1e4d2b',
          }}
        >
          {feedback.message}
        </div>
      )}

      {showAddForm && isCoord && (
        <div
          className="mb-6 p-5"
          style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}
        >
          <h3 className="text-base mb-4" style={{ fontFamily: 'Fraunces, serif' }}>
            Nova ferramenta
          </h3>
          <form onSubmit={handleAddItem} className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-44">
              <label
                htmlFor="inventory-name"
                className="block text-xs uppercase tracking-widest mb-1.5"
                style={{ color: 'var(--muted-foreground)' }}
              >
                Nome
              </label>
              <input
                id="inventory-name"
                value={addName}
                onChange={(e) => setAddName(e.target.value)}
                required
                placeholder="ex: Serrote"
                className="w-full px-3 py-2.5 text-sm outline-none"
                style={{
                  background: 'var(--background)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)',
                  color: 'var(--foreground)',
                }}
              />
            </div>
            <div className="flex-1 min-w-40">
              <label
                htmlFor="inventory-category"
                className="block text-xs uppercase tracking-widest mb-1.5"
                style={{ color: 'var(--muted-foreground)' }}
              >
                Categoria
              </label>
              <select
                id="inventory-category"
                value={addCategory}
                onChange={(e) => setAddCategory(e.target.value)}
                className="w-full px-3 py-2.5 text-sm outline-none"
                style={{
                  background: 'var(--background)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)',
                  color: 'var(--foreground)',
                }}
              >
                {INVENTORY_CATEGORIES.map((category) => (
                  <option key={category}>{category}</option>
                ))}
              </select>
            </div>
            <div className="w-28">
              <label
                htmlFor="inventory-quantity"
                className="block text-xs uppercase tracking-widest mb-1.5"
                style={{ color: 'var(--muted-foreground)' }}
              >
                Quantidade
              </label>
              <input
                id="inventory-quantity"
                type="number"
                min="1"
                step="1"
                value={addQuantity}
                onChange={(e) => setAddQuantity(e.target.value)}
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
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
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
                Cadastrar ferramenta
              </button>
            </div>
          </form>
        </div>
      )}

      {requestingItem && (
        <div
          aria-label="Solicitação de retirada"
          className="mb-6 p-5"
          style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}
        >
          <h3 className="text-base mb-1" style={{ fontFamily: 'Fraunces, serif' }}>
            Retirar: {requestingItem.name}
          </h3>
          <p className="text-xs mb-4" style={{ color: 'var(--muted-foreground)' }}>
            Disponível: {requestingItem.availableQuantity} de {requestingItem.totalQuantity} unidades.
          </p>
          <form onSubmit={handleRequestItem} className="flex flex-wrap gap-4 items-end">
            <div className="w-32">
              <label
                htmlFor="request-quantity"
                className="block text-xs uppercase tracking-widest mb-1.5"
                style={{ color: 'var(--muted-foreground)' }}
              >
                Quantidade
              </label>
              <input
                id="request-quantity"
                type="number"
                min="1"
                step="1"
                value={requestQuantity}
                onChange={(e) => setRequestQuantity(e.target.value)}
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
            <p className="text-sm pb-2.5" style={{ color: 'var(--muted-foreground)' }}>
              Solicitante: <strong style={{ color: 'var(--foreground)' }}>{user.name}</strong>
            </p>
            <div className="flex gap-2 ml-auto">
              <button
                type="button"
                onClick={() => setRequestingItemId(null)}
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
                Confirmar solicitação
              </button>
            </div>
          </form>
        </div>
      )}

      <div
        className="grid gap-4 mb-6"
        style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))' }}
      >
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="px-5 py-4"
            style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}
          >
            <p className="text-xs uppercase tracking-widest mb-2" style={{ color: 'var(--muted-foreground)' }}>
              {stat.label}
            </p>
            <p className="text-2xl mb-0.5" style={{ fontFamily: 'Fraunces, serif', color: 'var(--primary)' }}>
              {stat.value}
            </p>
            <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
              {stat.sub}
            </p>
          </div>
        ))}
      </div>

      <div
        className="grid gap-4 mb-8"
        style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}
      >
        {items.map((item) => {
          const status = getItemStatus(item, movements)
          const itemLoans = getItemActiveLoans(movements, item.id)
          const requesters = getItemRequesters(movements, item.id)
          const inUse = itemLoans.reduce((total, loan) => total + loan.quantity, 0)

          return (
            <article
              key={item.id}
              aria-label={`Ferramenta ${item.name}`}
              className="p-5"
              style={{
                background: 'var(--card)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius)',
              }}
            >
              <div className="flex items-start justify-between gap-3 mb-4">
                <div>
                  <h3 className="text-base" style={{ fontFamily: 'Fraunces, serif' }}>
                    {item.name}
                  </h3>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
                    {item.category}
                  </p>
                </div>
                <span
                  className="text-xs px-2 py-0.5 shrink-0"
                  style={{
                    background: status === 'disponivel' ? '#eaf4ec' : '#fdf5e6',
                    border: `1px solid ${status === 'disponivel' ? '#6aaa7a' : '#d4a84b'}`,
                    color: status === 'disponivel' ? '#1e4d2b' : '#7a5c00',
                    borderRadius: 12,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {INVENTORY_STATUS_LABELS[status]}
                </span>
              </div>

              <div className="space-y-2 text-sm mb-4">
                <div className="flex items-center justify-between gap-3">
                  <span style={{ color: 'var(--muted-foreground)' }}>Disponível</span>
                  <span className="font-medium" style={{ fontVariantNumeric: 'tabular-nums' }}>
                    {item.availableQuantity} de {item.totalQuantity} disponíveis
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span style={{ color: 'var(--muted-foreground)' }}>Em uso</span>
                  <span className="font-medium" style={{ fontVariantNumeric: 'tabular-nums' }}>
                    {inUse} {inUse === 1 ? 'unidade' : 'unidades'}
                  </span>
                </div>
              </div>

              {requesters.length > 0 && (
                <p className="text-xs mb-4" style={{ color: 'var(--muted-foreground)' }}>
                  Solicitante(s): <strong style={{ color: 'var(--foreground)' }}>{requesters.join(', ')}</strong>
                </p>
              )}

              {item.availableQuantity > 0 ? (
                <button
                  onClick={() => openRequestForm(item)}
                  aria-label={`Solicitar retirada de ${item.name}`}
                  className="w-full px-3 py-2 text-sm font-medium transition-opacity hover:opacity-90"
                  style={{
                    background: 'var(--primary)',
                    color: 'var(--primary-foreground)',
                    borderRadius: 'var(--radius)',
                  }}
                >
                  Solicitar retirada
                </button>
              ) : (
                <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                  Todas as unidades estão em uso.
                </p>
              )}
            </article>
          )
        })}
      </div>

      <div
        className="mb-8 p-5"
        style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}
      >
        <div className="flex items-center justify-between gap-3 mb-4">
          <h3 className="text-base" style={{ fontFamily: 'Fraunces, serif' }}>
            Retiradas em andamento
          </h3>
          <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
            {activeLoans.length} {activeLoans.length === 1 ? 'retirada ativa' : 'retiradas ativas'}
          </span>
        </div>

        {activeLoans.length === 0 ? (
          <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
            Nenhuma ferramenta em uso no momento.
          </p>
        ) : (
          <div>
            {activeLoans.map((loan) => (
              <div
                key={loan.id}
                className="flex flex-wrap items-center justify-between gap-3 py-3"
                style={{ borderBottom: '1px solid var(--muted)' }}
              >
                <div>
                  <p className="text-sm font-medium">
                    {loan.itemName}{' '}
                    <span className="text-xs font-normal" style={{ color: 'var(--muted-foreground)' }}>
                      ({quantityLabel(loan.quantity)})
                    </span>
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
                    Solicitado por {loan.actor} em {formatDateTime(loan.createdAt)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className="text-xs px-2 py-0.5"
                    style={{
                      background: '#fdf5e6',
                      border: '1px solid #d4a84b',
                      color: '#7a5c00',
                      borderRadius: 12,
                    }}
                  >
                    Em andamento
                  </span>
                  {isCoord ? (
                    <button
                      onClick={() => handleReturnLoan(loan)}
                      aria-label={`Registrar devolução de ${loan.itemName} para ${loan.actor}`}
                      className="px-3 py-1.5 text-xs font-medium"
                      style={{
                        background: 'var(--secondary)',
                        color: 'var(--secondary-foreground)',
                        borderRadius: 'var(--radius)',
                      }}
                    >
                      Registrar devolução
                    </button>
                  ) : (
                    <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                      A devolução é registrada pelo coordenador.
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div
        style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}
      >
        <div className="px-5 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
          <h3 className="text-base" style={{ fontFamily: 'Fraunces, serif' }}>
            Histórico de movimentações
          </h3>
        </div>
        {movements.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm" style={{ color: 'var(--muted-foreground)' }}>
            Nenhuma movimentação registrada.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['Data/hora', 'Movimentação', 'Ferramenta', 'Qtd.', 'Responsável'].map((header) => (
                  <th
                    key={header}
                    className="text-left px-5 py-3 text-xs uppercase tracking-widest font-medium"
                    style={{ color: 'var(--muted-foreground)' }}
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[...movements].reverse().map((movement) => (
                <tr key={movement.id} style={{ borderBottom: '1px solid var(--muted)' }}>
                  <td
                    className="px-5 py-3 text-xs"
                    style={{ color: 'var(--muted-foreground)', fontVariantNumeric: 'tabular-nums' }}
                  >
                    {formatDateTime(movement.createdAt)}
                  </td>
                  <td className="px-5 py-3">{INVENTORY_MOVEMENT_LABELS[movement.type]}</td>
                  <td className="px-5 py-3">{movement.itemName}</td>
                  <td className="px-5 py-3 font-medium" style={{ fontVariantNumeric: 'tabular-nums' }}>
                    {movement.quantity}
                  </td>
                  <td className="px-5 py-3 text-xs" style={{ color: 'var(--muted-foreground)' }}>
                    {movement.actor}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
