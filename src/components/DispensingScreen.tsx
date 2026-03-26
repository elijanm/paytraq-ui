import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import PrintReceiptModal, { type ReceiptLine } from './PrintReceiptModal'
import WashingAnim from '../apps/WashingMachine/WashingAnim'

type DispenseType = 'vending' | 'pool' | 'washing' | 'liquid'

interface Props {
  type: DispenseType
  meta?: { games?: number; minutes?: number; volume?: number; flowRate?: number }
  onDone?: () => void
}

const CONFIGS: Record<DispenseType, { color: string; label: string; dur: number }> = {
  vending:  { color: '#00e5a0', label: 'Dispensing your items',   dur: 4500 },
  pool:     { color: '#b48aff', label: 'Unlocking pool table',    dur: 3000 },
  washing:  { color: '#38d4ff', label: 'Starting your cycle',     dur: 5000 },
  liquid:   { color: '#ff9044', label: 'Dispensing liquid',       dur: 6000 },
}

const PREP_DUR = 3 // seconds countdown before liquid starts

function VendingAnim() {
  const items = ['🥤','🍫','🍪','🥛','🍬','⚡']
  return (
    <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', maxWidth: 280 }}>
      {items.map((e, i) => (
        <motion.div key={i} style={{ fontSize: 36 }}
          initial={{ y: -80, opacity: 0, scale: 0.5 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.18, type: 'spring', stiffness: 300, damping: 18 }}>
          {e}
        </motion.div>
      ))}
    </div>
  )
}

function PoolAnim() {
  return (
    <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
      {['🎱','🔴','🟡','⚪','🔵'].map((e, i) => (
        <motion.div key={i} style={{ fontSize: 32 }}
          animate={{ x: [0, 30, -30, 0], rotate: [0, 15, -15, 0] }}
          transition={{ duration: 1.4, delay: i * 0.15, repeat: Infinity, ease: 'easeInOut' }}>
          {e}
        </motion.div>
      ))}
    </div>
  )
}

// WashingAnim imported from shared component

