import type React from 'react'
import type { User, Tab } from '../types'

export function Sidebar({
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
