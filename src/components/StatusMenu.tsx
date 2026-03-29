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

const WIFI_API = 'http://127.0.0.1:3001'

// ── Network type ──────────────────────────────────────────────────────────────
interface Network { ssid: string; bars: number; signal?: number; secured: boolean; connected?: boolean }

const MOCK_NETWORKS: Network[] = [
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

// ── Full-screen WiFi password overlay with QWERTY keyboard ───────────────────
const KB_ROWS_ALPHA = [
  ['q','w','e','r','t','y','u','i','o','p'],
  ['a','s','d','f','g','h','j','k','l'],
  ['⇧','z','x','c','v','b','n','m','⌫'],
]
const KB_ROWS_NUM = [
  ['1','2','3','4','5','6','7','8','9','0'],
  ['-','/','_','.','@','#','!','&','(', ')'],
  ['⇧','%','+','=','~','^','*','<','>','⌫'],
]

interface WifiConnectOverlayProps {
  network: Network
  apiAvailable: boolean
  onBack: () => void
  onConnected: (ssid: string) => void
}

function WifiConnectOverlay({ network, apiAvailable, onBack, onConnected }: WifiConnectOverlayProps) {
  const [password, setPassword] = useState('')
  const [caps, setCaps]         = useState(false)
  const [numMode, setNumMode]   = useState(false)
  const [phase, setPhase]       = useState<'entry' | 'connecting' | 'ok' | 'fail'>('entry')
  const [errorMsg, setErrorMsg] = useState('')
  const [showPw, setShowPw]     = useState(false)

  const rows = numMode ? KB_ROWS_NUM : KB_ROWS_ALPHA

  const handleKey = (k: string) => {
    if (phase !== 'entry') return
    if (k === '⌫') { setPassword(p => p.slice(0, -1)); return }
    if (k === '⇧') { setNumMode(m => !m); setCaps(false); return }
    const char = (!numMode && caps) ? k.toUpperCase() : k
    setPassword(p => p + char)
    if (caps && !numMode) setCaps(false)
  }

  const tryConnect = async () => {
    if (!network.secured && password === '' || password.length < 1) {
      // open network — connect directly
    }
    setPhase('connecting')

    if (apiAvailable) {
      try {
        const res = await fetch(`${WIFI_API}/wifi/connect`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ssid: network.ssid, password: network.secured ? password : undefined }),
        })
        const data = await res.json()
        if (data.ok) { setPhase('ok'); setTimeout(() => onConnected(network.ssid), 1200) }
        else { setErrorMsg(data.error ?? 'Connection failed'); setPhase('fail'); setTimeout(() => { setPhase('entry'); setPassword('') }, 2000) }
      } catch {
        setErrorMsg('Sidecar not reachable'); setPhase('fail'); setTimeout(() => { setPhase('entry'); setPassword('') }, 2000)
      }
    } else {
      // simulation
      setTimeout(() => {
        setPhase('ok')
        setTimeout(() => onConnected(network.ssid), 1200)
      }, 1400)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(4,6,12,0.92)',
        backdropFilter: 'blur(8px)', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: 0 }}
    >
      <motion.div
        initial={{ scale: 0.94, y: 20 }} animate={{ scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 320, damping: 28 }}
        style={{ width: 760, background: 'var(--surface)', borderRadius: 20,
          border: '1px solid var(--border)', overflow: 'hidden',
          boxShadow: '0 24px 60px rgba(0,0,0,0.6)' }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 18px',
          borderBottom: '1px solid var(--border)', background: 'var(--surface-2)' }}>
          <motion.button whileTap={{ scale: 0.9 }} onClick={onBack}
            style={{ width: 32, height: 32, borderRadius: 9, border: '1px solid var(--border)',
              background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', padding: 0, flexShrink: 0 }}>
            <ChevronLeft size={16} strokeWidth={2.5} color="var(--text)" />
          </motion.button>
          <Wifi size={16} color="#00e5a0" strokeWidth={1.8} />
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, color: 'var(--text)' }}>
              {network.ssid}
            </div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 10, color: 'var(--text-muted)' }}>
              {network.secured ? 'Enter WiFi password' : 'Open network — tap Connect'}
            </div>
          </div>
          <SignalBars bars={network.bars} color="#00e5a0" />
        </div>

        {/* Password field */}
        <div style={{ padding: '12px 18px 8px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ flex: 1, padding: '10px 14px', borderRadius: 10, minHeight: 40,
            background: 'var(--bg)', border: '1px solid var(--border)',
            fontFamily: 'var(--font-display)', fontSize: 16, color: 'var(--text)',
            letterSpacing: showPw ? '0.04em' : '0.22em',
            overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
            {password.length > 0
              ? (showPw ? password : '●'.repeat(password.length))
              : <span style={{ color: 'var(--text-muted)', fontSize: 12, letterSpacing: '0.04em' }}>password</span>
            }
          </div>
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => setShowPw(s => !s)}
            style={{ width: 38, height: 38, borderRadius: 9, border: '1px solid var(--border)',
              background: showPw ? '#00e5a015' : 'var(--surface-2)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span style={{ fontSize: 14 }}>{showPw ? '🙈' : '👁'}</span>
          </motion.button>
        </div>

        {/* Status */}
        <AnimatePresence mode="wait">
          {phase !== 'entry' && (
            <motion.div key={phase} initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              style={{ padding: '4px 18px 0', display: 'flex', alignItems: 'center', gap: 6 }}>
              {phase === 'connecting' && <>
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}>
                  <RefreshCw size={11} color="#00e5a0" />
                </motion.div>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: 10, color: '#00e5a0' }}>Connecting…</span>
              </>}
              {phase === 'ok' && <>
                <CheckCircle size={11} color="#00e5a0" />
                <span style={{ fontFamily: 'var(--font-body)', fontSize: 10, color: '#00e5a0' }}>Connected!</span>
              </>}
              {phase === 'fail' && <>
                <XCircle size={11} color="#ff6060" />
                <span style={{ fontFamily: 'var(--font-body)', fontSize: 10, color: '#ff6060' }}>{errorMsg || 'Incorrect password'}</span>
              </>}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Keyboard */}
        <div style={{ padding: '8px 14px 10px', display: 'flex', flexDirection: 'column', gap: 5 }}>
          {rows.map((row, ri) => (
            <div key={ri} style={{ display: 'flex', gap: 5, justifyContent: 'center' }}>
              {row.map((k, ki) => {
                const isSpecial = k === '⌫' || k === '⇧'
                const isShiftActive = k === '⇧' && (caps || numMode)
                const label = (!numMode && caps && k.length === 1 && k !== '⇧') ? k.toUpperCase() : k
                return (
                  <motion.button key={ki} whileTap={{ scale: 0.84 }} onClick={() => handleKey(k)}
                    style={{
                      height: 44, minWidth: isSpecial ? 60 : 64, flex: isSpecial ? '0 0 60px' : '1',
                      borderRadius: 9, cursor: 'pointer', padding: 0,
                      background: isShiftActive
                        ? '#00e5a030'
                        : isSpecial ? 'var(--surface-2)' : 'var(--bg)',
                      border: `1px solid ${isShiftActive ? '#00e5a060' : isSpecial ? 'var(--border)' : 'var(--border)'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: k === '⌫' ? '#00e5a0' : isShiftActive ? '#00e5a0' : 'var(--text)',
                      fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14,
                      boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                    }}>
                    {k === '⌫' ? <Delete size={14} strokeWidth={2} /> : label}
                  </motion.button>
                )
              })}
            </div>
          ))}

          {/* Bottom row: mode toggle + space + connect */}
          <div style={{ display: 'flex', gap: 5, marginTop: 2 }}>
            <motion.button whileTap={{ scale: 0.9 }} onClick={() => setNumMode(m => !m)}
              style={{ width: 76, height: 44, borderRadius: 9, cursor: 'pointer',
                background: numMode ? '#00e5a015' : 'var(--surface-2)', border: `1px solid ${numMode ? '#00e5a040' : 'var(--border)'}`,
                fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 11,
                color: numMode ? '#00e5a0' : 'var(--text-muted)' }}>
              {numMode ? 'ABC' : '?123'}
            </motion.button>
            <motion.button whileTap={{ scale: 0.97 }} onClick={() => handleKey(' ')}
              style={{ flex: 1, height: 44, borderRadius: 9, cursor: 'pointer',
                background: 'var(--bg)', border: '1px solid var(--border)',
                fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--text-muted)' }}>
              space
            </motion.button>
            <motion.button whileTap={{ scale: 0.96 }} onClick={tryConnect}
              disabled={network.secured && password.length < 1}
              style={{ width: 120, height: 44, borderRadius: 9, cursor: 'pointer',
                background: (!network.secured || password.length >= 1)
                  ? 'linear-gradient(135deg, #00e5a0, #00a871)'
                  : 'var(--surface-2)',
                border: 'none',
                color: (!network.secured || password.length >= 1) ? '#000' : 'var(--text-muted)',
                fontFamily: 'var(--font-body)', fontWeight: 800, fontSize: 13,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                boxShadow: (!network.secured || password.length >= 1) ? '0 4px 16px #00e5a040' : 'none' }}>
              <Lock size={13} strokeWidth={2.5} />
              Connect
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ── WiFi tab — network list ───────────────────────────────────────────────────
function WifiTab({ online }: { online: boolean }) {
  const [networks, setNetworks]       = useState<Network[]>(MOCK_NETWORKS.map(n => ({ ...n })))
  const [connectedSsid, setConnectedSsid] = useState(online ? MOCK_NETWORKS[0].ssid : '')
  const [selected, setSelected]       = useState<Network | null>(null)
  const [scanning, setScanning]       = useState(false)
  const [apiAvailable, setApiAvailable] = useState(false)

  const fetchNetworks = async () => {
    setScanning(true)
    try {
      const res  = await fetch(`${WIFI_API}/wifi/scan`, { signal: AbortSignal.timeout(12000) })
      const data = await res.json()
      if (data.ok && data.networks.length > 0) {
        setNetworks(data.networks)
        const conn = data.networks.find((n: Network) => n.connected)
        if (conn) setConnectedSsid(conn.ssid)
        setApiAvailable(true)
      }
    } catch {
      // sidecar not available — keep mock data, simulation mode
    }
    setScanning(false)
  }

  useEffect(() => { fetchNetworks() }, [])

  const displayNetworks = networks.map(n => ({ ...n, connected: n.connected || n.ssid === connectedSsid }))

  return (
    <>
      <AnimatePresence mode="wait">
        <motion.div key="list" initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} transition={{ duration: 0.18 }}>
          <div style={{ padding: '8px 10px 10px' }}>
            {/* Scan header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Available networks</span>
                {apiAvailable && (
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: 8, color: '#00e5a060', padding: '1px 5px', borderRadius: 4, background: '#00e5a010', border: '1px solid #00e5a020' }}>LIVE</span>
                )}
              </div>
              <motion.button whileTap={{ scale: 0.88 }} onClick={fetchNetworks}
                style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '3px 8px', borderRadius: 6, border: '1px solid var(--border)', background: 'transparent', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <motion.div animate={scanning ? { rotate: 360 } : {}} transition={{ duration: 0.9, repeat: scanning ? Infinity : 0, ease: 'linear' }}>
                  <RefreshCw size={10} strokeWidth={2} />
                </motion.div>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: 9 }}>Scan</span>
              </motion.button>
            </div>

            {/* Network rows */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {displayNetworks.map((net, i) => (
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
                  <div style={{ color: net.connected ? '#00e5a0' : 'var(--text-muted)', flexShrink: 0 }}>
                    {net.connected ? <Wifi size={14} strokeWidth={1.8} /> : <Signal size={14} strokeWidth={1.8} />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 11, color: net.connected ? '#00e5a0' : 'var(--text)', lineHeight: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {net.ssid}
                    </div>
                    <div style={{ fontFamily: 'var(--font-body)', fontSize: 9, color: 'var(--text-muted)', marginTop: 2 }}>
                      {net.connected ? 'Connected' : net.secured ? 'Secured' : 'Open'}
                    </div>
                  </div>
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
      </AnimatePresence>

      {/* Full-screen password overlay */}
      <AnimatePresence>
        {selected && (
          <WifiConnectOverlay
            network={selected}
            apiAvailable={apiAvailable}
            onBack={() => setSelected(null)}
            onConnected={(ssid) => { setConnectedSsid(ssid); setSelected(null) }}
          />
        )}
      </AnimatePresence>
    </>
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

interface HwBattery { ok: true; voltage: number; currentMA: number; percent: number; charging: boolean }

function BatteryTab({ onShutdown }: { onShutdown: () => void }) {
  const webB = useBattery()

  // Real hardware data from INA219 via sidecar
  const [hw, setHw]         = useState<HwBattery | null>(null)
  const [hwError, setHwError] = useState<string | null>(null)
  const [polling, setPolling] = useState(false)

  const fetchHw = async () => {
    try {
      const res  = await fetch(`${WIFI_API}/battery`, { signal: AbortSignal.timeout(5000) })
      const data = await res.json()
      if (data.ok) { setHw(data as HwBattery); setHwError(null) }
      else setHwError(data.hint ?? data.error ?? 'I2C read failed')
    } catch {
      setHwError('Sidecar not reachable')
    }
  }

  useEffect(() => {
    fetchHw()
    const id = setInterval(fetchHw, 30_000)
    return () => clearInterval(id)
  }, [])

  // Prefer hardware reading; fall back to Web Battery API
  const pct      = hw ? hw.percent : (webB ? Math.round(webB.level * 100) : null)
  const charging = hw ? hw.charging : (webB?.charging ?? false)
  const source   = hw ? 'X1203 UPS' : webB ? 'Web API' : null

  const barColor = pct === null ? '#5a6a90' : pct > 50 ? '#00e5a0' : pct > 20 ? '#ffc130' : '#ff6060'

  function Icon() {
    if (pct === null)  return <Battery         size={32} color="#5a6a90" strokeWidth={1.2} />
    if (charging)      return <BatteryCharging size={32} color="#00e5a0" strokeWidth={1.2} />
    if (pct > 70)      return <BatteryFull     size={32} color="#00e5a0" strokeWidth={1.2} />
    if (pct > 30)      return <BatteryMedium   size={32} color="#ffc130" strokeWidth={1.2} />
    return                    <BatteryLow      size={32} color="#ff6060" strokeWidth={1.2} />
  }

  const rows = hw ? [
    { label: 'Status',   value: charging ? '⚡ Charging' : '🔋 Discharging' },
    { label: 'Voltage',  value: `${hw.voltage.toFixed(2)} V` },
    { label: 'Current',  value: `${hw.currentMA > 0 ? '+' : ''}${hw.currentMA} mA` },
    { label: 'Charge',   value: `${hw.percent}%` },
    { label: 'Source',   value: 'Suptronics X1203' },
  ] : webB ? [
    { label: 'Status',       value: charging ? '⚡ Charging' : '🔋 Discharging' },
    { label: 'Time to full', value: charging ? fmtTime(webB.chargingTime ?? 0) : '—' },
    { label: 'Time left',    value: !charging ? fmtTime(webB.dischargingTime ?? 0) : '—' },
    { label: 'Level',        value: `${pct}%` },
    { label: 'Source',       value: 'Web Battery API' },
  ] : []

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: '14px 16px' }}>
      {/* Big readout */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <Icon />
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 26, color: barColor, lineHeight: 1 }}>
              {pct !== null ? `${pct}%` : 'N/A'}
            </div>
            {hw && (
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 12, color: 'var(--text-muted)' }}>
                {hw.voltage.toFixed(2)} V
              </div>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3 }}>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 10, color: 'var(--text-muted)' }}>
              {pct === null ? 'No data' : charging ? 'Charging' : 'On battery'}
            </div>
            {source && (
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 8, color: hw ? '#00e5a060' : '#5a6a90',
                padding: '1px 5px', borderRadius: 4, background: hw ? '#00e5a010' : 'var(--surface-2)',
                border: `1px solid ${hw ? '#00e5a020' : 'var(--border)'}` }}>
                {source}
              </span>
            )}
            {/* Refresh button */}
            <motion.button whileTap={{ scale: 0.88 }} onClick={() => { setPolling(true); fetchHw().finally(() => setPolling(false)) }}
              style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 3, padding: '2px 7px',
                borderRadius: 5, border: '1px solid var(--border)', background: 'transparent', cursor: 'pointer', color: 'var(--text-muted)' }}>
              <motion.div animate={polling ? { rotate: 360 } : {}} transition={{ duration: 0.8, repeat: polling ? Infinity : 0, ease: 'linear' }}>
                <RefreshCw size={9} strokeWidth={2} />
              </motion.div>
            </motion.button>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      {pct !== null && (
        <div style={{ width: '100%', height: 8, borderRadius: 4, background: 'var(--surface-2)', overflow: 'hidden' }}>
          <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8, ease: 'easeOut' }}
            style={{ height: '100%', borderRadius: 4, background: barColor, boxShadow: `0 0 8px ${barColor}60` }} />
        </div>
      )}

      {/* Data rows */}
      {rows.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          {rows.map(row => (
            <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '5px 10px', borderRadius: 8, background: 'var(--surface-2)' }}>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 10, color: 'var(--text-muted)' }}>{row.label}</span>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 10, color: 'var(--text)', fontWeight: 700 }}>{row.value}</span>
            </div>
          ))}
        </div>
      )}

      {/* Error / no-data hint */}
      {pct === null && (
        <div style={{ textAlign: 'center', padding: '4px 0' }}>
          {hwError && <div style={{ fontFamily: 'var(--font-body)', fontSize: 9, color: '#ff6060', marginBottom: 3 }}>{hwError}</div>}
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 9, color: 'var(--text-muted)' }}>
            Enable I2C on Pi: <span style={{ fontFamily: 'var(--font-display)', color: 'var(--text)' }}>raspi-config → Interfaces → I2C</span>
          </div>
        </div>
      )}

      {/* Shutdown button */}
      <motion.button whileTap={{ scale: 0.96 }} onClick={onShutdown}
        style={{ width: '100%', padding: '9px 0', borderRadius: 10, cursor: 'pointer',
          background: '#ff404015', border: '1px solid #ff404035', marginTop: 2,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
          color: '#ff6060', fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 12 }}>
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
