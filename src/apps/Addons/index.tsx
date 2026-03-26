import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Tv, Beef, Store, Zap, Lock, Car, Snowflake, type LucideIcon } from 'lucide-react'
import BackButton from '../../components/BackButton'
import Marketplace from './Marketplace'

interface AppDef {
  id: string
  name: string
  icon: LucideIcon
  route: string
  accent: string
}

const ALL_APPS: AppDef[] = [
  { id: 'aflabox',     name: 'AflaBox',      icon: Tv,        route: '/addons/aflabox',     accent: '#f59e0b' },
  { id: 'livestock',   name: 'Livestock',    icon: Beef,      route: '/addons/livestock',   accent: '#00e5a0' },
  { id: 'kplc',        name: 'KPLC Token',   icon: Zap,       route: '/addons/kplc',        accent: '#fbbf24' },
  { id: 'lockers',     name: 'Lockers',      icon: Lock,      route: '/addons/lockers',     accent: '#60a5fa' },
  { id: 'parking',     name: 'Parking',      icon: Car,       route: '/addons/parking',     accent: '#a78bfa' },
  { id: 'coldstorage', name: 'Cold Storage', icon: Snowflake, route: '/addons/coldstorage', accent: '#67e8f9' },
]

const TOTAL_SLOTS = 6
const ACCENT = '#ff6eb4'

function loadInstalled(): string[] {
  try { return JSON.parse(localStorage.getItem('installed_addons') || '[]') } catch { return [] }
}

export default function Addons() {
  const navigate = useNavigate()
  const [installed, setInstalled] = useState<string[]>(loadInstalled)
  const [showMarket, setShowMarket] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  const handleInstall = (id: string) => {
    const next = [...installed, id]
    setInstalled(next)
    localStorage.setItem('installed_addons', JSON.stringify(next))
    const app = ALL_APPS.find(a => a.id === id)
    setToast(`${app?.name} installed successfully!`)
    setTimeout(() => setToast(null), 3000)
  }

  // Build slot list: installed apps first, then empty placeholders
  const installedApps = ALL_APPS.filter(a => installed.includes(a.id))
  const emptyCount = Math.max(0, TOTAL_SLOTS - installedApps.length)

  return (
    <motion.div
      style={{ width: 800, height: 480, background: 'var(--bg)', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    >
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: `radial-gradient(ellipse 500px 300px at 50% 50%, ${ACCENT}09 0%, transparent 70%)` }} />

      {/* Header */}
      <div style={{ position: 'relative', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', borderBottom: '1px solid var(--border)', background: 'var(--surface)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <BackButton />
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: ACCENT, boxShadow: `0 0 8px ${ACCENT}` }} />
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, color: 'var(--text)', lineHeight: 1 }}>Addons</div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>
              {installedApps.length} of {ALL_APPS.length} installed
            </div>
          </div>
        </div>

        {/* Marketplace button */}
        <motion.button
          whileTap={{ scale: 0.93 }}
          onClick={() => setShowMarket(true)}
          style={{
            display: 'flex', alignItems: 'center', gap: 7, padding: '8px 14px', borderRadius: 12, cursor: 'pointer',
            background: `linear-gradient(135deg, ${ACCENT}20, ${ACCENT}0a)`,
            border: `1px solid ${ACCENT}40`,
            color: ACCENT,
            fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 11,
            boxShadow: `0 2px 12px ${ACCENT}20`,
          }}
        >
          <Store size={14} strokeWidth={1.8} />
          Marketplace
        </motion.button>
      </div>

      {/* Grid */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', zIndex: 10 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>

          {/* Installed app slots */}
          {installedApps.map((app, i) => (
            <motion.button
              key={app.id}
              onClick={() => navigate(app.route)}
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: i * 0.06, type: 'spring', stiffness: 260, damping: 22 }}
              whileTap={{ scale: 0.93 }}
              style={{
                width: 220, height: 120, borderRadius: 18, cursor: 'pointer',
                background: `linear-gradient(145deg, ${app.accent}18 0%, var(--surface) 60%)`,
                border: `1.5px solid ${app.accent}35`,
                display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'space-between',
                padding: '16px 18px',
                boxShadow: `0 4px 20px ${app.accent}18`,
                position: 'relative', overflow: 'hidden',
              }}
            >
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, transparent, ${app.accent}60, transparent)` }} />
              <div style={{ width: 44, height: 44, borderRadius: 12, background: `${app.accent}20`, border: `1px solid ${app.accent}35`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: app.accent }}>
                <app.icon size={22} strokeWidth={1.5} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 12, color: 'var(--text)' }}>{app.name}</span>
                <div style={{ width: 20, height: 20, borderRadius: 6, background: `${app.accent}20`, border: `1px solid ${app.accent}40`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
                    <path d="M2.5 1.5l4 2.5-4 2.5" stroke={app.accent} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>
            </motion.button>
          ))}

          {/* Empty slots */}
          {Array.from({ length: emptyCount }, (_, i) => (
            <motion.button
              key={`empty-${i}`}
              onClick={() => setShowMarket(true)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: (installedApps.length + i) * 0.06 }}
              whileTap={{ scale: 0.95 }}
              style={{
                width: 220, height: 120, borderRadius: 18, cursor: 'pointer',
                background: 'transparent',
                border: `1.5px dashed var(--border)`,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8,
                position: 'relative', overflow: 'hidden',
                transition: 'border-color 0.2s',
              }}
            >
              <motion.div
                whileHover={{ scale: 1.1 }}
                style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--surface-2)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-dim)' }}
              >
                <Plus size={18} strokeWidth={1.5} />
              </motion.div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 10, color: 'var(--text-dim)' }}>Add Module</div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: 9, color: 'var(--text-dim)', marginTop: 2, opacity: 0.7 }}>Open marketplace</div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 16 }}
            style={{
              position: 'absolute', bottom: 24, left: '50%', transform: 'translateX(-50%)',
              padding: '10px 20px', borderRadius: 12,
              background: '#00e5a015', border: '1px solid #00e5a040',
              boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
              fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 13, color: '#00e5a0',
              whiteSpace: 'nowrap', zIndex: 10,
            }}
          >
            ✓ {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Marketplace overlay */}
      <AnimatePresence>
        {showMarket && (
          <Marketplace
            installed={installed}
            onInstall={handleInstall}
            onClose={() => setShowMarket(false)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  )
}
