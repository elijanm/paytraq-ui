import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { QRCodeSVG } from 'qrcode.react'
import { Shield, Smartphone, Hash, X, Check } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAdminStore } from '../store/adminStore'

const ADMIN_PIN = '1234'
const QR_TOKEN  = 'paytraq://admin/auth?token=PT-ADMIN-7f3a9b2c&ts=' + Date.now()

// ── PIN numpad ─────────────────────────────────────────────────────────────
function PinEntry({ onSuccess }: { onSuccess: () => void }) {
  const [digits, setDigits]     = useState('')
  const [shake, setShake]       = useState(false)
  const [accepted, setAccepted] = useState(false)

  const push = (d: string) => {
    if (digits.length >= 4) return
    const next = digits + d
    setDigits(next)
    if (next.length === 4) {
      setTimeout(() => {
        if (next === ADMIN_PIN) {
          setAccepted(true)
          setTimeout(onSuccess, 600)
        } else {
          setShake(true)
          setTimeout(() => { setShake(false); setDigits('') }, 700)
        }
      }, 150)
    }
  }

  const KEYS = ['1','2','3','4','5','6','7','8','9','','0','⌫']

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
      <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: '#5a6a90', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Enter Admin PIN</div>

      {/* Dot indicators */}
      <motion.div
        animate={shake ? { x: [-8, 8, -6, 6, -4, 4, 0] } : { x: 0 }}
        transition={{ duration: 0.4 }}
        style={{ display: 'flex', gap: 10 }}
      >
        {[0,1,2,3].map(i => (
          <motion.div key={i}
            animate={{
              background: accepted ? '#4ade80' : i < digits.length ? '#00e5a0' : '#1e2333',
              boxShadow:  accepted ? '0 0 12px #4ade80' : i < digits.length ? '0 0 10px #00e5a060' : 'none',
              scale: i < digits.length ? 1.2 : 1,
            }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            style={{ width: 12, height: 12, borderRadius: '50%', border: '1.5px solid #2a3045' }}
          />
        ))}
      </motion.div>

      {/* Numpad */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, width: 220 }}>
        {KEYS.map((k, i) => (
          <motion.button key={i}
            onClick={() => { if (k === '⌫') setDigits(d => d.slice(0, -1)); else if (k) push(k) }}
            whileTap={k ? { scale: 0.9 } : {}}
            style={{
              height: 46, borderRadius: 10,
              background: k ? 'var(--surface-2)' : 'transparent',
              border: k ? '1px solid var(--border)' : 'none',
              color: k === '⌫' ? '#5a6a90' : 'var(--text)',
              fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700,
              cursor: k ? 'pointer' : 'default',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'background 0.12s',
            }}
          >
            {k}
          </motion.button>
        ))}
      </div>

      <div style={{ fontFamily: 'var(--font-body)', fontSize: 10, color: '#3a4560' }}>Demo PIN: 1234</div>
    </div>
  )
}

// ── QR auth ────────────────────────────────────────────────────────────────
function QrAuth({ onSuccess }: { onSuccess: () => void }) {
  const [scanning, setScanning] = useState(false)
  const [verified, setVerified] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout>>()

  const startScan = () => {
    setScanning(true)
    timerRef.current = setTimeout(() => {
      setVerified(true)
      setTimeout(onSuccess, 700)
    }, 2800)
  }
  useEffect(() => () => clearTimeout(timerRef.current), [])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
      <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: '#5a6a90', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
        Scan with Admin Device
      </div>

      {/* QR frame */}
      <div style={{ position: 'relative', padding: 10, borderRadius: 14,
        background: '#fff', boxShadow: verified ? '0 0 24px #4ade8060' : scanning ? '0 0 20px #38d4ff40' : '0 0 16px #00000080' }}>
        <QRCodeSVG value={QR_TOKEN} size={130} bgColor="#ffffff" fgColor="#080b12" level="M" />

        {/* Corner brackets */}
        {[['0','0'],['0','auto'],['auto','0'],['auto','auto']].map(([t,b], i) => (
          <div key={i} style={{ position: 'absolute', width: 18, height: 18, pointerEvents: 'none',
            top: t === '0' ? 4 : undefined, bottom: b === '0' ? 4 : undefined,
            left: i < 2 ? 4 : undefined, right: i >= 2 ? 4 : undefined,
            borderTop:    (i === 0 || i === 2) ? '2.5px solid #00e5a0' : undefined,
            borderBottom: (i === 1 || i === 3) ? '2.5px solid #00e5a0' : undefined,
            borderLeft:   (i === 0 || i === 1) ? '2.5px solid #00e5a0' : undefined,
            borderRight:  (i === 2 || i === 3) ? '2.5px solid #00e5a0' : undefined,
          }} />
        ))}

        {/* Scan line */}
        {scanning && !verified && (
          <motion.div
            animate={{ top: ['12%', '88%', '12%'] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
            style={{ position: 'absolute', left: '8%', right: '8%', height: 2,
              background: 'linear-gradient(90deg, transparent, #00e5a0, transparent)',
              boxShadow: '0 0 8px #00e5a0', pointerEvents: 'none' }}
          />
        )}

        {/* Verified overlay */}
        {verified && (
          <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }}
            style={{ position: 'absolute', inset: 0, borderRadius: 8, background: '#4ade8015',
              display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#4ade80',
              display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Check size={24} color="#000" strokeWidth={3} />
            </div>
          </motion.div>
        )}
      </div>

      {!scanning ? (
        <motion.button whileTap={{ scale: 0.95 }} onClick={startScan}
          style={{ padding: '9px 28px', borderRadius: 10, cursor: 'pointer',
            background: 'linear-gradient(135deg, #00e5a0, #38d4ff)',
            border: 'none', color: '#000', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <Smartphone size={13} strokeWidth={2} />
            Simulate QR Scan
          </div>
        </motion.button>
      ) : !verified ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1, repeat: Infinity }}
            style={{ width: 7, height: 7, borderRadius: '50%', background: '#38d4ff' }} />
          <span style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: '#38d4ff' }}>Verifying…</span>
        </div>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, color: '#4ade80', fontFamily: 'var(--font-body)', fontSize: 11 }}>
          <Check size={13} strokeWidth={2.5} /> Authenticated
        </div>
      )}
    </div>
  )
}

