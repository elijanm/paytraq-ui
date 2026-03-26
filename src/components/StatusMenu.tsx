import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Wifi, WifiOff, Lock, CheckCircle, XCircle, RefreshCw,
  BatteryCharging, BatteryFull, BatteryMedium, BatteryLow, Battery,
  X, Delete, ChevronLeft, Signal, Power,
} from 'lucide-react'

// ── Shutdown screen ────────────────────────────────────────────────────────────
const SHUTDOWN_STEPS = [
  'Syncing payment data…',
  'Flushing transaction log…',
  'Closing applications…',
  'Saving system state…',
  'Unmounting filesystems…',
  'Shutdown complete.',
]

const ORBITS = [
  { tiltX: 70,  tiltY:  0, tiltZ: 15,  dur: 3.2, delay: 0,   color: '#00e5a0', radius: 56 },
  { tiltX: 20,  tiltY: 60, tiltZ:-30,  dur: 4.1, delay: 0.8, color: '#38d4ff', radius: 56 },
  { tiltX: 10,  tiltY:-50, tiltZ: 60,  dur: 5.0, delay: 1.6, color: '#b48aff', radius: 56 },
]

function AtomicP() {
  return (
    <div style={{ position: 'relative', width: 130, height: 130, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {ORBITS.map((o, i) => (
        <div key={i} style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
          transform: `rotateX(${o.tiltX}deg) rotateY(${o.tiltY}deg) rotateZ(${o.tiltZ}deg)`, pointerEvents: 'none' }}>
          <div style={{ width: 116, height: 116, borderRadius: '50%', border: `1px solid ${o.color}40`, boxShadow: `0 0 8px ${o.color}20` }} />
        </div>
      ))}
      {ORBITS.map((o, i) => (
        <div key={i} style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
          transform: `rotateX(${o.tiltX}deg) rotateY(${o.tiltY}deg) rotateZ(${o.tiltZ}deg)` }}>
          <motion.div animate={{ rotate: 360 }} transition={{ duration: o.dur, delay: o.delay, repeat: Infinity, ease: 'linear' }}
            style={{ width: 0, height: 0, position: 'relative' }}>
            <div style={{ position: 'absolute', left: o.radius, top: -4, width: 8, height: 8, borderRadius: '50%',
              background: o.color, boxShadow: `0 0 10px ${o.color}, 0 0 20px ${o.color}80` }} />
          </motion.div>
        </div>
      ))}
      <motion.div animate={{ opacity: [0.4, 0.8, 0.4], scale: [0.95, 1.05, 0.95] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        style={{ position: 'absolute', width: 68, height: 68, borderRadius: '50%',
          background: 'radial-gradient(circle, #00e5a030 0%, transparent 70%)',
          boxShadow: '0 0 30px #00e5a040, 0 0 60px #00e5a015', pointerEvents: 'none' }} />
      <div style={{ position: 'relative', zIndex: 10, width: 52, height: 52, borderRadius: '50%',
        background: 'linear-gradient(145deg, #1a2a3a, #0c1620)', border: '2px solid #00e5a050',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 4px 24px #00e5a030, inset 0 1px 0 #00e5a040' }}>
        <span style={{ fontFamily: 'Nunito, var(--font-body)', fontWeight: 900, fontSize: 28,
          letterSpacing: '-1px', lineHeight: 1,
          background: 'linear-gradient(145deg, #e8f4ff 0%, #00e5a0 60%, #38d4ff 100%)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>P</span>
      </div>
    </div>
  )
}

type ShutdownPhase = 'steps' | 'logo' | 'blank'

function ShutdownScreen() {
  const [stepIdx, setStepIdx]   = useState(0)
  const [progress, setProgress] = useState(0)
  const [phase, setPhase]       = useState<ShutdownPhase>('steps')

  useEffect(() => {
    let step = 0
    const advance = () => {
      step++
      if (step < SHUTDOWN_STEPS.length) {
        setStepIdx(step)
        const delay = step === SHUTDOWN_STEPS.length - 1 ? 1200 : 600 + Math.random() * 400
        setTimeout(advance, delay)
      } else {
        // Steps done → show logo after short pause
        setTimeout(() => setPhase('logo'), 800)
        // Blank screen after 10 more seconds
        setTimeout(() => setPhase('blank'), 800 + 10000)
      }
    }
    setTimeout(advance, 700)
  }, [])

  useEffect(() => {
    setProgress((stepIdx + 1) / SHUTDOWN_STEPS.length)
  }, [stepIdx])

  const done = phase !== 'steps'

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      style={{ position: 'fixed', inset: 0, zIndex: 9999, width: 800, height: 480,
        background: '#06080f', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: 28 }}
    >
      <AnimatePresence mode="wait">

        {/* ── Phase: step log ── */}
        {phase === 'steps' && (
          <motion.div key="steps"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 0.95 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 28, width: '100%' }}>

            <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none',
              background: 'radial-gradient(ellipse 500px 300px at 50% 50%, #00e5a005 0%, transparent 70%)' }} />

            <motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity }}
              style={{ color: '#00e5a0' }}>
              <Power size={48} strokeWidth={1.2} />
            </motion.div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, width: 320 }}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16,
                color: 'var(--text)', letterSpacing: '0.06em' }}>
                Shutting Down Safely
              </div>

              <div style={{ width: '100%', height: 4, borderRadius: 2, background: '#1a1f2e', overflow: 'hidden' }}>
                <motion.div animate={{ width: `${progress * 100}%` }} transition={{ duration: 0.5, ease: 'easeOut' }}
                  style={{ height: '100%', borderRadius: 2, background: 'linear-gradient(90deg, #00e5a0aa, #00e5a0)',
                    boxShadow: '0 0 8px #00e5a060' }} />
              </div>

              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 4 }}>
                {SHUTDOWN_STEPS.slice(0, stepIdx + 1).map((step, i) => {
                  const isLast = i === stepIdx
                  return (
                    <motion.div key={step} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                      style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 6, height: 6, borderRadius: '50%', flexShrink: 0,
                        background: isLast ? '#00e5a0' : '#4ade80',
                        boxShadow: isLast ? '0 0 6px #00e5a0' : 'none' }} />
                      <span style={{ fontFamily: 'var(--font-body)', fontSize: 11,
                        color: isLast ? '#00e5a0' : '#3a4a60' }}>{step}</span>
                      {isLast && (
                        <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ duration: 1, repeat: Infinity }}
                          style={{ fontFamily: 'var(--font-display)', fontSize: 11, color: '#00e5a0' }}>▌</motion.span>
                      )}
                    </motion.div>
                  )
                })}
              </div>
            </div>
          </motion.div>
        )}

        {/* ── Phase: atomic P logo ── */}
        {phase === 'logo' && (
          <motion.div key="logo"
            initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 22 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
            <AtomicP />
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <span style={{ fontFamily: 'Nunito, var(--font-body)', fontWeight: 900, fontSize: 28,
                letterSpacing: '-0.5px',
                background: 'linear-gradient(90deg, #cce8ff, #00e5a0 50%, #38d4ff)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                PayTraq
              </span>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 10, color: '#3a4a60', letterSpacing: '0.12em' }}>
                SYSTEM OFFLINE
              </span>
            </motion.div>
          </motion.div>
        )}

        {/* ── Phase: blank ── */}
        {phase === 'blank' && (
          <motion.div key="blank"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ duration: 1.5, ease: 'easeIn' }}
            style={{ position: 'absolute', inset: 0, background: '#000' }} />
        )}

      </AnimatePresence>
    </motion.div>
  )
}

