import { useState } from 'react'
import type React from 'react'
import type { User } from '@/shared/types'
import { MOCK_USERS } from '@/shared/constants'

export function LoginPage({ onLogin }: { onLogin: (user: User) => void }) {
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
