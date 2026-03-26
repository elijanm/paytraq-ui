import { motion } from 'framer-motion'
import { ShoppingCart, Wind, Circle, Droplets, Scale, LayoutGrid, Sprout, Headphones, Smartphone, ToggleLeft, ToggleRight } from 'lucide-react'
import { useAdminStore, APP_LABELS, APP_ROUTES } from '../../store/adminStore'
import { type LucideIcon } from 'lucide-react'

const APP_ICONS: Record<string, LucideIcon> = {
  Vending: ShoppingCart, WashingMachine: Wind, PoolTable: Circle, LiquidDispenser: Droplets,
  WarehouseWeight: Scale, SoilAnalytics: Sprout, Addons: LayoutGrid, Support: Headphones,
}
const APP_ACCENTS: Record<string, string> = {
  Vending: '#00e5a0', WashingMachine: '#38d4ff', PoolTable: '#b48aff', LiquidDispenser: '#ff9044',
  WarehouseWeight: '#ffc130', SoilAnalytics: '#4ade80', Addons: '#ff6eb4', Support: '#818cf8',
}
const ALL_APPS = Object.keys(APP_LABELS)

export default function AppConfig() {
  const { visibleApps, toggleApp, singleAppMode, singleApp, setSingleAppMode, setSingleApp } = useAdminStore()

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 10, padding: '10px 14px', overflow: 'hidden' }}>

      <div style={{ fontFamily: 'var(--font-display)', fontSize: 12, color: 'var(--text)', letterSpacing: '0.05em', flexShrink: 0 }}>APP CONFIGURATION</div>

      {/* Single app mode */}
      <div style={{ borderRadius: 12, padding: '12px 14px', background: 'var(--surface)', border: `1px solid ${singleAppMode ? '#00e5a040' : '#1e2333'}`, flexShrink: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: singleAppMode ? 12 : 0 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Smartphone size={13} color={singleAppMode ? '#00e5a0' : '#5a6a90'} strokeWidth={1.5} />
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 11, color: singleAppMode ? '#00e5a0' : 'var(--text)', letterSpacing: '0.04em' }}>
                SINGLE APP MODE
              </span>
            </div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 10, color: '#5a6a90', marginTop: 3 }}>
              Lock kiosk to one service — home screen skipped
            </div>
          </div>
          <motion.button onClick={() => setSingleAppMode(!singleAppMode)} whileTap={{ scale: 0.9 }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: singleAppMode ? '#00e5a0' : '#3a4560', padding: 4 }}>
            {singleAppMode ? <ToggleRight size={28} strokeWidth={1.5} /> : <ToggleLeft size={28} strokeWidth={1.5} />}
          </motion.button>
        </div>

        {singleAppMode && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
            {ALL_APPS.map(app => {
              const Icon   = APP_ICONS[app] ?? ShoppingCart
              const accent = APP_ACCENTS[app]
              const sel    = singleApp === APP_ROUTES[app]
              return (
                <motion.button key={app} onClick={() => setSingleApp(APP_ROUTES[app])} whileTap={{ scale: 0.95 }}
                  style={{ borderRadius: 10, padding: '8px 6px', cursor: 'pointer', textAlign: 'center',
                    border: `1px solid ${sel ? accent + '70' : '#1e2333'}`,
                    background: sel ? accent + '15' : '#0a0d14' }}>
                  <div style={{ color: accent, marginBottom: 4 }}><Icon size={16} strokeWidth={1.5} /></div>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: 9, color: sel ? accent : '#5a6a90', lineHeight: 1.2 }}>
                    {APP_LABELS[app]}
                  </div>
                </motion.button>
              )
            })}
          </div>
        )}
      </div>

      {/* Visible apps grid */}
      <div style={{ borderRadius: 12, padding: '12px 14px', background: 'var(--surface)', border: '1px solid #1e2333', flex: 1, overflow: 'hidden' }}>
        <div style={{ marginBottom: 10, flexShrink: 0 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 11, color: 'var(--text)', letterSpacing: '0.04em' }}>VISIBLE APPS</div>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 10, color: '#5a6a90', marginTop: 2 }}>
            {visibleApps.length} of {ALL_APPS.length} shown on home grid
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
          {ALL_APPS.map((app, i) => {
            const Icon    = APP_ICONS[app] ?? ShoppingCart
            const accent  = APP_ACCENTS[app]
            const visible = visibleApps.includes(app)
            return (
              <motion.button key={app}
                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.04 }}
                onClick={() => toggleApp(app)} whileTap={{ scale: 0.95 }}
                style={{ borderRadius: 12, padding: '10px 8px', cursor: 'pointer',
                  border: `1px solid ${visible ? accent + '50' : '#1e2333'}`,
                  background: visible ? accent + '12' : '#0a0d14',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                  boxShadow: visible ? `0 2px 10px ${accent}15` : 'none',
                  transition: 'all 0.15s', position: 'relative' }}
              >
                {/* Visible badge */}
                <div style={{ position: 'absolute', top: 6, right: 6, width: 8, height: 8, borderRadius: '50%',
                  background: visible ? accent : '#1e2333',
                  boxShadow: visible ? `0 0 6px ${accent}` : 'none',
                  transition: 'all 0.15s' }} />
                <div style={{ color: visible ? accent : '#3a4560' }}><Icon size={18} strokeWidth={1.5} /></div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: 9, color: visible ? accent + 'cc' : '#3a4560',
                  textAlign: 'center', lineHeight: 1.2 }}>
                  {APP_LABELS[app]}
                </div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: 8, color: visible ? '#4ade8099' : '#3a4560' }}>
                  {visible ? 'Visible' : 'Hidden'}
                </div>
              </motion.button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