const WIFI_PIN = '12345'

// ── Simulated network list ────────────────────────────────────────────────────
interface Network { ssid: string; bars: number; secured: boolean; connected?: boolean }
const NETWORKS: Network[] = [
  { ssid: 'Paytraq-Kiosk',   bars: 4, secured: true,  connected: true  },
  { ssid: 'Office-5G',       bars: 3, secured: true  },
  { ssid: 'NexiNet-Fast',    bars: 3, secured: true  },
  { ssid: 'Guest-WiFi',      bars: 2, secured: false },
  { ssid: 'Safaricom-Home',  bars: 2, secured: true  },
  { ssid: 'Zuku_Router',     bars: 1, secured: true  },
]

// ── Signal bars icon ──────────────────────────────────────────────────────────
function SignalBars({ bars, color }: { bars: number; color: string }) {
  return (
    <svg width="16" height="13" viewBox="0 0 16 13" fill="none">
      {[0,1,2,3].map(i => (
        <rect key={i}
          x={i * 4} y={13 - (i + 1) * 3}
          width="3" height={(i + 1) * 3}
          rx="1"
          fill={i < bars ? color : color + '30'}
        />
      ))}
    </svg>
  )
}

// ── PIN modal (shown when a network is selected) ──────────────────────────────
interface PinModalProps { network: Network; onBack: () => void; onConnected: (ssid: string) => void }
function PinModal({ network, onBack, onConnected }: PinModalProps) {
  const [pin, setPin] = useState('')
  const [shake, setShake] = useState(false)
  const [phase, setPhase] = useState<'entry' | 'connecting' | 'ok' | 'fail'>('entry')
  const KEYS = ['1','2','3','4','5','6','7','8','9','','0','⌫']

  const handleKey = (k: string) => {
    if (phase !== 'entry') return
    if (k === '⌫') { setPin(p => p.slice(0, -1)); return }
    if (k === '') return
    if (pin.length >= 8) return
    setPin(p => p + k)
  }

  const tryConnect = () => {
    if (pin.length < 4) return
    setPhase('connecting')
    setTimeout(() => {
      const ok = !network.secured || pin === WIFI_PIN
      if (ok) {
        setPhase('ok')
        setTimeout(() => onConnected(network.ssid), 1000)
      } else {
        setPhase('fail')
        setShake(true)
        setTimeout(() => { setShake(false); setPhase('entry'); setPin('') }, 1400)
      }
    }, 1200)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '10px 14px' }}>
      {/* Back + network header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <motion.button whileTap={{ scale: 0.9 }} onClick={onBack}
          style={{ width: 26, height: 26, borderRadius: 7, border: '1px solid var(--border)', background: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: 0, flexShrink: 0 }}>
          <ChevronLeft size={13} strokeWidth={2.5} color="var(--text)" />
        </motion.button>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 11, color: 'var(--text)', lineHeight: 1 }}>{network.ssid}</div>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 9, color: 'var(--text-muted)', marginTop: 2 }}>
            {network.secured ? 'WPA2 Secured' : 'Open network'}
          </div>
        </div>
        <SignalBars bars={network.bars} color="#00e5a0" />
      </div>

      {/* Status feedback */}
      <AnimatePresence mode="wait">
        {phase === 'connecting' && (
          <motion.div key="conn" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '6px 0' }}>
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}>
              <RefreshCw size={12} color="#00e5a0" />
            </motion.div>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 10, color: '#00e5a0' }}>Connecting to {network.ssid}…</span>
          </motion.div>
        )}
        {phase === 'ok' && (
          <motion.div key="ok" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '6px 0' }}>
            <CheckCircle size={12} color="#00e5a0" />
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 10, color: '#00e5a0' }}>Connected!</span>
          </motion.div>
        )}
        {phase === 'fail' && (
          <motion.div key="fail" animate={{ x: [0, -6, 6, -4, 4, 0] }} transition={{ duration: 0.4 }}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '6px 0' }}>
            <XCircle size={12} color="#ff6060" />
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 10, color: '#ff6060' }}>Wrong password</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* PIN dots */}
      {(phase === 'entry' || phase === 'fail') && (
        <motion.div
          animate={shake ? { x: [0, -8, 8, -6, 6, 0] } : {}}
          transition={{ duration: 0.4 }}
          style={{ display: 'flex', justifyContent: 'center', gap: 6 }}
        >
          {Array.from({ length: Math.max(pin.length, 4) }).map((_, i) => (
            <motion.div key={i}
              animate={{ scale: i === pin.length - 1 ? [1, 1.3, 1] : 1 }}
              transition={{ duration: 0.15 }}
              style={{
                width: 10, height: 10, borderRadius: '50%',
                background: i < pin.length
                  ? (phase === 'fail' ? '#ff6060' : '#00e5a0')
                  : 'var(--border)',
                transition: 'background 0.15s',
              }}
            />
          ))}
        </motion.div>
      )}

      {/* Numpad */}
      {(phase === 'entry' || phase === 'fail') && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 5 }}>
            {KEYS.map((k, i) => (
              <motion.button key={i} whileTap={k ? { scale: 0.88 } : {}} onClick={() => handleKey(k)}
                style={{
                  height: 34, borderRadius: 8, cursor: k ? 'pointer' : 'default', padding: 0,
                  background: k === '⌫' ? '#00e5a010' : k ? 'var(--surface-2)' : 'transparent',
                  border: k ? `1px solid ${k === '⌫' ? '#00e5a030' : 'var(--border)'}` : 'none',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: k === '⌫' ? '#00e5a0' : 'var(--text)',
                  fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15,
                }}>
                {k === '⌫' ? <Delete size={13} strokeWidth={2} /> : k}
              </motion.button>
            ))}
          </div>

          <motion.button whileTap={{ scale: 0.96 }} onClick={tryConnect}
            disabled={pin.length < 4}
            style={{
              width: '100%', padding: '9px', borderRadius: 10, cursor: pin.length >= 4 ? 'pointer' : 'default',
              background: pin.length >= 4 ? 'linear-gradient(135deg, #00e5a0, #00a871)' : 'var(--surface-2)',
              border: 'none', color: pin.length >= 4 ? '#000' : 'var(--text-muted)',
              fontFamily: 'var(--font-body)', fontWeight: 800, fontSize: 12,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            }}>
            <Lock size={12} strokeWidth={2.5} />
            Connect
          </motion.button>
        </>
      )}
    </div>
  )
}

