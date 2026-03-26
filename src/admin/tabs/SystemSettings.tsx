import { motion } from 'framer-motion'
import { Globe, Clock, Info, Zap } from 'lucide-react'
import { useAdminStore } from '../../store/adminStore'

const TIMEZONES = [
  { value: 'Africa/Nairobi',     label: 'Nairobi (EAT UTC+3)' },
  { value: 'Africa/Lagos',       label: 'Lagos (WAT UTC+1)' },
  { value: 'Africa/Johannesburg',label: 'Johannesburg (SAST UTC+2)' },
  { value: 'Africa/Cairo',       label: 'Cairo (EET UTC+2)' },
  { value: 'Africa/Accra',       label: 'Accra (GMT UTC+0)' },
  { value: 'Europe/London',      label: 'London (GMT/BST)' },
  { value: 'UTC',                label: 'UTC' },
]

const IDLE_OPTIONS = [30, 60, 90, 120, 180, 300]

export default function SystemSettings() {
  const { timezone, setTimezone, idleTimeout, setIdleTimeout } = useAdminStore()

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 10, padding: '10px 14px', overflow: 'hidden' }}>

      <div style={{ fontFamily: 'var(--font-display)', fontSize: 12, color: 'var(--text)', letterSpacing: '0.05em', flexShrink: 0 }}>SYSTEM SETTINGS</div>

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

      {/* Device info */}
      <div style={{ borderRadius: 12, padding: '12px 14px', background: 'var(--surface)', border: '1px solid #1e2333', flex: 1, overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 10 }}>
          <Info size={13} color="#818cf8" strokeWidth={1.5} />
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 11, color: 'var(--text)', letterSpacing: '0.04em' }}>DEVICE INFO</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {[
            ['App Version',    'PayTraq v1.0.0'],
            ['Display',        '800 × 480 · Capacitive Touch'],
            ['Resolution',     `${window.screen.width} × ${window.screen.height}px`],
            ['Platform',       navigator.platform || 'Raspberry Pi'],
            ['User Agent',     navigator.userAgent.slice(0, 32) + '…'],
            ['Online',         navigator.onLine ? 'Connected' : 'Offline'],
            ['Language',       navigator.language],
            ['M-Pesa',         'STK Push · Simulated'],
          ].map(([k, v]) => (
            <div key={k} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 10, color: '#5a6a90' }}>{k}</span>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 10, color: '#8494b8' }}>{v}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Quick actions */}
      <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
        <motion.button whileTap={{ scale: 0.95 }}
          onClick={() => { if (confirm('Reload the kiosk interface?')) window.location.reload() }}
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
