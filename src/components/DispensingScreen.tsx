import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import PrintReceiptModal, { type ReceiptLine } from './PrintReceiptModal'

type DispenseType = 'vending' | 'pool' | 'washing' | 'liquid'

interface Props {
  type: DispenseType
  meta?: { games?: number; minutes?: number; volume?: number }
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

// Simple SVG clothing shapes
function ClothingShape({ type, color, size }: { type: string; color: string; size: number }) {
  const s = size
  if (type === 'shirt') return (
    <svg width={s} height={s} viewBox="0 0 20 20" fill="none">
      <path d="M6 2 L2 5 L4 6 L4 15 L16 15 L16 6 L18 5 L14 2 L12 4 Q10 6 8 4 Z"
        fill={color + 'cc'} stroke={color} strokeWidth="0.8" strokeLinejoin="round" />
    </svg>
  )
  if (type === 'sock') return (
    <svg width={s} height={s} viewBox="0 0 20 20" fill="none">
      <path d="M7 2 L13 2 L13 11 L17 15 Q17 18 13 18 L9 18 Q5 18 5 14 L5 2 Z"
        fill={color + 'cc'} stroke={color} strokeWidth="0.8" strokeLinejoin="round" />
      <line x1="7" y1="5" x2="13" y2="5" stroke={color + '60'} strokeWidth="0.8" />
    </svg>
  )
  if (type === 'shorts') return (
    <svg width={s} height={s} viewBox="0 0 20 20" fill="none">
      <path d="M2 4 L18 4 L16 18 L12 18 L10 12 L8 18 L4 18 Z"
        fill={color + 'cc'} stroke={color} strokeWidth="0.8" strokeLinejoin="round" />
      <line x1="2" y1="8" x2="18" y2="8" stroke={color + '60'} strokeWidth="0.8" />
    </svg>
  )
  // towel
  return (
    <svg width={s} height={s} viewBox="0 0 20 20" fill="none">
      <rect x="2" y="3" width="16" height="14" rx="2"
        fill={color + 'cc'} stroke={color} strokeWidth="0.8" />
      <line x1="2" y1="8" x2="18" y2="8" stroke={color + '50'} strokeWidth="0.8" />
      <line x1="2" y1="12" x2="18" y2="12" stroke={color + '50'} strokeWidth="0.8" />
    </svg>
  )
}

// Bubble that floats upward and pops
function Bubble({ x, size, dur, delay, color }: { x: number; size: number; dur: number; delay: number; color: string }) {
  return (
    <motion.div
      initial={{ y: 0, opacity: 0.7, scale: 1 }}
      animate={{ y: [-2, -28, -38], opacity: [0.7, 0.5, 0], scale: [1, 1.1, 0.2] }}
      transition={{ duration: dur, delay, repeat: Infinity, repeatDelay: dur * 0.4, ease: 'easeOut' }}
      style={{
        position: 'absolute', bottom: 14, left: x,
        width: size, height: size, borderRadius: '50%',
        border: `1px solid ${color}60`,
        background: `radial-gradient(circle at 35% 35%, ${color}40, ${color}10)`,
        pointerEvents: 'none',
      }}
    />
  )
}

function WashingAnim() {
  const C     = '#38d4ff'
  const SIZE  = 150          // total component size
  const CX    = SIZE / 2     // drum centre x
  const CY    = SIZE / 2     // drum centre y
  const OR    = 38           // orbit radius
  const IS    = 24           // item size

  const ITEMS = [
    { type: 'shirt',  color: '#38d4ff' },
    { type: 'sock',   color: '#ff9044' },
    { type: 'shorts', color: '#b48aff' },
    { type: 'towel',  color: '#00e5a0' },
  ]

  const BUBBLES = [
    { x: CX - 18, size: 5,  dur: 1.8, delay: 0    },
    { x: CX - 4,  size: 7,  dur: 2.2, delay: 0.5  },
    { x: CX + 10, size: 4,  dur: 1.6, delay: 1.1  },
    { x: CX + 20, size: 6,  dur: 2.0, delay: 0.3  },
    { x: CX - 10, size: 4,  dur: 1.4, delay: 1.7  },
  ]

  return (
    <div style={{ position: 'relative', width: SIZE, height: SIZE }}>
      {/* Porthole SVG */}
      <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}
        style={{ position: 'absolute', top: 0, left: 0 }}>
        {/* Machine bezel */}
        <rect x="4" y="4" width={SIZE - 8} height={SIZE - 8} rx="22"
          fill="#0c0f18" stroke={C + '25'} strokeWidth="2" />
        {/* Porthole outer ring */}
        <circle cx={CX} cy={CY} r="66" fill="#080b12" stroke={C + '50'} strokeWidth="4" />
        {/* Porthole inner ring */}
        <circle cx={CX} cy={CY} r="58" fill="#060810" stroke={C + '18'} strokeWidth="1.5" />
        {/* Drum perforations */}
        {[0,45,90,135,180,225,270,315].map(a => {
          const rad = a * Math.PI / 180
          const px  = CX + OR * Math.cos(rad)
          const py  = CY + OR * Math.sin(rad)
          return <circle key={a} cx={px} cy={py} r="3.5"
            fill={C + '12'} stroke={C + '35'} strokeWidth="1" />
        })}
        {/* Water at the bottom of drum */}
        <motion.ellipse
          cx={CX} cy={CY + 50} rx="46" ry="9"
          fill={C + '18'}
          animate={{ ry: [9, 11, 8, 10, 9] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />
        {/* Water surface shimmer line */}
        <motion.path
          d={`M ${CX - 40} ${CY + 44} Q ${CX} ${CY + 40} ${CX + 40} ${CY + 44}`}
          stroke={C + '50'} strokeWidth="1.5" fill="none"
          animate={{ d: [
            `M ${CX - 40} ${CY + 44} Q ${CX} ${CY + 40} ${CX + 40} ${CY + 44}`,
            `M ${CX - 40} ${CY + 42} Q ${CX} ${CY + 46} ${CX + 40} ${CY + 42}`,
            `M ${CX - 40} ${CY + 44} Q ${CX} ${CY + 40} ${CX + 40} ${CY + 44}`,
          ]}}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />
      </svg>

      {/* Bubbles floating up */}
      {BUBBLES.map((b, i) => <Bubble key={i} {...b} color={C} />)}

      {/* Orbiting clothing items */}
      {ITEMS.map((item, i) => {
        const startDeg = (360 / ITEMS.length) * i
        return (
          <motion.div
            key={i}
            style={{ position: 'absolute', left: CX, top: CY, width: 0, height: 0 }}
            animate={{ rotate: [startDeg, startDeg + 360] }}
            transition={{ duration: 3.2, repeat: Infinity, ease: 'linear' }}
          >
            {/* Item offset to orbit radius, tumbles independently */}
            <motion.div
              style={{ position: 'absolute', left: OR - IS / 2, top: -IS / 2, width: IS, height: IS }}
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 1.1, repeat: Infinity, ease: 'linear' }}
            >
              <ClothingShape type={item.type} color={item.color} size={IS} />
            </motion.div>
          </motion.div>
        )
      })}

      {/* Outer glow ring pulse */}
      <motion.div
        animate={{ opacity: [0.3, 0.7, 0.3], scale: [1, 1.03, 1] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          position: 'absolute', inset: 0, borderRadius: '50%',
          border: `2px solid ${C}30`, pointerEvents: 'none',
        }}
      />
    </div>
  )
}

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

