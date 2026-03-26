import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Globe, Clock, Info, Zap, Monitor, Cpu, Wifi, WifiOff } from 'lucide-react'
import { useAdminStore } from '../../store/adminStore'

const TIMEZONES = [
  { value: 'Africa/Nairobi',      label: 'Nairobi (EAT UTC+3)' },
  { value: 'Africa/Lagos',        label: 'Lagos (WAT UTC+1)' },
  { value: 'Africa/Johannesburg', label: 'Johannesburg (SAST UTC+2)' },
  { value: 'Africa/Cairo',        label: 'Cairo (EET UTC+2)' },
  { value: 'Africa/Accra',        label: 'Accra (GMT UTC+0)' },
  { value: 'Europe/London',       label: 'London (GMT/BST)' },
  { value: 'UTC',                 label: 'UTC' },
]

const IDLE_OPTIONS = [30, 60, 90, 120, 180, 300]

type SysTab = 'general' | 'device'

// ── General tab ───────────────────────────────────────────────────────────────
function GeneralTab() {
  const { timezone, setTimezone, idleTimeout, setIdleTimeout } = useAdminStore()
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '10px 14px', height: '100%', overflow: 'hidden' }}>

      {/* Timezone */}
      <div style={{ borderRadius: 12, padding: '12px 14px', background: 'var(--surface)', border: '1px solid #1e2333', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 10 }}>
          <Globe size={13} color="#38d4ff" strokeWidth={1.5} />
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 11, color: 'var(--text)', letterSpacing: '0.04em' }}>TIMEZONE</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
          {TIMEZONES.map(tz => {
            const sel = timezone === tz.value
            return (
              <motion.button key={tz.value} onClick={() => setTimezone(tz.value)} whileTap={{ scale: 0.97 }}
                style={{ padding: '8px 10px', borderRadius: 10, cursor: 'pointer', textAlign: 'left',
                  border: `1px solid ${sel ? '#38d4ff50' : '#1e2333'}`,
                  background: sel ? '#38d4ff12' : '#0a0d14',
                  display: 'flex', alignItems: 'center', gap: 7 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: sel ? '#38d4ff' : '#2a3045', flexShrink: 0,
                  boxShadow: sel ? '0 0 6px #38d4ff' : 'none' }} />
                <span style={{ fontFamily: 'var(--font-body)', fontSize: 10, color: sel ? '#38d4ff' : '#5a6a90', lineHeight: 1.3 }}>
                  {tz.label}
                </span>
              </motion.button>
            )
          })}
        </div>
      </div>

      {/* Idle timeout */}
      <div style={{ borderRadius: 12, padding: '12px 14px', background: 'var(--surface)', border: '1px solid #1e2333', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 10 }}>
          <Clock size={13} color="#ffc130" strokeWidth={1.5} />
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 11, color: 'var(--text)', letterSpacing: '0.04em' }}>IDLE LOCK TIMEOUT</span>
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {IDLE_OPTIONS.map(sec => {
            const sel   = idleTimeout === sec
            const label = sec < 60 ? `${sec}s` : `${sec / 60}m`
            return (
              <motion.button key={sec} onClick={() => setIdleTimeout(sec)} whileTap={{ scale: 0.9 }}
                animate={{ background: sel ? '#ffc13020' : '#0a0d14', borderColor: sel ? '#ffc13050' : '#1e2333', color: sel ? '#ffc130' : '#5a6a90' }}
                style={{ padding: '7px 16px', borderRadius: 10, border: '1px solid', cursor: 'pointer',
                  fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 700 }}>
                {label}
              </motion.button>
            )
          })}
        </div>
        <div style={{ fontFamily: 'var(--font-body)', fontSize: 10, color: '#5a6a90', marginTop: 8 }}>
          Current: <span style={{ color: '#ffc130' }}>{idleTimeout}s</span> — lock screen activates after this period of inactivity.
        </div>
      </div>

      {/* Quick actions */}
      <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
        <motion.button whileTap={{ scale: 0.95 }}
          onClick={() => { if (window.confirm('Reload the kiosk interface?')) window.location.reload() }}
          style={{ flex: 1, padding: '9px', borderRadius: 10, border: '1px solid #ffc13030',
            background: '#ffc13010', color: '#ffc130', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 600 }}>
          <Zap size={12} strokeWidth={2} />
          Reload Kiosk
        </motion.button>
      </div>
    </div>
  )
}