// ── Main login component ────────────────────────────────────────────────────
export default function AdminLogin() {
  const [mode, setMode] = useState<'qr' | 'pin'>('pin')
  const login   = useAdminStore(s => s.login)
  const navigate = useNavigate()

  const handleSuccess = () => { login(); navigate('/admin', { replace: true }) }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{ width: 800, height: 480, background: '#04060c', display: 'flex', alignItems: 'center',
        justifyContent: 'center', position: 'relative', overflow: 'hidden' }}
    >
      {/* Ambient */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.012) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.012) 1px, transparent 1px)',
        backgroundSize: '40px 40px' }} />
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse 600px 400px at 50% 50%, #00e5a008 0%, transparent 65%)' }} />

      {/* Back to home */}
      <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate('/')}
        style={{ position: 'absolute', top: 14, left: 14, width: 36, height: 36, borderRadius: 10,
          background: 'var(--surface)', border: '1px solid var(--border)', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#5a6a90' }}>
        <X size={16} strokeWidth={2} />
      </motion.button>

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ delay: 0.1, type: 'spring', stiffness: 280, damping: 26 }}
        style={{ width: 520, borderRadius: 22, background: '#0a0d14',
          border: '1px solid #1e2d40',
          boxShadow: '0 24px 80px #00000080, 0 0 0 1px #1e2d40',
          overflow: 'hidden' }}
      >
        {/* Header */}
        <div style={{ padding: '20px 28px 16px', borderBottom: '1px solid #0f1520',
          display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 38, height: 38, borderRadius: 12,
            background: 'linear-gradient(135deg, #00e5a0, #38d4ff)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 16px #00e5a040' }}>
            <Shield size={18} color="#000" strokeWidth={2.5} />
          </div>
          <div>
            <div style={{ fontFamily: 'Nunito, var(--font-body)', fontWeight: 900, fontSize: 18,
              letterSpacing: '-0.5px', lineHeight: 1 }}>
              <span style={{ background: 'linear-gradient(135deg, #e8f4ff, #cce8ff)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Pay</span>
              <span style={{ background: 'linear-gradient(135deg, #00e5a0, #38d4ff)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Traq</span>
              <span style={{ color: '#5a6a90', fontSize: 12, fontWeight: 600, marginLeft: 8, fontFamily: 'var(--font-body)', WebkitTextFillColor: '#5a6a90' }}>Admin</span>
            </div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 10, color: '#3a4560', marginTop: 2 }}>
              Authorised access only
            </div>
          </div>
        </div>

        {/* Mode switcher */}
        <div style={{ display: 'flex', gap: 0, padding: '14px 28px 0', borderBottom: '1px solid #0f1520' }}>
          {([['pin', Hash, 'PIN Entry'], ['qr', Smartphone, 'QR Scan']] as const).map(([m, Icon, label]) => (
            <button key={m} onClick={() => setMode(m)}
              style={{ flex: 1, padding: '8px 0', borderRadius: 0, border: 'none', cursor: 'pointer', background: 'transparent',
                borderBottom: mode === m ? '2px solid #00e5a0' : '2px solid transparent',
                color: mode === m ? '#00e5a0' : '#5a6a90', transition: 'all 0.15s',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 600 }}>
              <Icon size={12} strokeWidth={2} />
              {label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{ padding: '18px 28px 22px', minHeight: 240, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <AnimatePresence mode="wait">
            <motion.div key={mode} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.2 }}>
              {mode === 'pin' ? <PinEntry onSuccess={handleSuccess} /> : <QrAuth onSuccess={handleSuccess} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  )
}
