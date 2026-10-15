import { useState } from 'react'
import type { User, Tab, Production, Event } from '@/shared/types'
import { INITIAL_PRODUCTIONS, INITIAL_EVENTS } from '@/shared/constants'
import { Sidebar } from '@/shared/components'
import { LoginPage } from '@/features/auth'
import { Dashboard } from '@/features/dashboard'
import { ProducaoPage } from '@/features/production'
import { EventosPage } from '@/features/events'

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
