import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import type { CanteirosState, Production, User } from '@/shared/types'
import { CANTEIROS_STORAGE_KEY } from '@/shared/constants'
import { addPlantingRecord, createInitialCanteirosState } from '../lib/canteiros'
import { saveCanteirosState } from '../lib/canteirosStorage'
import { ProducaoPage } from './ProducaoPage'

const coordinator: User = {
  name: 'Ana Beatriz Costa',
  email: 'coordenador@ufrn.br',
  role: 'coordenador',
}

const volunteer: User = {
  name: 'Carlos Eduardo Lima',
  email: 'voluntario@ufrn.br',
  role: 'voluntario',
}

function renderPage(user: User = coordinator, productions: Production[] = []) {
  const onAdd = vi.fn()
  render(<ProducaoPage user={user} productions={productions} onAdd={onAdd} />)
  return { onAdd }
}

function storedState() {
  const raw = window.localStorage.getItem(CANTEIROS_STORAGE_KEY)
  if (!raw) throw new Error('Canteiros não encontrados no localStorage')
  return JSON.parse(raw) as CanteirosState
}

function seedTwoRecords() {
  const first = addPlantingRecord(
    createInitialCanteirosState(),
    {
      canteiroId: 1,
      type: 'plantio',
      culture: 'Alface crespa',
      quantityKg: null,
      notes: '',
      date: '2026-11-10',
    },
    'Ana Beatriz Costa',
    '2026-11-10T12:00:00.000Z',
  )
  const second = addPlantingRecord(
    first.state,
    {
      canteiroId: 5,
      type: 'manejo',
      culture: 'Feijão-de-corda',
      quantityKg: null,
      notes: 'Cobertura do solo.',
      date: '2026-11-11',
    },
    'Carlos Eduardo Lima',
    '2026-11-11T12:00:00.000Z',
  )
  saveCanteirosState(second.state)
}