// ── WiFi tab — network list ───────────────────────────────────────────────────
function WifiTab({ online }: { online: boolean }) {
  const [connectedSsid, setConnectedSsid] = useState(online ? 'Paytraq-Kiosk' : '')
  const [selected, setSelected] = useState<Network | null>(null)
  const [scanning, setScanning] = useState(false)

  const networks = NETWORKS.map(n => ({ ...n, connected: n.ssid === connectedSsid }))

  const rescan = () => {
    setScanning(true)
    setTimeout(() => setScanning(false), 1200)
  }

  return (
    <AnimatePresence mode="wait">
      {selected ? (
        <motion.div key="pin" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 20, opacity: 0 }} transition={{ duration: 0.18 }}>
          <PinModal
            network={selected}
            onBack={() => setSelected(null)}
            onConnected={(ssid) => { setConnectedSsid(ssid); setSelected(null) }}
          />
        </motion.div>
      ) : (
        <motion.div key="list" initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} transition={{ duration: 0.18 }}>
          <div style={{ padding: '8px 10px 10px' }}>
            {/* Scan header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Available networks</span>
              <motion.button whileTap={{ scale: 0.88 }} onClick={rescan}
                style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '3px 8px', borderRadius: 6, border: '1px solid var(--border)', background: 'transparent', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <motion.div animate={scanning ? { rotate: 360 } : {}} transition={{ duration: 0.9, repeat: scanning ? Infinity : 0, ease: 'linear' }}>
                  <RefreshCw size={10} strokeWidth={2} />
                </motion.div>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: 9 }}>Scan</span>
              </motion.button>
            </div>

            {/* Network rows */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {networks.map((net, i) => (
                <motion.button key={net.ssid}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => net.connected ? null : setSelected(net)}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                    padding: '8px 10px', borderRadius: 10, cursor: net.connected ? 'default' : 'pointer',
                    background: net.connected ? '#00e5a010' : 'var(--surface-2)',
                    border: `1px solid ${net.connected ? '#00e5a035' : 'var(--border)'}`,
                    textAlign: 'left',
                  }}>
                  {/* Icon */}
                  <div style={{ color: net.connected ? '#00e5a0' : 'var(--text-muted)', flexShrink: 0 }}>
                    {net.connected ? <Wifi size={14} strokeWidth={1.8} /> : <Signal size={14} strokeWidth={1.8} />}
                  </div>

                  {/* SSID + type */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 11, color: net.connected ? '#00e5a0' : 'var(--text)', lineHeight: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {net.ssid}
                    </div>
                    <div style={{ fontFamily: 'var(--font-body)', fontSize: 9, color: 'var(--text-muted)', marginTop: 2 }}>
                      {net.connected ? 'Connected' : net.secured ? 'Secured' : 'Open'}
                    </div>
                  </div>

                  {/* Signal + lock */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0 }}>
                    <SignalBars bars={net.bars} color={net.connected ? '#00e5a0' : '#5a6a90'} />
                    {net.secured && <Lock size={9} strokeWidth={2} color={net.connected ? '#00e5a060' : '#3a4560'} />}
                    {net.connected && <CheckCircle size={12} strokeWidth={2} color="#00e5a0" />}
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ── Battery tab ───────────────────────────────────────────────────────────────
interface BatteryState { level: number; charging: boolean; chargingTime?: number; dischargingTime?: number }

function useBattery() {
  const [b, setBattery] = useState<BatteryState | null>(null)
  useEffect(() => {
    interface BM extends EventTarget { level: number; charging: boolean; chargingTime: number; dischargingTime: number }
    const nav = navigator as Navigator & { getBattery?: () => Promise<BM> }
    if (!nav.getBattery) return
    nav.getBattery().then(bm => {
      const sync = () => setBattery({ level: bm.level, charging: bm.charging, chargingTime: bm.chargingTime, dischargingTime: bm.dischargingTime })
      sync()
      bm.addEventListener('levelchange', sync)
      bm.addEventListener('chargingchange', sync)
    }).catch(() => {})
  }, [])
  return b
}

function fmtTime(sec: number): string {
  if (!isFinite(sec) || sec <= 0) return '—'
  const h = Math.floor(sec / 3600)
  const m = Math.floor((sec % 3600) / 60)
  return h > 0 ? `${h}h ${m}m` : `${m}m`
}

function BatteryTab({ onShutdown }: { onShutdown: () => void }) {
  const b = useBattery()
  const pct = b ? Math.round(b.level * 100) : null
  const barColor = !pct ? '#5a6a90' : pct > 50 ? '#00e5a0' : pct > 20 ? '#ffc130' : '#ff6060'

  function Icon() {
    if (!b)              return <Battery        size={32} color="#5a6a90" strokeWidth={1.2} />
    if (b.charging)      return <BatteryCharging size={32} color="#00e5a0" strokeWidth={1.2} />
    if (b.level > 0.7)   return <BatteryFull    size={32} color="#00e5a0" strokeWidth={1.2} />
    if (b.level > 0.3)   return <BatteryMedium  size={32} color="#ffc130" strokeWidth={1.2} />
    return                      <BatteryLow     size={32} color="#ff6060" strokeWidth={1.2} />
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: '14px 16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <Icon />
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 26, color: barColor, lineHeight: 1 }}>
            {pct !== null ? `${pct}%` : 'N/A'}
          </div>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 10, color: 'var(--text-muted)', marginTop: 3 }}>
            {!b ? 'Battery API unavailable' : b.charging ? 'Charging' : 'On battery'}
          </div>
        </div>
      </div>

      {b && (
        <div style={{ width: '100%', height: 8, borderRadius: 4, background: 'var(--surface-2)', overflow: 'hidden' }}>
          <motion.div initial={{ width: 0 }} animate={{ width: `${b.level * 100}%` }} transition={{ duration: 0.8, ease: 'easeOut' }}
            style={{ height: '100%', borderRadius: 4, background: barColor, boxShadow: `0 0 8px ${barColor}60` }} />
        </div>
      )}

      {b && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          {[
            { label: 'Status',       value: b.charging ? '⚡ Charging' : '🔋 Discharging' },
            { label: 'Time to full', value: b.charging ? fmtTime(b.chargingTime ?? 0) : '—' },
            { label: 'Time left',    value: !b.charging ? fmtTime(b.dischargingTime ?? 0) : '—' },
            { label: 'Level',        value: `${pct}%  (${b.level.toFixed(3)})` },
          ].map(row => (
            <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '5px 10px', borderRadius: 8, background: 'var(--surface-2)' }}>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 10, color: 'var(--text-muted)' }}>{row.label}</span>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 10, color: 'var(--text)', fontWeight: 700 }}>{row.value}</span>
            </div>
          ))}
        </div>
      )}

      {!b && (
        <div style={{ textAlign: 'center', padding: '8px 0' }}>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 10, color: 'var(--text-muted)' }}>Battery API not available in this browser.</div>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 9, color: 'var(--text-muted)', marginTop: 4 }}>Available on Chrome/Chromium on device.</div>
        </div>
      )}

      {/* Shutdown button */}
      <motion.button
        whileTap={{ scale: 0.96 }}
        onClick={onShutdown}
        style={{
          width: '100%', padding: '9px 0', borderRadius: 10, cursor: 'pointer',
          background: '#ff404015', border: '1px solid #ff404035',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
          color: '#ff6060', fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 12,
          transition: 'all 0.15s',
          marginTop: 2,
        }}
      >
        <Power size={13} strokeWidth={2} />
        Shutdown Device
      </motion.button>
    </div>
  )
}