// ── Device Info tab ───────────────────────────────────────────────────────────
function DeviceInfoTab() {
  const ua        = navigator.userAgent
  const online    = navigator.onLine
  const lang      = navigator.language
  const platform  = (navigator as Navigator & { userAgentData?: { platform?: string } }).userAgentData?.platform
                    || navigator.platform
                    || 'Unknown'
  const cores     = navigator.hardwareConcurrency ?? '—'
  const memory    = (navigator as Navigator & { deviceMemory?: number }).deviceMemory
                    ? `${(navigator as Navigator & { deviceMemory?: number }).deviceMemory} GB`
                    : '—'
  const dpr       = window.devicePixelRatio
  const screenW   = window.screen.width
  const screenH   = window.screen.height
  const innerW    = window.innerWidth
  const innerH    = window.innerHeight
  const colorDepth = window.screen.colorDepth

  // Browser / engine extract
  const browserMatch = ua.match(/(Chrome|Firefox|Safari|Edge|OPR)\/([0-9.]+)/)
  const browser   = browserMatch ? `${browserMatch[1]} ${browserMatch[2].split('.')[0]}` : 'Unknown'

  const rows: { label: string; value: string; accent?: string; icon?: typeof Info }[] = [
    { label: 'App',            value: 'PayTraq v1.0.0',                   accent: '#00e5a0', icon: Info },
    { label: 'Platform',       value: platform,                           icon: Cpu },
    { label: 'Browser',        value: browser,                            icon: Monitor },
    { label: 'Screen',         value: `${screenW} × ${screenH} px @ ${dpr}x DPR`, icon: Monitor },
    { label: 'Viewport',       value: `${innerW} × ${innerH} px`,         icon: Monitor },
    { label: 'Color Depth',    value: `${colorDepth}-bit`,                icon: Monitor },
    { label: 'CPU Cores',      value: String(cores),                      icon: Cpu },
    { label: 'RAM',            value: memory,                             icon: Cpu },
    { label: 'Network',        value: online ? 'Connected' : 'Offline',  accent: online ? '#00e5a0' : '#ff6060', icon: online ? Wifi : WifiOff },
    { label: 'Language',       value: lang,                               icon: Globe },
    { label: 'M-Pesa Mode',    value: 'STK Push · Simulated',            accent: '#4caf50', icon: Zap },
    { label: 'Target Display', value: '800 × 480 · Capacitive Touch',    icon: Monitor },
  ]

  return (
    <div style={{ height: '100%', overflowY: 'auto', padding: '10px 14px', scrollbarWidth: 'none' }}>
      <div style={{ borderRadius: 12, background: 'var(--surface)', border: '1px solid #1e2333', overflow: 'hidden' }}>
        {rows.map((row, i) => {
          const Icon = row.icon ?? Info
          return (
            <motion.div key={row.label}
              initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
              style={{ display: 'flex', alignItems: 'center', gap: 10,
                padding: '9px 14px',
                borderBottom: i < rows.length - 1 ? '1px solid #111724' : 'none',
                background: i % 2 === 0 ? 'transparent' : '#ffffff03' }}
            >
              <Icon size={12} color={row.accent ?? '#3a4560'} strokeWidth={1.5} style={{ flexShrink: 0 }} />
              <span style={{ flex: 1, fontFamily: 'var(--font-body)', fontSize: 10, color: '#5a6a90' }}>
                {row.label}
              </span>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 10,
                color: row.accent ?? '#8494b8', fontWeight: 700, textAlign: 'right',
                maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {row.value}
              </span>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

// ── Main SystemSettings ───────────────────────────────────────────────────────
const TABS: { key: SysTab; label: string }[] = [
  { key: 'general', label: 'General' },
  { key: 'device',  label: 'Device Info' },
]

export default function SystemSettings() {
  const [tab, setTab] = useState<SysTab>('general')

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

      {/* Sub-tab bar */}
      <div style={{ display: 'flex', gap: 4, padding: '8px 14px 0', flexShrink: 0,
        borderBottom: '1px solid #111724' }}>
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            style={{
              padding: '5px 14px', border: 'none', cursor: 'pointer',
              background: 'transparent',
              borderBottom: tab === t.key ? '2px solid #ffc130' : '2px solid transparent',
              color: tab === t.key ? '#ffc130' : '#5a6a90',
              fontFamily: 'var(--font-display)', fontSize: 10, fontWeight: 700,
              letterSpacing: '0.04em', marginBottom: -1,
              transition: 'all 0.15s',
            }}>
            {t.label.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
        <AnimatePresence mode="wait">
          <motion.div key={tab}
            initial={{ opacity: 0, x: tab === 'general' ? -10 : 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            style={{ height: '100%' }}
          >
            {tab === 'general' && <GeneralTab />}
            {tab === 'device'  && <DeviceInfoTab />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