function LiquidAnim({ progress }: { progress: number }) {
  const C = '#ff9044'
  const fillH = Math.round(progress * 100)
  return (
    <div style={{ display: 'flex', gap: 28, alignItems: 'flex-end' }}>
      {/* Tap still dripping */}
      <svg width="70" height="60" viewBox="0 0 70 60" fill="none" style={{ marginBottom: 8 }}>
        <rect x="0" y="10" width="36" height="12" rx="5" fill={C + '30'} stroke={C + '50'} strokeWidth="1.5" />
        <rect x="28" y="18" width="12" height="24" rx="4" fill={C + '30'} stroke={C + '50'} strokeWidth="1.5" />
        <rect x="24" y="38" width="20" height="8" rx="4" fill={C + '50'} stroke={C} strokeWidth="1.5" />
        <motion.g animate={{ y: [0, 12, 12] }} transition={{ duration: 0.45, repeat: Infinity, ease: 'easeIn' }}>
          <ellipse cx="31" cy="50" rx="2.5" ry="3.5" fill={C + 'dd'} />
        </motion.g>
        <motion.g animate={{ y: [0, 12, 12] }} transition={{ duration: 0.45, delay: 0.22, repeat: Infinity, ease: 'easeIn' }}>
          <ellipse cx="39" cy="50" rx="2.5" ry="3.5" fill={C + 'bb'} />
        </motion.g>
      </svg>

      {/* Filling cup */}
      <div style={{ position: 'relative', width: 64, height: 110 }}>
        <svg width="64" height="110" viewBox="0 0 64 110" fill="none" style={{ position: 'absolute', inset: 0, zIndex: 2 }}>
          {/* Cup outline */}
          <path d="M8 8 L4 100 Q4 106 10 106 L54 106 Q60 106 60 100 L56 8 Z" fill="none" stroke={C + '70'} strokeWidth="2" />
          {/* Cup rim highlight */}
          <rect x="6" y="6" width="52" height="6" rx="3" fill={C + '20'} stroke={C + '60'} strokeWidth="1.5" />
          {/* Handle */}
          <path d="M58 30 Q72 30 72 50 Q72 70 58 70" fill="none" stroke={C + '50'} strokeWidth="2.5" strokeLinecap="round" />
          {/* Liquid surface ripple */}
          {progress > 0.02 && (
            <motion.ellipse
              cx="32" cy={106 - fillH * 0.93}
              rx="22" ry="3"
              fill={C + '50'}
              animate={{ rx: [20, 24, 20] }}
              transition={{ duration: 1.2, repeat: Infinity }}
            />
          )}
        </svg>

        {/* Fill liquid */}
        <div style={{ position: 'absolute', bottom: 4, left: 6, right: 6, borderRadius: '0 0 8px 8px', overflow: 'hidden', height: 96, zIndex: 1 }}>
          <motion.div
            animate={{ height: `${fillH}%` }}
            transition={{ ease: 'linear', duration: 0.3 }}
            style={{
              position: 'absolute', bottom: 0, left: 0, right: 0,
              background: `linear-gradient(0deg, ${C}dd 0%, ${C}99 60%, ${C}55 100%)`,
              borderRadius: '0 0 6px 6px',
            }}
          />
        </div>

        {/* % label */}
        <div style={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13,
          color: progress > 0.4 ? '#fff' : C,
          zIndex: 3, textShadow: '0 1px 4px rgba(0,0,0,0.5)',
        }}>
          {fillH}%
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
  const [phase, setPhase] = useState<'prep' | 'dispensing' | 'done'>(type === 'liquid' ? 'prep' : 'dispensing')
  const [countdown, setCountdown] = useState(PREP_DUR)
  const [progress, setProgress] = useState(0)
  const [showReceipt, setShowReceipt] = useState(false)

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

  // Dispensing progress
  useEffect(() => {
    if (phase !== 'dispensing') return
    const start = Date.now()
    const iv = setInterval(() => {
      const p = Math.min((Date.now() - start) / cfg.dur, 1)
      setProgress(p)
      if (p >= 1) {
        clearInterval(iv)
        setPhase('done')
      }
    }, 50)
    return () => clearInterval(iv)
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
              {type === 'washing'  && <WashingAnim />}
              {type === 'liquid'   && <LiquidAnim progress={progress} />}
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