// ── Main status menu ──────────────────────────────────────────────────────────
interface Props { onClose: () => void; online: boolean }

export default function StatusMenu({ onClose, online }: Props) {
  const [tab, setTab]           = useState<'wifi' | 'battery'>('wifi')
  const [shuttingDown, setShuttingDown] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) onClose()
    }
    setTimeout(() => window.addEventListener('mousedown', handler), 50)
    return () => window.removeEventListener('mousedown', handler)
  }, [onClose])

  if (shuttingDown) return <ShutdownScreen />

  return (
    <motion.div
      ref={menuRef}
      initial={{ opacity: 0, y: -8, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.96 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      style={{
        position: 'absolute', top: 38, right: 8, zIndex: 200,
        width: 290, borderRadius: 14,
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        boxShadow: '0 8px 40px #00000090, 0 0 0 1px #ffffff08',
        overflow: 'hidden',
      }}
    >
      {/* Tab bar */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', background: 'var(--surface-2)' }}>
        {(['wifi', 'battery'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            style={{
              flex: 1, height: 34, border: 'none', cursor: 'pointer', padding: 0,
              background: tab === t ? 'var(--surface)' : 'transparent',
              borderBottom: tab === t ? '2px solid #00e5a0' : '2px solid transparent',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
              color: tab === t ? '#00e5a0' : 'var(--text-muted)',
              fontFamily: 'var(--font-display)', fontSize: 10, fontWeight: 700,
              transition: 'all 0.15s',
            }}>
            {t === 'wifi'
              ? <><Wifi size={11} strokeWidth={2} />WiFi</>
              : <><Battery size={11} strokeWidth={2} />Battery</>
            }
          </button>
        ))}
        <button onClick={onClose}
          style={{ width: 34, height: 34, border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', flexShrink: 0 }}>
          <X size={13} strokeWidth={2} />
        </button>
      </div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        <motion.div key={tab} initial={{ opacity: 0, x: tab === 'wifi' ? -10 : 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
          {tab === 'wifi'
            ? <WifiTab online={online} />
            : <BatteryTab onShutdown={() => setShuttingDown(true)} />
          }
        </motion.div>
      </AnimatePresence>
    </motion.div>
  )
}
