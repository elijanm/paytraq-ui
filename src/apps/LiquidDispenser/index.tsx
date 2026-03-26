import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Delete } from 'lucide-react'
import BackButton from '../../components/BackButton'
import MpesaCheckout from '../../components/MpesaCheckout'
import DispensingScreen from '../../components/DispensingScreen'

// KES per 100ml
const LIQUID_PRICES: Record<string, number> = { Water: 2, 'Cooking Oil': 15, Juice: 8, Milk: 6 }
const EMOJIS: Record<string, string> = { Water: '💧', 'Cooking Oil': '🫒', Juice: '🧃', Milk: '🥛' }
const ACCENT = '#ff9044'

type View = 'select' | 'checkout' | 'dispensing'

function fmtVol(ml: number): string {
  if (ml <= 0) return '0 ml'
  if (ml >= 1000) return `${(ml / 1000).toFixed(2).replace(/\.?0+$/, '')} L`
  return `${Math.round(ml)} ml`
}

const KEYS = ['1','2','3','4','5','6','7','8','9','','0','⌫']

export default function LiquidDispenser() {
  const [liquid, setLiquid] = useState('Water')
  const [amount, setAmount] = useState('')  // KES string
  const [view, setView] = useState<View>('select')

  const amountNum = parseInt(amount || '0', 10)
  const ratePerMl = LIQUID_PRICES[liquid] / 100        // KES per ml
  const volumeMl  = ratePerMl > 0 ? amountNum / ratePerMl : 0
  const canDispense = amountNum >= 10

  const handleKey = (k: string) => {
    if (k === '⌫') { setAmount(p => p.slice(0, -1)); return }
    if (k === '') return
    if (amount.length >= 6) return
    if (amount === '' && k === '0') return
    setAmount(p => p + k)
  }

  if (view === 'dispensing') return <DispensingScreen type="liquid" meta={{ volume: volumeMl }} />

  return (
    <motion.div
      style={{ width: 800, height: 480, background: 'var(--bg)', display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
    >
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: `radial-gradient(ellipse 600px 400px at 50% 50%, ${ACCENT}09 0%, transparent 65%)` }} />

      {/* Header */}
      <div style={{ position: 'relative', zIndex: 10, display: 'flex', alignItems: 'center', gap: 10, padding: '7px 14px', borderBottom: '1px solid var(--border)', background: 'var(--surface)', flexShrink: 0 }}>
        <BackButton />
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: ACCENT, boxShadow: `0 0 8px ${ACCENT}` }} />
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, color: 'var(--text)', lineHeight: 1 }}>Liquid Dispenser</div>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>Enter amount to see volume</div>
        </div>
      </div>

      {/* Body */}
      <div style={{ flex: 1, display: 'flex', position: 'relative', zIndex: 10 }}>

        {/* LEFT PANEL */}
        <div style={{ width: 320, display: 'flex', flexDirection: 'column', padding: '10px 14px 10px', gap: 8, borderRight: '1px solid var(--border)' }}>

          {/* Liquid type selector */}
          <div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 9, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Select liquid</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
              {Object.keys(LIQUID_PRICES).map(l => (
                <motion.button key={l} whileTap={{ scale: 0.92 }} onClick={() => setLiquid(l)}
                  style={{
                    padding: '7px 4px', borderRadius: 10, cursor: 'pointer',
                    background: liquid === l ? `${ACCENT}20` : 'var(--surface-2)',
                    border: `1.5px solid ${liquid === l ? ACCENT + '70' : 'var(--border)'}`,
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                    transition: 'all 0.15s',
                    boxShadow: liquid === l ? `0 4px 16px ${ACCENT}25` : 'none',
                  }}>
                  <span style={{ fontSize: 18 }}>{EMOJIS[l]}</span>
                  <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 8, color: liquid === l ? ACCENT : 'var(--text-muted)' }}>{l}</span>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: 8, color: 'var(--text-dim)' }}>KES {LIQUID_PRICES[l]}/100ml</span>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Volume display */}
          <div style={{
            flex: 1, borderRadius: 16,
            background: `linear-gradient(145deg, ${ACCENT}12 0%, var(--surface) 100%)`,
            border: `1.5px solid ${ACCENT}30`,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            gap: 6, padding: '14px 12px', position: 'relative', overflow: 'hidden',
          }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, transparent, ${ACCENT}60, transparent)` }} />

            {/* Animated fill bar */}
            <div style={{ width: '100%', position: 'relative', marginBottom: 4 }}>
              <div style={{ width: '100%', height: 6, borderRadius: 3, background: 'var(--surface-2)', overflow: 'hidden' }}>
                <motion.div
                  animate={{ width: `${Math.min(100, volumeMl / 20)}%` }}
                  transition={{ type: 'spring', stiffness: 200, damping: 24 }}
                  style={{ height: '100%', borderRadius: 3, background: `linear-gradient(90deg, ${ACCENT}, #ea580c)` }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 22 }}>{EMOJIS[liquid]}</span>
              <div style={{ textAlign: 'center' }}>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={fmtVol(volumeMl)}
                    initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }}
                    transition={{ duration: 0.15 }}
                    style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 22, color: canDispense ? ACCENT : 'var(--text-muted)', lineHeight: 1 }}
                  >
                    {fmtVol(volumeMl)}
                  </motion.div>
                </AnimatePresence>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: 9, color: 'var(--text-muted)', marginTop: 2 }}>
                  {canDispense ? `${liquid} · KES ${amountNum}` : 'Enter amount'}
                </div>
              </div>
            </div>

            {canDispense && (
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                style={{ fontFamily: 'var(--font-body)', fontSize: 9, color: 'var(--text-dim)', textAlign: 'center' }}
              >
                {(LIQUID_PRICES[liquid] / 100).toFixed(2)} KES/ml · {liquid}
              </motion.div>
            )}
          </div>

          {/* Dispense button */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => canDispense && setView('checkout')}
            style={{
              width: '100%', padding: '10px', borderRadius: 12, cursor: canDispense ? 'pointer' : 'not-allowed',
              background: canDispense ? `linear-gradient(135deg, ${ACCENT}, #ea580c)` : 'var(--surface-2)',
              border: canDispense ? 'none' : '1px solid var(--border)',
              color: canDispense ? '#fff' : 'var(--text-muted)',
              fontFamily: 'var(--font-body)', fontWeight: 800, fontSize: 13,
              boxShadow: canDispense ? `0 6px 24px ${ACCENT}40` : 'none',
              transition: 'all 0.2s',
            }}>
            {canDispense ? `Dispense ${EMOJIS[liquid]}` : 'Enter amount to continue'}
          </motion.button>
        </div>

        {/* RIGHT PANEL — Numpad */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '10px 14px 10px', gap: 8 }}>

          {/* Amount display */}
          <div style={{
            borderRadius: 12, background: 'var(--surface-2)', border: '1.5px solid var(--border)',
            padding: '7px 14px', display: 'flex', alignItems: 'baseline', gap: 6, justifyContent: 'flex-end', flexShrink: 0,
          }}>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--text-muted)' }}>KES</span>
            <AnimatePresence mode="wait">
              <motion.span
                key={amount || '0'}
                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                transition={{ duration: 0.1 }}
                style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 26, color: amount ? 'var(--text)' : 'var(--text-dim)', lineHeight: 1 }}
              >
                {amount || '0'}
              </motion.span>
            </AnimatePresence>
          </div>

          {/* Numpad grid */}
          <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gridTemplateRows: 'repeat(4, 1fr)', gap: 6 }}>
            {KEYS.map((k, i) => (
              <motion.button
                key={i}
                whileTap={k !== '' ? { scale: 0.88 } : {}}
                onClick={() => handleKey(k)}
                style={{
                  borderRadius: 10, cursor: k !== '' ? 'pointer' : 'default',
                  background: k === '⌫' ? `${ACCENT}15` : k !== '' ? 'var(--surface-2)' : 'transparent',
                  border: k !== '' ? `1.5px solid ${k === '⌫' ? ACCENT + '40' : 'var(--border)'}` : 'none',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: k === '⌫' ? ACCENT : 'var(--text)',
                  fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 17,
                  boxShadow: k === '⌫' ? `0 2px 8px ${ACCENT}20` : 'none',
                  transition: 'all 0.1s',
                }}
              >
                {k === '⌫' ? <Delete size={16} strokeWidth={2} /> : k}
              </motion.button>
            ))}
          </div>

          {/* Quick amounts */}
          <div style={{ display: 'flex', gap: 6 }}>
            {[20, 50, 100, 200].map(v => (
              <motion.button key={v} whileTap={{ scale: 0.9 }}
                onClick={() => setAmount(String(v))}
                style={{
                  flex: 1, padding: '6px 0', borderRadius: 8, cursor: 'pointer',
                  background: amountNum === v ? `${ACCENT}20` : 'var(--surface)',
                  border: `1px solid ${amountNum === v ? ACCENT + '50' : 'var(--border)'}`,
                  fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 10,
                  color: amountNum === v ? ACCENT : 'var(--text-muted)',
                  transition: 'all 0.15s',
                }}>
                {v}
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {view === 'checkout' && (
          <MpesaCheckout
            amount={amountNum * 100}
            description={`${liquid} — ${fmtVol(volumeMl)}`}
            onSuccess={() => setView('dispensing')}
            onCancel={() => setView('select')}
          />
        )}
      </AnimatePresence>
    </motion.div>
  )
}
