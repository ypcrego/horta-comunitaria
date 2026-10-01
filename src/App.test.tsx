import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, fireEvent, act, within } from '@testing-library/react'
import App from './App'

describe('Caracterização do App (comportamento original)', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    act(() => {
      vi.runOnlyPendingTimers()
    })
    vi.useRealTimers()
  })

  function loginAs(email: string, pass: string = 'senha123') {
    const emailInput = screen.getByPlaceholderText('seu@email.com')
    const passInput = screen.getByPlaceholderText('••••••••')
    const submitBtn = screen.getByRole('button', { name: /entrar/i })

    fireEvent.change(emailInput, { target: { value: email } })
    fireEvent.change(passInput, { target: { value: pass } })
    fireEvent.click(submitBtn)

    act(() => {
      vi.advanceTimersByTime(650)
    })
  }

  describe('1. Autenticação e Perfis', () => {
    it('deve realizar login com perfil coordenador', () => {
      render(<App />)
      expect(screen.getByText('Entrar no sistema')).toBeInTheDocument()

      loginAs('coordenador@ufrn.br', 'senha123')

      expect(screen.getByText('Bom dia, Ana.')).toBeInTheDocument()
      expect(screen.getByText('Você tem acesso completo ao sistema de gestão.')).toBeInTheDocument()
      expect(screen.getByText('Ana Beatriz Costa')).toBeInTheDocument()
      expect(screen.getByText('Coordenador(a)')).toBeInTheDocument()
    })

    it('deve realizar login com perfil voluntário', () => {
      render(<App />)
      loginAs('voluntario@ufrn.br', 'senha123')

      expect(screen.getByText('Bom dia, Carlos.')).toBeInTheDocument()
      expect(screen.getByText('Você está logado como voluntário — acesso de leitura.')).toBeInTheDocument()
      expect(screen.getByText('Carlos Eduardo Lima')).toBeInTheDocument()
      expect(screen.getByText('Voluntário(a)')).toBeInTheDocument()
    })

    it('deve exibir mensagem de erro ao tentar logar com senha incorreta', () => {
      render(<App />)
      loginAs('coordenador@ufrn.br', 'senha-errada')

      expect(screen.getByText('E-mail ou senha incorretos.')).toBeInTheDocument()
      expect(screen.queryByText('Bom dia, Ana.')).not.toBeInTheDocument()
    })
  })

  describe('2. Permissões e restrições do Voluntário', () => {
    it('não deve permitir que o voluntário cadastre produção', () => {
      render(<App />)
      loginAs('voluntario@ufrn.br', 'senha123')

      fireEvent.click(screen.getByRole('button', { name: /produção/i }))

      expect(
        screen.getByText(/você está visualizando os dados como voluntário\. o cadastro de novos registros é restrito ao coordenador\./i)
      ).toBeInTheDocument()
      expect(screen.queryByRole('button', { name: /\+ novo registro/i })).not.toBeInTheDocument()
    })

    it('não deve permitir que o voluntário agende evento e deve exibir badge de somente leitura', () => {
      render(<App />)
      loginAs('voluntario@ufrn.br', 'senha123')

      fireEvent.click(screen.getByRole('button', { name: /eventos/i }))

      expect(
        screen.getByText(/você está visualizando os eventos como voluntário\. o agendamento de novos eventos é restrito ao coordenador\./i)
      ).toBeInTheDocument()
      expect(screen.queryByRole('button', { name: /\+ novo evento/i })).not.toBeInTheDocument()
      expect(screen.getAllByText('somente leitura').length).toBeGreaterThan(0)
    })
  })

  describe('3. Adicionar Produção (Coordenador)', () => {
    it('deve abrir formulário, cadastrar novo registro e exibir na tabela e somatório', () => {
      render(<App />)
      loginAs('coordenador@ufrn.br', 'senha123')

      fireEvent.click(screen.getByRole('button', { name: /produção/i }))

      const novoBtn = screen.getByRole('button', { name: /\+ novo registro/i })
      fireEvent.click(novoBtn)

      expect(screen.getByText('Novo registro de produção')).toBeInTheDocument()

      const pesoInput = screen.getByPlaceholderText('ex: 12.5')
      fireEvent.change(pesoInput, { target: { value: '14.2' } })

      const salvarBtn = screen.getByRole('button', { name: /salvar/i })
      fireEvent.click(salvarBtn)

      expect(screen.getByText(/registro salvo com sucesso para/i)).toBeInTheDocument()
      expect(screen.getByText('14.2')).toBeInTheDocument()
      expect(screen.getAllByText('Ana Beatriz Costa').length).toBeGreaterThan(0)
    })
  })

  describe('4. Criar Evento (Coordenador)', () => {
    it('deve abrir formulário, agendar novo evento e exibir nos cards', () => {
      render(<App />)
      loginAs('coordenador@ufrn.br', 'senha123')

      fireEvent.click(screen.getByRole('button', { name: /eventos/i }))

      const novoBtn = screen.getByRole('button', { name: /\+ novo evento/i })
      fireEvent.click(novoBtn)

      expect(screen.getByText('Novo Evento')).toBeInTheDocument()

      fireEvent.change(screen.getByPlaceholderText('ex: Visita guiada — Turma de Biologia'), {
        target: { value: 'Oficina de Compostagem Avançada' },
      })
      fireEvent.change(screen.getByPlaceholderText('ex: 30'), {
        target: { value: '18' },
      })
      fireEvent.change(screen.getByPlaceholderText('Descreva brevemente o evento…'), {
        target: { value: 'Aprenda técnicas de adubação orgânica e manejo do solo.' },
      })

      // Select date and time
      const dateInput = document.querySelector('input[type="date"]') as HTMLInputElement
      const timeInput = document.querySelector('input[type="time"]') as HTMLInputElement
      fireEvent.change(dateInput, { target: { value: '2026-11-20' } })
      fireEvent.change(timeInput, { target: { value: '10:30' } })

      const agendarBtn = screen.getByRole('button', { name: /agendar evento/i })
      fireEvent.click(agendarBtn)

      expect(screen.getByText(/evento criado com sucesso e adicionado à lista de próximos eventos\./i)).toBeInTheDocument()
      expect(screen.getByText('Oficina de Compostagem Avançada')).toBeInTheDocument()
      expect(screen.getByText('10:30')).toBeInTheDocument()
      expect(screen.getByText('18 vagas')).toBeInTheDocument()
      expect(screen.getAllByText(/por Ana Beatriz Costa/i).length).toBeGreaterThanOrEqual(2)
    })
  })

  describe('5. Navegação entre abas e logout', () => {
    it('deve alternar entre Painel, Produção, Eventos e realizar Logout', () => {
      render(<App />)
      loginAs('coordenador@ufrn.br', 'senha123')

      // Inicialmente no Painel
      expect(screen.getByText('Últimos registros de produção')).toBeInTheDocument()

      // Navegar para Produção
      fireEvent.click(screen.getByRole('button', { name: /produção/i }))
      expect(screen.getByRole('heading', { level: 2, name: 'Produção' })).toBeInTheDocument()

      // Navegar para Eventos
      fireEvent.click(screen.getByRole('button', { name: /eventos/i }))
      expect(screen.getByRole('heading', { level: 2, name: 'Eventos' })).toBeInTheDocument()

      // Voltar para Painel
      fireEvent.click(screen.getByRole('button', { name: /painel/i }))
      expect(screen.getByText('Últimos registros de produção')).toBeInTheDocument()

      // Logout
      fireEvent.click(screen.getByRole('button', { name: /sair do sistema/i }))
      expect(screen.getByText('Entrar no sistema')).toBeInTheDocument()
    })
  })
})