function TapPrepAnim({ countdown }: { countdown: number }) {
  const C = '#ff9044'
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0, position: 'relative' }}>
      {/* Tap/faucet SVG */}
      <svg width="120" height="90" viewBox="0 0 120 90" fill="none">
        {/* Pipe from left */}
        <rect x="0" y="18" width="60" height="18" rx="6" fill={C + '30'} stroke={C + '60'} strokeWidth="1.5" />
        {/* Vertical drop pipe */}
        <rect x="52" y="30" width="16" height="36" rx="4" fill={C + '30'} stroke={C + '60'} strokeWidth="1.5" />
        {/* Spout tip */}
        <rect x="48" y="60" width="24" height="10" rx="5" fill={C + '50'} stroke={C} strokeWidth="1.5" />
        {/* Valve handle */}
        <rect x="28" y="14" width="24" height="8" rx="4" fill={C + '40'} stroke={C + '70'} strokeWidth="1.5" />
        <circle cx="40" cy="18" r="5" fill={C + '60'} stroke={C} strokeWidth="1.5" />
        {/* Water drops */}
        <motion.g animate={{ y: [0, 14, 14] }} transition={{ duration: 0.6, repeat: Infinity, ease: 'easeIn' }}>
          <ellipse cx="56" cy="74" rx="3" ry="4" fill={C + 'cc'} />
        </motion.g>
        <motion.g animate={{ y: [0, 14, 14] }} transition={{ duration: 0.6, delay: 0.3, repeat: Infinity, ease: 'easeIn' }}>
          <ellipse cx="64" cy="74" rx="3" ry="4" fill={C + 'aa'} />
        </motion.g>
      </svg>

      {/* Container / cup visual */}
      <motion.div
        animate={{ y: [6, 0, 6] }}
        transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
        style={{ position: 'relative', marginTop: -4 }}
      >
        <svg width="80" height="70" viewBox="0 0 80 70" fill="none">
          {/* Cup body */}
          <path d="M14 10 L8 62 Q8 66 14 66 L66 66 Q72 66 72 62 L66 10 Z" fill={C + '18'} stroke={C + '60'} strokeWidth="2" />
          {/* Cup rim */}
          <rect x="12" y="8" width="56" height="6" rx="3" fill={C + '30'} stroke={C + '50'} strokeWidth="1.5" />
          {/* Handle */}
          <path d="M68 24 Q82 24 82 38 Q82 52 68 52" fill="none" stroke={C + '50'} strokeWidth="2.5" strokeLinecap="round" />
        </svg>
        {/* Pulsing "place here" arrow */}
        <motion.div
          animate={{ opacity: [0.4, 1, 0.4], y: [0, -4, 0] }}
          transition={{ duration: 1, repeat: Infinity }}
          style={{ position: 'absolute', top: -20, left: '50%', transform: 'translateX(-50%)', fontSize: 16 }}
        >
          ↑
        </motion.div>
      </motion.div>

      {/* Countdown ring */}
      <div style={{ marginTop: 16, position: 'relative', width: 72, height: 72 }}>
        <svg width="72" height="72" style={{ position: 'absolute', inset: 0 }}>
          <circle cx="36" cy="36" r="30" fill="none" stroke={C + '20'} strokeWidth="5" />
          <motion.circle
            cx="36" cy="36" r="30"
            fill="none" stroke={C} strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 30}`}
            strokeDashoffset={0}
            animate={{ strokeDashoffset: 2 * Math.PI * 30 }}
            transition={{ duration: PREP_DUR, ease: 'linear' }}
            style={{ transformOrigin: '36px 36px', transform: 'rotate(-90deg)' }}
          />
        </svg>
        <AnimatePresence mode="wait">
          <motion.div
            key={countdown}
            initial={{ scale: 1.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            style={{
              position: 'absolute', inset: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 28, color: C,
            }}
          >
            {countdown}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

function LiquidAnim({ progress, dispensedMl, totalMl, flowRate }: {
  progress: number; dispensedMl: number; totalMl: number; flowRate: number
}) {
  const C = '#ff9044'
  const fillH = Math.round(progress * 100)

  // Drop animation speed scales with flow rate: faster flow = faster drops
  const dropDur = Math.max(0.15, 0.6 - (flowRate / 200))

  function fmtMl(ml: number) {
    if (ml >= 1000) return `${(ml / 1000).toFixed(2).replace(/\.?0+$/, '')} L`
    return `${Math.round(ml)} ml`
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
      <div style={{ display: 'flex', gap: 28, alignItems: 'flex-end' }}>
        {/* Tap */}
        <svg width="70" height="60" viewBox="0 0 70 60" fill="none" style={{ marginBottom: 8 }}>
          <rect x="0" y="10" width="36" height="12" rx="5" fill={C + '30'} stroke={C + '50'} strokeWidth="1.5" />
          <rect x="28" y="18" width="12" height="24" rx="4" fill={C + '30'} stroke={C + '50'} strokeWidth="1.5" />
          <rect x="24" y="38" width="20" height="8" rx="4" fill={C + '50'} stroke={C} strokeWidth="1.5" />
          {/* Stream: fast flow = solid stream, slow = drops */}
          {flowRate >= 60 ? (
            // Continuous stream
            <motion.rect x="30" y="46" width="6" height="16" rx="3" fill={C + 'cc'}
              animate={{ scaleY: [1, 0.85, 1], opacity: [0.9, 0.7, 0.9] }}
              transition={{ duration: dropDur, repeat: Infinity, ease: 'easeInOut' }}
            />
          ) : (
            <>
              <motion.g animate={{ y: [0, 14, 14] }} transition={{ duration: dropDur, repeat: Infinity, ease: 'easeIn' }}>
                <ellipse cx="31" cy="50" rx="2.5" ry="3.5" fill={C + 'dd'} />
              </motion.g>
              <motion.g animate={{ y: [0, 14, 14] }} transition={{ duration: dropDur, delay: dropDur * 0.5, repeat: Infinity, ease: 'easeIn' }}>
                <ellipse cx="39" cy="50" rx="2.5" ry="3.5" fill={C + 'bb'} />
              </motion.g>
            </>
          )}
        </svg>

        {/* Filling cup */}
        <div style={{ position: 'relative', width: 64, height: 110 }}>
          <svg width="64" height="110" viewBox="0 0 64 110" fill="none" style={{ position: 'absolute', inset: 0, zIndex: 2 }}>
            <path d="M8 8 L4 100 Q4 106 10 106 L54 106 Q60 106 60 100 L56 8 Z" fill="none" stroke={C + '70'} strokeWidth="2" />
            <rect x="6" y="6" width="52" height="6" rx="3" fill={C + '20'} stroke={C + '60'} strokeWidth="1.5" />
            <path d="M58 30 Q72 30 72 50 Q72 70 58 70" fill="none" stroke={C + '50'} strokeWidth="2.5" strokeLinecap="round" />
            {progress > 0.02 && (
              <motion.ellipse cx="32" cy={106 - fillH * 0.93} rx="22" ry="3" fill={C + '50'}
                animate={{ rx: [20, 24, 20] }} transition={{ duration: 1.2, repeat: Infinity }} />
            )}
          </svg>
          <div style={{ position: 'absolute', bottom: 4, left: 6, right: 6, borderRadius: '0 0 8px 8px', overflow: 'hidden', height: 96, zIndex: 1 }}>
            <motion.div animate={{ height: `${fillH}%` }} transition={{ ease: 'linear', duration: 0.1 }}
              style={{ position: 'absolute', bottom: 0, left: 0, right: 0,
                background: `linear-gradient(0deg, ${C}dd 0%, ${C}99 60%, ${C}55 100%)`,
                borderRadius: '0 0 6px 6px' }} />
          </div>
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 11,
            color: progress > 0.4 ? '#fff' : C, zIndex: 3, textShadow: '0 1px 4px rgba(0,0,0,0.5)',
            whiteSpace: 'nowrap' }}>
            {fillH}%
          </div>
        </div>
      </div>

      {/* Live volume counter */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
          <motion.span
            key={Math.round(dispensedMl / 10)}
            style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 22, color: C }}
          >
            {fmtMl(dispensedMl)}
          </motion.span>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: 10, color: 'var(--text-muted)' }}>
            / {fmtMl(totalMl)}
          </span>
        </div>
        <div style={{ fontFamily: 'var(--font-body)', fontSize: 9, color: 'var(--text-muted)' }}>
          {flowRate} ml/s flow rate
        </div>
      </div>
    </div>
  )
}

function buildReceiptLines(type: DispenseType, meta?: Props['meta']): ReceiptLine[] {
  const svc = { vending: 'Vending Machine', pool: 'Pool Table', washing: 'Washing Machine', liquid: 'Liquid Dispenser' }
  const lines: ReceiptLine[] = [{ label: 'Service', value: svc[type], highlight: true }]
  if (type === 'pool' && meta?.games) lines.push({ label: 'Games', value: `${meta.games} game${meta.games > 1 ? 's' : ''}` })
  if (type === 'washing' && meta?.minutes) lines.push({ label: 'Duration', value: `${meta.minutes} min` })
  if (type === 'liquid' && meta?.volume != null) {
    const vol = meta.volume >= 1000 ? `${(meta.volume / 1000).toFixed(2).replace(/\.?0+$/, '')} L` : `${Math.round(meta.volume)} ml`
    lines.push({ label: 'Volume', value: vol })
  }
  lines.push({ label: 'Payment', value: 'M-Pesa ✓', highlight: true })
  return lines
}

export default function DispensingScreen({ type, meta, onDone }: Props) {
  const navigate = useNavigate()
  const cfg = CONFIGS[type]

  // For liquid: duration driven by volume / flow rate (ml/s)
  const flowRate   = meta?.flowRate ?? 50      // ml/sec
  const totalMl    = meta?.volume  ?? 0
  const liquidDurMs = type === 'liquid' && flowRate > 0 && totalMl > 0
    ? (totalMl / flowRate) * 1000
    : cfg.dur
  const durMs = type === 'liquid' ? liquidDurMs : cfg.dur

  const [phase, setPhase]   = useState<'prep' | 'dispensing' | 'done'>(type === 'liquid' ? 'prep' : 'dispensing')
  const [countdown, setCountdown] = useState(PREP_DUR)
  const [progress, setProgress]   = useState(0)
  const [dispensedMl, setDispensedMl] = useState(0)
  const [showReceipt, setShowReceipt] = useState(false)
  const startRef = useRef(0)
  const rafRef   = useRef<number>()

  // Prep countdown (liquid only)
  useEffect(() => {
    if (type !== 'liquid') return
    const iv = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) { clearInterval(iv); setPhase('dispensing'); return 0 }
        return c - 1
      })
    }, 1000)
    return () => clearInterval(iv)
  }, [type])

  // Dispensing progress via RAF for smooth ml counter
  useEffect(() => {
    if (phase !== 'dispensing') return
    startRef.current = performance.now()

    const tick = (now: number) => {
      const elapsed = now - startRef.current
      const p = Math.min(elapsed / durMs, 1)
      setProgress(p)
      if (type === 'liquid') setDispensedMl(p * totalMl)
      if (p >= 1) { setPhase('done'); return }
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [phase])

  return (
    <motion.div
      style={{
        position: 'absolute', inset: 0,
        background: 'var(--bg)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 24,
      }}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    >
      {/* Ambient glow */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: `radial-gradient(ellipse 500px 300px at 50% 50%, ${cfg.color}12 0%, transparent 70%)`,
      }} />

      <AnimatePresence mode="wait">
        {phase === 'prep' ? (
          <motion.div
            key="prep"
            initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.05 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18, position: 'relative', zIndex: 1 }}
          >
            <TapPrepAnim countdown={countdown} />
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 17, color: cfg.color, margin: '0 0 6px' }}>
                Place your container on the tap
              </p>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>
                Dispensing starts in {countdown} second{countdown !== 1 ? 's' : ''}…
              </p>
            </div>
          </motion.div>

        ) : phase === 'dispensing' ? (
          <motion.div
            key="dispensing"
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, position: 'relative', zIndex: 1 }}
          >
            <div style={{ minHeight: 120, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {type === 'vending'  && <VendingAnim />}
              {type === 'pool'     && <PoolAnim />}
              {type === 'washing'  && <WashingAnim size={150} />}
              {type === 'liquid'   && <LiquidAnim progress={progress} dispensedMl={dispensedMl} totalMl={totalMl} flowRate={flowRate} />}
            </div>

            <div style={{ textAlign: 'center' }}>
              <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, color: cfg.color, margin: '0 0 4px' }}>{cfg.label}</p>
              {type === 'pool' && meta?.games && (
                <p style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>
                  {meta.games} game{meta.games > 1 ? 's' : ''} ready
                </p>
              )}
              {type === 'washing' && meta?.minutes && (
                <p style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>
                  {meta.minutes} minutes cycle
                </p>
              )}
              {type === 'liquid' && meta?.volume != null && (
                <p style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>
                  {meta.volume >= 1000 ? `${(meta.volume / 1000).toFixed(2).replace(/\.?0+$/, '')} L` : `${Math.round(meta.volume)} ml`} dispensing
                </p>
              )}
            </div>

            <div style={{ width: 300, height: 6, borderRadius: 4, background: 'var(--surface-2)', overflow: 'hidden' }}>
              <motion.div style={{
                height: '100%', borderRadius: 4,
                background: `linear-gradient(90deg, ${cfg.color}aa, ${cfg.color})`,
                boxShadow: `0 0 12px ${cfg.color}60`,
                width: `${progress * 100}%`,
              }} />
            </div>

            <p style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>
              {Math.round(progress * 100)}% complete
            </p>
          </motion.div>

        ) : (
          <motion.div
            key="done"
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, position: 'relative', zIndex: 1 }}
            initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
          >
            <div style={{
              width: 80, height: 80, borderRadius: '50%',
              background: `linear-gradient(135deg, ${cfg.color}30, ${cfg.color}10)`,
              border: `2px solid ${cfg.color}60`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 38,
              boxShadow: `0 0 32px ${cfg.color}40`,
            }}>✅</div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 22, color: cfg.color, margin: '0 0 6px' }}>
                Thank you!
              </p>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text-muted)', margin: '0 0 2px' }}>Come again 👋</p>
            </div>
            {/* Receipt prompt */}
            <div style={{ display: 'flex', gap: 12 }}>
              <motion.button
                whileTap={{ scale: 0.93 }}
                onClick={() => setShowReceipt(true)}
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '11px 24px', borderRadius: 13, cursor: 'pointer', background: `linear-gradient(135deg, ${cfg.color}, ${cfg.color}bb)`, border: 'none', color: '#000', fontFamily: 'var(--font-body)', fontWeight: 800, fontSize: 14, boxShadow: `0 6px 20px ${cfg.color}40` }}
              >
                🖨️ Print Receipt
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.93 }}
                onClick={() => { onDone?.(); navigate('/') }}
                style={{ padding: '11px 24px', borderRadius: 13, cursor: 'pointer', background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-muted)', fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 14 }}
              >
                Skip
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showReceipt && (
          <PrintReceiptModal
            title={CONFIGS[type].label}
            lines={buildReceiptLines(type, meta)}
            onDone={() => { setShowReceipt(false); onDone?.(); navigate('/') }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  )
}
