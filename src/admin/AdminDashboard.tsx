import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { BarChart2, Layers, SlidersHorizontal, Settings2, LogOut, ChevronRight } from 'lucide-react'
import { useAdminStore } from '../store/adminStore'
import Analytics     from './tabs/Analytics'
import AppConfig     from './tabs/AppConfig'
import AppSettings   from './tabs/AppSettings'
import SystemSettings from './tabs/SystemSettings'

type Tab = 'analytics' | 'apps' | 'settings' | 'system'

const NAV: { key: Tab; label: string; icon: typeof BarChart2; accent: string }[] = [
  { key: 'analytics', label: 'Analytics',  icon: BarChart2,          accent: '#00e5a0' },
  { key: 'apps',      label: 'App Config', icon: Layers,             accent: '#38d4ff' },
  { key: 'settings',  label: 'App Settings',icon: SlidersHorizontal, accent: '#b48aff' },
  { key: 'system',    label: 'System',     icon: Settings2,          accent: '#ffc130' },
]

export default function AdminDashboard() {
  const [tab, setTab] = useState<Tab>('analytics')
  const logout   = useAdminStore(s => s.logout)
  const navigate = useNavigate()

  const handleLogout = () => { logout(); navigate('/', { replace: true }) }

  const current = NAV.find(n => n.key === tab)!

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{ width: 800, height: 480, background: 'var(--bg)', display: 'flex', overflow: 'hidden' }}
    >
      {/* Sidebar (170px) */}
      <div style={{ width: 170, flexShrink: 0, height: 480, display: 'flex', flexDirection: 'column',
        background: '#07090f', borderRight: '1px solid #111724' }}>

        {/* Logo */}
        <div style={{ padding: '14px 16px 12px', borderBottom: '1px solid #111724' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 26, height: 26, borderRadius: 8,
              background: 'linear-gradient(135deg, #00e5a0, #38d4ff)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 2px 10px #00e5a040' }}>
              <span style={{ fontFamily: 'Nunito, var(--font-body)', fontWeight: 900, fontSize: 13, color: '#000' }}>P</span>
            </div>
            <div>
              <div style={{ fontFamily: 'Nunito, var(--font-body)', fontWeight: 900, fontSize: 13, lineHeight: 1 }}>
                <span style={{ background: 'linear-gradient(135deg, #e8f4ff, #cce8ff)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Pay</span>
                <span style={{ background: 'linear-gradient(135deg, #00e5a0, #38d4ff)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Traq</span>
              </div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 9, color: '#3a4560', marginTop: 2 }}>Admin Console</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 3, padding: '10px 8px', overflow: 'hidden' }}>
          {NAV.map(n => {
            const Icon = n.icon
            const sel  = tab === n.key
            return (
              <motion.button key={n.key} onClick={() => setTab(n.key)} whileTap={{ scale: 0.97 }}
                animate={{
                  background: sel ? n.accent + '15' : 'transparent',
                  borderColor: sel ? n.accent + '40' : 'transparent',
                }}
                style={{ width: '100%', padding: '9px 10px', borderRadius: 10, border: '1px solid', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', textAlign: 'left' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Icon size={14} color={sel ? n.accent : '#3a4560'} strokeWidth={1.5} />
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: sel ? 700 : 400,
                    color: sel ? n.accent : '#5a6a90' }}>{n.label}</span>
                </div>
                {sel && <ChevronRight size={10} color={n.accent} strokeWidth={2} />}
              </motion.button>
            )
          })}
        </div>

        {/* Footer: logout */}
        <div style={{ padding: '10px 8px', borderTop: '1px solid #111724' }}>
          <motion.button onClick={handleLogout} whileTap={{ scale: 0.95 }}
            style={{ width: '100%', padding: '9px 10px', borderRadius: 10, border: '1px solid #f8717130',
              background: '#f8717108', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
            <LogOut size={13} color="#f87171" strokeWidth={1.5} />
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: '#f87171' }}>Log out</span>
          </motion.button>
          <div style={{ marginTop: 8, fontFamily: 'var(--font-body)', fontSize: 9, color: '#2a3045', textAlign: 'center' }}>
            Session active
          </div>
        </div>
      </div>

      {/* Main content (630px) */}
      <div style={{ flex: 1, height: 480, overflow: 'hidden', position: 'relative' }}>
        {/* Tab header strip */}
        <div style={{ height: 36, flexShrink: 0, display: 'flex', alignItems: 'center',
          padding: '0 14px', background: '#07090f', borderBottom: '1px solid #111724', gap: 8 }}>
          <div style={{ width: 7, height: 7, borderRadius: '50%', background: current.accent,
            boxShadow: `0 0 8px ${current.accent}` }} />
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 11, color: current.accent, letterSpacing: '0.08em' }}>
            {current.label.toUpperCase()}
          </span>
        </div>

        {/* Content area */}
        <div style={{ height: 444, overflow: 'hidden', position: 'relative' }}>
          <AnimatePresence mode="wait">
            <motion.div key={tab}
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              style={{ height: '100%', overflow: 'hidden' }}
            >
              {tab === 'analytics' && <Analytics />}
              {tab === 'apps'      && <AppConfig />}
              {tab === 'settings'  && <AppSettings />}
              {tab === 'system'    && <SystemSettings />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  )
}