describe('ProducaoPage — canteiros e histórico', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
    window.localStorage.clear()
  })

  it('exibe o mapa com setores, cultura atual, status e responsável de cada canteiro', () => {
    renderPage()

    expect(screen.getByRole('heading', { level: 3, name: 'Mapa de canteiros' })).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { level: 4, name: 'Setor A — Hortaliças' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { level: 4, name: 'Setor B — Raízes e Tubérculos' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { level: 4, name: 'Setor C — Flores e Compostagem' }),
    ).toBeInTheDocument()
    expect(screen.getByText('6 canteiros em 3 setores')).toBeInTheDocument()

    const canteiro1 = screen.getByRole('article', { name: 'Canteiro 1' })
    expect(within(canteiro1).getByText('Alface crespa')).toBeInTheDocument()
    expect(within(canteiro1).getByText('Em cultivo')).toBeInTheDocument()
    expect(within(canteiro1).getByText('Ana Beatriz Costa')).toBeInTheDocument()
    expect(within(canteiro1).getByText('12/09/2026')).toBeInTheDocument()

    const canteiro5 = screen.getByRole('article', { name: 'Canteiro 5' })
    expect(within(canteiro5).getByText('Feijão-de-corda')).toBeInTheDocument()
    expect(within(canteiro5).getByText('Em descanso')).toBeInTheDocument()

    expect(screen.getByTestId('canteiro-stat-total')).toHaveTextContent('6')
    expect(screen.getByTestId('canteiro-stat-cultivo')).toHaveTextContent('4')
    expect(screen.getByTestId('canteiro-stat-registros')).toHaveTextContent('0')
  })

  it('registra um plantio, atualiza os indicadores e persiste no localStorage', () => {
    renderPage()

    fireEvent.click(screen.getByRole('button', { name: '+ Novo plantio' }))
    expect(
      screen.getByRole('heading', { level: 3, name: 'Novo registro no histórico dos canteiros' }),
    ).toBeInTheDocument()

    fireEvent.change(screen.getByLabelText('Canteiro'), { target: { value: '5' } })
    expect(screen.getByLabelText('Cultura')).toHaveValue('Feijão-de-corda')

    fireEvent.change(screen.getByLabelText('Cultura'), { target: { value: 'Milho verde' } })
    fireEvent.change(screen.getByLabelText('Observações'), {
      target: { value: 'Plantio em consórcio com feijão.' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Registrar no histórico' }))

    expect(screen.getByRole('status')).toHaveTextContent(
      'Plantio registrado no histórico do Canteiro 5.',
    )

    const canteiro5 = screen.getByRole('article', { name: 'Canteiro 5' })
    expect(within(canteiro5).getByText('Milho verde')).toBeInTheDocument()
    expect(within(canteiro5).getByText('Em cultivo')).toBeInTheDocument()
    expect(within(canteiro5).getByText('Ana Beatriz Costa')).toBeInTheDocument()

    expect(screen.getByTestId('canteiro-stat-registros')).toHaveTextContent('1')
    expect(screen.getByTestId('canteiro-stat-cultivo')).toHaveTextContent('5')
    expect(screen.getByTestId('canteiro-stat-descanso')).toHaveTextContent('1')

    const history = screen.getByRole('region', { name: 'Histórico de plantio e manejo' })
    const historyRow = within(history).getByRole('row', { name: /Canteiro 5/ })
    expect(within(historyRow).getByText('Milho verde')).toBeInTheDocument()
    expect(within(historyRow).getByText('Plantio')).toBeInTheDocument()
    expect(within(historyRow).getByText('Plantio em consórcio com feijão.')).toBeInTheDocument()
    expect(within(historyRow).getByText('Ana Beatriz Costa')).toBeInTheDocument()

    const stored = storedState()
    expect(stored.records).toHaveLength(1)
    expect(stored.records[0]).toMatchObject({
      canteiroId: 5,
      type: 'plantio',
      culture: 'Milho verde',
      actor: 'Ana Beatriz Costa',
      notes: 'Plantio em consórcio com feijão.',
    })
    expect(stored.records[0].date).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    expect(stored.canteiros.find((canteiro) => canteiro.id === 5)?.status).toBe('em-cultivo')

    cleanup()
    renderPage()

    expect(screen.getByTestId('canteiro-stat-registros')).toHaveTextContent('1')
    expect(
      within(screen.getByRole('article', { name: 'Canteiro 5' })).getByText('Milho verde'),
    ).toBeInTheDocument()
  })

  it('permite que o voluntário registre manejo sem liberar o cadastro de produção ou de canteiros', () => {
    renderPage(volunteer)

    expect(screen.queryByRole('button', { name: '+ Novo registro' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '+ Novo canteiro' })).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Editar Canteiro 1' }),
    ).not.toBeInTheDocument()
    expect(
      screen.getByText(/o histórico de plantio, manejo e colheita dos canteiros está aberto/i),
    ).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: '+ Novo plantio' }))
    fireEvent.change(screen.getByLabelText('Tipo de registro'), { target: { value: 'manejo' } })
    fireEvent.change(screen.getByLabelText('Observações'), {
      target: { value: 'Capina manual e cobertura do solo.' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Registrar no histórico' }))

    expect(screen.getByRole('status')).toHaveTextContent(
      'Manejo registrado no histórico do Canteiro 1.',
    )

    const stored = storedState()
    expect(stored.records[0]).toMatchObject({
      canteiroId: 1,
      type: 'manejo',
      actor: 'Carlos Eduardo Lima',
      notes: 'Capina manual e cobertura do solo.',
    })
    expect(stored.canteiros.find((canteiro) => canteiro.id === 1)?.responsible).toBe(
      'Carlos Eduardo Lima',
    )
  })

  it('registra colheita com quantidade, coloca o canteiro em descanso e soma os kg', () => {
    renderPage()

    fireEvent.click(screen.getByRole('button', { name: '+ Novo plantio' }))
    fireEvent.change(screen.getByLabelText('Tipo de registro'), { target: { value: 'colheita' } })

    const quantityInput = screen.getByLabelText('Quantidade colhida (kg)')
    fireEvent.change(quantityInput, { target: { value: '2.5' } })
    fireEvent.click(screen.getByRole('button', { name: 'Registrar no histórico' }))

    expect(screen.getByRole('status')).toHaveTextContent(
      'Colheita registrada no histórico do Canteiro 1.',
    )

    const canteiro1 = screen.getByRole('article', { name: 'Canteiro 1' })
    expect(within(canteiro1).getByText('Em descanso')).toBeInTheDocument()
    expect(screen.getByTestId('canteiro-stat-descanso')).toHaveTextContent('3')
    expect(screen.getByText('2.5 kg colhidos')).toBeInTheDocument()

    const stored = storedState()
    expect(stored.records[0]).toMatchObject({
      canteiroId: 1,
      type: 'colheita',
      quantityKg: 2.5,
      actor: 'Ana Beatriz Costa',
    })
    expect(stored.canteiros.find((canteiro) => canteiro.id === 1)?.status).toBe('em-descanso')
  })

  it('permite ao coordenador cadastrar um novo canteiro', () => {
    renderPage()

    fireEvent.click(screen.getByRole('button', { name: '+ Novo canteiro' }))
    expect(screen.getByRole('heading', { level: 3, name: 'Novo canteiro' })).toBeInTheDocument()

    fireEvent.change(screen.getByLabelText('Nome'), { target: { value: 'Canteiro 7' } })
    fireEvent.change(screen.getByLabelText('Setor'), {
      target: { value: 'Setor D — Frutíferas' },
    })
    fireEvent.change(screen.getByLabelText('Cultura atual'), { target: { value: 'Mamão' } })
    fireEvent.change(screen.getByLabelText('Status'), { target: { value: 'em-preparo' } })
    fireEvent.change(screen.getByLabelText('Responsável'), { target: { value: 'Mariana Alves' } })
    fireEvent.click(screen.getByRole('button', { name: 'Criar canteiro' }))

    expect(screen.getByRole('status')).toHaveTextContent(
      'Canteiro "Canteiro 7" criado com sucesso.',
    )
    expect(
      screen.getByRole('heading', { level: 4, name: 'Setor D — Frutíferas' }),
    ).toBeInTheDocument()

    const card = screen.getByRole('article', { name: 'Canteiro 7' })
    expect(within(card).getByText('Mamão')).toBeInTheDocument()
    expect(within(card).getByText('Em preparo')).toBeInTheDocument()
    expect(within(card).getByText('Mariana Alves')).toBeInTheDocument()
    expect(screen.getByTestId('canteiro-stat-total')).toHaveTextContent('7')

    const stored = storedState()
    expect(stored.canteiros.find((canteiro) => canteiro.id === 7)).toMatchObject({
      name: 'Canteiro 7',
      sector: 'Setor D — Frutíferas',
      currentCulture: 'Mamão',
      status: 'em-preparo',
      responsible: 'Mariana Alves',
    })
  })

  it('permite ao coordenador editar um canteiro existente', () => {
    renderPage()

    fireEvent.click(screen.getByRole('button', { name: 'Editar Canteiro 1' }))
    expect(screen.getByRole('heading', { level: 3, name: 'Editar Canteiro 1' })).toBeInTheDocument()

    fireEvent.change(screen.getByLabelText('Cultura atual'), { target: { value: 'Rúcula' } })
    fireEvent.change(screen.getByLabelText('Status'), { target: { value: 'em-descanso' } })
    fireEvent.change(screen.getByLabelText('Responsável'), {
      target: { value: 'Carlos Eduardo Lima' },
    })
    fireEvent.change(screen.getByLabelText('Data de plantio'), {
      target: { value: '2026-11-20' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Salvar alterações' }))

    expect(screen.getByRole('status')).toHaveTextContent(
      'Canteiro "Canteiro 1" atualizado com sucesso.',
    )

    const card = screen.getByRole('article', { name: 'Canteiro 1' })
    expect(within(card).getByText('Rúcula')).toBeInTheDocument()
    expect(within(card).getByText('Em descanso')).toBeInTheDocument()
    expect(within(card).getByText('Carlos Eduardo Lima')).toBeInTheDocument()
    expect(within(card).getByText('20/11/2026')).toBeInTheDocument()

    const stored = storedState()
    expect(stored.canteiros.find((canteiro) => canteiro.id === 1)).toMatchObject({
      currentCulture: 'Rúcula',
      status: 'em-descanso',
      responsible: 'Carlos Eduardo Lima',
      plantedAt: '2026-11-20',
    })
  })

  it('filtra o histórico por setor e por canteiro', () => {
    seedTwoRecords()
    renderPage()

    const history = screen.getByRole('region', { name: 'Histórico de plantio e manejo' })
    expect(screen.getByTestId('history-count')).toHaveTextContent('2 registros')
    expect(within(history).getByRole('row', { name: /Canteiro 1/ })).toBeInTheDocument()
    expect(within(history).getByRole('row', { name: /Canteiro 5/ })).toBeInTheDocument()

    fireEvent.change(screen.getByLabelText('Filtrar por setor'), {
      target: { value: 'Setor A — Hortaliças' },
    })

    expect(screen.getByTestId('history-count')).toHaveTextContent('1 de 2 registros')
    expect(within(history).getByRole('row', { name: /Canteiro 1/ })).toBeInTheDocument()
    expect(within(history).queryByRole('row', { name: /Canteiro 5/ })).not.toBeInTheDocument()

    fireEvent.change(screen.getByLabelText('Filtrar por setor'), {
      target: { value: 'todos' },
    })
    fireEvent.change(screen.getByLabelText('Filtrar por canteiro'), {
      target: { value: '5' },
    })

    expect(screen.getByTestId('history-count')).toHaveTextContent('1 de 2 registros')
    expect(within(history).queryByRole('row', { name: /Canteiro 1/ })).not.toBeInTheDocument()
    expect(within(history).getByRole('row', { name: /Canteiro 5/ })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Limpar filtros' }))

    expect(screen.getByTestId('history-count')).toHaveTextContent('2 registros')
    expect(within(history).getByRole('row', { name: /Canteiro 1/ })).toBeInTheDocument()
    expect(within(history).getByRole('row', { name: /Canteiro 5/ })).toBeInTheDocument()
  })

  it('registra uma data retroativa e exibe essa data no histórico', () => {
    renderPage()

    fireEvent.click(screen.getByRole('button', { name: '+ Novo plantio' }))
    fireEvent.change(screen.getByLabelText('Canteiro'), { target: { value: '5' } })
    fireEvent.change(screen.getByLabelText('Cultura'), { target: { value: 'Milho verde' } })
    fireEvent.change(screen.getByLabelText('Data do registro'), {
      target: { value: '2026-10-01' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Registrar no histórico' }))

    const history = screen.getByRole('region', { name: 'Histórico de plantio e manejo' })
    const historyRow = within(history).getByRole('row', { name: /Canteiro 5/ })
    expect(within(historyRow).getByText('01/10/2026')).toBeInTheDocument()

    const stored = storedState()
    expect(stored.records[0].date).toBe('2026-10-01')
    expect(stored.canteiros.find((canteiro) => canteiro.id === 5)?.plantedAt).toBe('2026-10-01')
  })

  it('exporta o histórico filtrado em CSV', async () => {
    seedTwoRecords()
    renderPage()

    const createObjectURL = vi.fn((_blob: Blob) => 'blob:historico')
    const revokeObjectURL = vi.fn()
    const originalCreate = URL.createObjectURL
    const originalRevoke = URL.revokeObjectURL

    Object.defineProperty(URL, 'createObjectURL', {
      configurable: true,
      value: createObjectURL,
    })
    Object.defineProperty(URL, 'revokeObjectURL', {
      configurable: true,
      value: revokeObjectURL,
    })
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})

    try {
      fireEvent.change(screen.getByLabelText('Filtrar por canteiro'), {
        target: { value: '1' },
      })
      fireEvent.click(screen.getByRole('button', { name: 'Exportar CSV' }))

      expect(createObjectURL).toHaveBeenCalledTimes(1)
      expect(revokeObjectURL).toHaveBeenCalledWith('blob:historico')
      expect(click).toHaveBeenCalledTimes(1)
      expect(screen.getByRole('status')).toHaveTextContent(
        'Histórico exportado com 1 registro.',
      )

      const blob = createObjectURL.mock.calls[0][0] as Blob
      const csv = await blob.text()
      expect(csv).toContain('"Alface crespa"')
      expect(csv).not.toContain('"Feijão-de-corda"')
    } finally {
      click.mockRestore()
      if (originalCreate) {
        Object.defineProperty(URL, 'createObjectURL', {
          configurable: true,
          value: originalCreate,
        })
      } else {
        Reflect.deleteProperty(URL, 'createObjectURL')
      }
      if (originalRevoke) {
        Object.defineProperty(URL, 'revokeObjectURL', {
          configurable: true,
          value: originalRevoke,
        })
      } else {
        Reflect.deleteProperty(URL, 'revokeObjectURL')
      }
    }
  })
})
