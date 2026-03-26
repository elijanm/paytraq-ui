import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, ReceiptText } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { ITEMS } from './items'
import PrintReceiptModal, { type ReceiptLine } from '../../components/PrintReceiptModal'
import { useAdminStore } from '../../store/adminStore'
import type { PaymentInfo } from '../../components/MpesaCheckout'

export interface DispenseItem { id: string; name: string; quantity: number; price: number }

// ── helpers ────────────────────────────────────────────────────────────────
const ACCENT    = '#00e5a0'
const RING_R    = 68
const RING_C    = 2 * Math.PI * RING_R
const RING_SIZE = 166
const RING_CX   = RING_SIZE / 2

// item duration: 3s base + 0.5s per extra unit, capped at 6s
const itemDuration = (qty: number) => Math.min(3000 + (qty - 1) * 500, 6000)

function getEmoji(id: string) { return ITEMS.find(i => i.id === id)?.emoji ?? '📦' }
const fmt = (n: number) => `KES ${(n / 100).toFixed(2)}`

// ── Single-item ring + drop animation ──────────────────────────────────────
function ItemRing({
  emoji, progress, done,
}: { emoji: string; progress: number; done: boolean }) {
  const offset = RING_C * (1 - progress)
  const color  = done ? '#4ade80' : ACCENT

  return (
    <div style={{ position: 'relative', width: RING_SIZE, height: RING_SIZE }}>
      <svg width={RING_SIZE} height={RING_SIZE} style={{ position: 'absolute', inset: 0 }}>
        {/* Track */}
        <circle cx={RING_CX} cy={RING_CX} r={RING_R}
          fill="none" stroke="#1a1f2e" strokeWidth="7" />
        {/* Progress arc */}
        <circle cx={RING_CX} cy={RING_CX} r={RING_R}
          fill="none" stroke={color} strokeWidth="7" strokeLinecap="round"
          strokeDasharray={RING_C}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${RING_CX} ${RING_CX})`}
          style={{ transition: 'stroke-dashoffset 0.05s linear, stroke 0.3s ease',
            filter: `drop-shadow(0 0 8px ${color}90)` }} />
        {/* Inner fill ring */}
        <circle cx={RING_CX} cy={RING_CX} r={RING_R - 12}
          fill={color + '08'} stroke={color + '15'} strokeWidth="1" />
      </svg>

      {/* Emoji / checkmark */}
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <AnimatePresence mode="wait">
          {done ? (
            <motion.div key="done"
              initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 18 }}>
              <CheckCircle size={52} color="#4ade80" strokeWidth={1.5} />
            </motion.div>
          ) : (
            <motion.span key="emoji"
              style={{ fontSize: 52, lineHeight: 1 }}
              animate={{ y: [0, 8, 0], scale: [1, 1.06, 1] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}>
              {emoji}
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Outer pulse */}
      {!done && (
        <motion.div
          animate={{ scale: [1, 1.08, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{ position: 'absolute', inset: -6, borderRadius: '50%',
            border: `1.5px solid ${ACCENT}40`, pointerEvents: 'none' }} />
      )}
    </div>
  )
}

// ── Particle burst on item complete ────────────────────────────────────────
function Burst({ active }: { active: boolean }) {
  if (!active) return null
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 10 }}>
      {Array.from({ length: 10 }).map((_, i) => {
        const angle = (i / 10) * 360
        const rad   = angle * Math.PI / 180
        const dx    = Math.cos(rad) * 80
        const dy    = Math.sin(rad) * 80
        return (
          <motion.div key={i}
            initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
            animate={{ x: dx, y: dy, opacity: 0, scale: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            style={{ position: 'absolute', top: '50%', left: '50%',
              width: 7, height: 7, borderRadius: '50%',
              background: i % 2 === 0 ? '#4ade80' : ACCENT,
              transform: 'translate(-50%,-50%)', marginLeft: -3.5, marginTop: -3.5 }}
          />
        )
      })}
    </div>
  )
}

// ── Receipt builder ─────────────────────────────────────────────────────────
function paymentLabel(info?: PaymentInfo): string {
  if (!info) return 'M-Pesa STK'
  if (info.method === 'card') return `${info.cardType} ···· ${info.last4}`
  const ph = info.phone
  const fmt10 = ph.length >= 9
    ? `+254 ${ph.slice(0,3)} ${ph.slice(3,6)} ${ph.slice(6,9)}`
    : `+254 ${ph}`
  return `M-Pesa · ${fmt10}`
}

function buildReceipt(items: DispenseItem[], taxRate: number, info?: PaymentInfo): ReceiptLine[] {
  const lines: ReceiptLine[] = []
  let subtotal = 0

  for (const item of items) {
    const lineTotal = item.price * item.quantity
    subtotal += lineTotal
    lines.push({
      label: item.quantity > 1 ? `${item.name} ×${item.quantity}` : item.name,
      value: fmt(lineTotal),
    })
  }

  lines.push({ label: '─────────────', value: '' })
  lines.push({ label: 'Subtotal', value: fmt(subtotal) })

  const taxAmount = Math.round(subtotal * taxRate / 100)
  if (taxRate > 0) {
    lines.push({ label: `Tax (${taxRate}%)`, value: fmt(taxAmount) })
  }

  const total = subtotal + taxAmount
  lines.push({ label: 'TOTAL', value: fmt(total), highlight: true })
  lines.push({ label: 'Payment', value: paymentLabel(info), highlight: true })

  return lines
}

// ── Main component ──────────────────────────────────────────────────────────
interface Props { items: DispenseItem[]; paymentInfo?: PaymentInfo; onAllDone?: () => void }

export default function VendingDispensing({ items, paymentInfo, onAllDone }: Props) {
  const navigate      = useNavigate()
  const taxRate       = useAdminStore(s => s.appSettings.vendingTaxRate)
  const [idx, setIdx] = useState(0)
  const [progress, setProgress] = useState(0)
  const [itemDone, setItemDone] = useState(false)
  const [burst, setBurst]       = useState(false)
  const [allDone, setAllDone]   = useState(false)
  const [doneIds, setDoneIds]   = useState<string[]>([])
  const [showReceipt, setShowReceipt] = useState(false)
  const rafRef = useRef<number>()
  const startRef = useRef(0)
  const activeRef = useRef({ idx: 0, cancelled: false })

  const current = items[idx]
  const total   = items.length

  useEffect(() => {
    if (!current || allDone) return
    activeRef.current = { idx, cancelled: false }
    setProgress(0)
    setItemDone(false)
    setBurst(false)

    const dur = itemDuration(current.quantity)
    startRef.current = performance.now()

    const tick = (now: number) => {
      if (activeRef.current.cancelled) return
      const p = Math.min((now - startRef.current) / dur, 1)
      setProgress(p)
      if (p < 1) {
        rafRef.current = requestAnimationFrame(tick)
      } else {
        // Item complete
        setItemDone(true)
        setBurst(true)
        setTimeout(() => setBurst(false), 700)
        setTimeout(() => {
          if (activeRef.current.cancelled) return
          setDoneIds(prev => [...prev, current.id + '_' + idx])
          const nextIdx = idx + 1
          if (nextIdx >= total) {
            setAllDone(true)
            onAllDone?.()
          } else {
            setIdx(nextIdx)
          }
        }, 900)
      }
    }
    rafRef.current = requestAnimationFrame(tick)

    return () => {
      activeRef.current.cancelled = true
      cancelAnimationFrame(rafRef.current!)
    }
  }, [idx, allDone])

  const emoji = current ? getEmoji(current.id) : '✅'

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ width: 800, height: 480, background: 'var(--bg)', display: 'flex', flexDirection: 'column',
        alignItems: 'center', overflow: 'hidden', position: 'relative' }}
    >
      {/* Ambient */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none',
        background: `radial-gradient(ellipse 500px 320px at 50% 50%, ${ACCENT}10 0%, transparent 70%)` }} />

      {/* ── Top strip ─────────────────────────────────────────────────────── */}
      <div style={{ width: '100%', height: 48, flexShrink: 0, display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', padding: '0 20px',
        background: '#07090f', borderBottom: '1px solid #111724', zIndex: 10 }}>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <motion.div animate={{ opacity: allDone ? 1 : [0.5, 1, 0.5] }} transition={{ duration: 1.2, repeat: allDone ? 0 : Infinity }}
            style={{ width: 7, height: 7, borderRadius: '50%', background: allDone ? '#4ade80' : ACCENT,
              boxShadow: `0 0 8px ${allDone ? '#4ade80' : ACCENT}` }} />
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 12, color: 'var(--text)', letterSpacing: '0.06em' }}>
            {allDone ? 'ALL ITEMS DISPENSED' : `DISPENSING  ${idx + 1} / ${total}`}
          </span>
        </div>

        {/* Queue of remaining items */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {items.map((item, i) => {
            const isDone    = i < idx || allDone
            const isActive  = i === idx && !allDone
            return (
              <motion.div key={item.id + i}
                animate={{ scale: isActive ? 1 : 0.8, opacity: isDone ? 0.4 : isActive ? 1 : 0.55 }}
                style={{ position: 'relative', width: 30, height: 30, borderRadius: 9,
                  background: isDone ? '#4ade8015' : isActive ? ACCENT + '25' : '#0f1420',
                  border: `1px solid ${isDone ? '#4ade8030' : isActive ? ACCENT + '60' : '#1e2333'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 16, lineHeight: 1 }}>
                {getEmoji(item.id)}
                {isDone && (
                  <div style={{ position: 'absolute', top: -3, right: -3, width: 10, height: 10,
                    borderRadius: '50%', background: '#4ade80', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', fontSize: 7 }}>✓</div>
                )}
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* ── Center: main dispensing area ──────────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', width: '100%' }}>

        <AnimatePresence mode="wait">
          {!allDone ? (
            <motion.div key={`item-${idx}`}
              initial={{ opacity: 0, y: -40, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 340, damping: 28 }}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, position: 'relative' }}
            >
              {/* Burst particles */}
              <Burst active={burst} />

              {/* Ring */}
              <ItemRing emoji={emoji} progress={progress} done={itemDone} />

              {/* Item name */}
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18,
                  color: itemDone ? '#4ade80' : 'var(--text)', letterSpacing: '0.04em', marginBottom: 4 }}>
                  {current?.name}
                  {(current?.quantity ?? 1) > 1 && (
                    <span style={{ fontSize: 12, color: ACCENT + 'bb', marginLeft: 8 }}>×{current.quantity}</span>
                  )}
                </div>

                <AnimatePresence mode="wait">
                  {itemDone ? (
                    <motion.div key="done"
                      initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                      style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: '#4ade80', fontWeight: 700 }}>
                      ✓ Dispensed!
                    </motion.div>
                  ) : (
                    <motion.div key="progress"
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: '#5a6a90' }}>
                        Dispensing
                      </span>
                      {[0, 1, 2].map(i => (
                        <motion.span key={i}
                          animate={{ opacity: [0, 1, 0] }}
                          transition={{ duration: 1, delay: i * 0.28, repeat: Infinity }}
                          style={{ width: 4, height: 4, borderRadius: '50%',
                            background: ACCENT, display: 'inline-block' }} />
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Progress percent */}
              {!itemDone && (
                <span style={{ fontFamily: 'var(--font-display)', fontSize: 11, color: ACCENT + 'aa' }}>
                  {Math.round(progress * 100)}%
                </span>
              )}
            </motion.div>

          ) : (
            /* ── All done ── */
            <motion.div key="all-done"
              initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 260, damping: 20 }}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18 }}
            >
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 0.6, delay: 0.3 }}
                style={{ fontSize: 72 }}>🎉</motion.div>

              <div style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 26,
                  color: '#4ade80', letterSpacing: '-0.5px', marginBottom: 6 }}>
                  All items dispensed!
                </div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text-muted)' }}>
                  Thank you — come again 👋
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <motion.button whileTap={{ scale: 0.95 }}
                  onClick={() => setShowReceipt(true)}
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                  style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '12px 22px', borderRadius: 14, cursor: 'pointer',
                    background: 'var(--surface-2)', border: '1px solid var(--border)',
                    color: 'var(--text-muted)', fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 13 }}>
                  <ReceiptText size={15} strokeWidth={1.8} />
                  Receipt
                </motion.button>
                <motion.button whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/')}
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
                  style={{ padding: '12px 36px', borderRadius: 14, cursor: 'pointer',
                    background: 'linear-gradient(135deg, #4ade80, #00b37a)', border: 'none', color: '#000',
                    fontFamily: 'var(--font-body)', fontWeight: 800, fontSize: 14,
                    boxShadow: '0 4px 20px #4ade8040' }}>
                  Done → Home
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Receipt modal ─────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showReceipt && (
          <PrintReceiptModal
            title="Vending Receipt"
            lines={buildReceipt(items, taxRate, paymentInfo)}
            onDone={() => { setShowReceipt(false); navigate('/') }}
          />
        )}
      </AnimatePresence>

      {/* ── Bottom: completed items tray ──────────────────────────────────── */}
      {doneIds.length > 0 && !allDone && (
        <div style={{ width: '100%', padding: '10px 20px', borderTop: '1px solid #111724',
          background: '#07090f', flexShrink: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: 9, color: '#3a4560',
            textTransform: 'uppercase', letterSpacing: '0.1em', flexShrink: 0 }}>Dispensed</span>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {items.slice(0, idx).map((item, i) => (
              <motion.div key={item.id + i}
                initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 22 }}
                style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '3px 8px',
                  borderRadius: 8, background: '#4ade8012', border: '1px solid #4ade8025' }}>
                <span style={{ fontSize: 13 }}>{getEmoji(item.id)}</span>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: 10, color: '#4ade80' }}>
                  {item.name}{item.quantity > 1 ? ` ×${item.quantity}` : ''}
                </span>
                <span style={{ fontSize: 10 }}>✓</span>
              </motion.div>
            ))}
          </div>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: 9, color: '#3a4560', marginLeft: 'auto', flexShrink: 0 }}>
            {idx} / {total}
          </span>
        </div>
      )}
    </motion.div>
  )
}
