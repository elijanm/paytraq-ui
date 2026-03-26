import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import BackButton from '../../components/BackButton'
import MpesaCheckout from '../../components/MpesaCheckout'
import DispensingScreen from '../../components/DispensingScreen'
import WashingAnim from './WashingAnim'

const WASHER_RATE = parseFloat(import.meta.env.VITE_WASHER_RATE ?? '0.45')
const DRYER_RATE  = parseFloat(import.meta.env.VITE_DRYER_RATE  ?? '0.35')

type Mode = 'washer' | 'dryer'
type View = 'select' | 'checkout' | 'dispensing'

const AMOUNTS = [5000, 10000, 20000, 50000]
const ACCENT = '#38d4ff'

export default function WashingMachine() {
  const [mode, setMode] = useState<Mode>('washer')
  const [amount, setAmount] = useState(10000)
  const [view, setView] = useState<View>('select')

  const rate = mode === 'washer' ? WASHER_RATE : DRYER_RATE
  const minutes = Math.round((amount / 100) * rate)
  const fmt = (n: number) => `KES ${(n / 100).toFixed(2)}`

  if (view === 'dispensing') return <DispensingScreen type="washing" meta={{ minutes }} />

  return (
    <motion.div
      style={{ width: 800, height: 480, background: 'var(--bg)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
    >
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: `radial-gradient(ellipse 500px 300px at 50% 50%, ${ACCENT}0c 0%, transparent 70%)` }} />
      <div style={{ position: 'absolute', top: 16, left: 16 }}>
        <BackButton />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        style={{
          width: 460, background: 'var(--surface)', borderRadius: 24,
          border: `1.5px solid ${ACCENT}30`,
          boxShadow: `0 24px 64px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.03) inset`,
          padding: '28px 36px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18,
          position: 'relative', overflow: 'hidden',
        }}
      >
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, transparent, ${ACCENT}, transparent)` }} />

        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, color: ACCENT, margin: 0 }}>Washing Machine</h1>

        {/* Mode toggle */}
        <div style={{ display: 'flex', borderRadius: 12, overflow: 'hidden', border: '1px solid var(--border)' }}>
          {(['washer', 'dryer'] as Mode[]).map(m => (
            <motion.button key={m} onClick={() => setMode(m)}
              style={{
                padding: '10px 28px', cursor: 'pointer', border: 'none',
                background: mode === m ? `linear-gradient(135deg, ${ACCENT}, #0ea5e9)` : 'var(--surface-2)',
                color: mode === m ? '#000' : 'var(--text-muted)',
                fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 12,
                transition: 'all 0.2s',
              }}>
              {m === 'washer' ? '🫧 Washer' : '♨️ Dryer'}
            </motion.button>
          ))}
        </div>

        {/* Drum simulation */}
        <WashingAnim size={130} />

        {/* Amount selector */}
        <div style={{ display: 'flex', gap: 8 }}>
          {AMOUNTS.map(a => (
            <motion.button key={a} whileTap={{ scale: 0.92 }} onClick={() => setAmount(a)}
              style={{
                padding: '10px 14px', borderRadius: 12, cursor: 'pointer',
                background: amount === a ? `linear-gradient(135deg, ${ACCENT}, #0ea5e9)` : 'var(--surface-2)',
                border: amount === a ? 'none' : '1px solid var(--border)',
                color: amount === a ? '#000' : 'var(--text)',
                fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 11,
                boxShadow: amount === a ? `0 4px 16px ${ACCENT}30` : 'none',
                transition: 'all 0.15s',
              }}>
              {fmt(a)}
            </motion.button>
          ))}
        </div>

        {/* Time display */}
        <div style={{ padding: '10px 24px', borderRadius: 12, background: `${ACCENT}12`, border: `1px solid ${ACCENT}30`, textAlign: 'center' }}>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, color: ACCENT }}>
            {fmt(amount)} → {minutes} minutes
          </span>
        </div>

        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setView('checkout')}
          style={{
            width: '100%', padding: '13px', borderRadius: 14, cursor: 'pointer',
            background: `linear-gradient(135deg, ${ACCENT}, #0ea5e9)`,
            border: 'none', color: '#000',
            fontFamily: 'var(--font-body)', fontWeight: 800, fontSize: 15,
            boxShadow: `0 6px 24px ${ACCENT}40`,
          }}>
          Start {mode === 'washer' ? 'Washer' : 'Dryer'} 🫧
        </motion.button>
      </motion.div>

      <AnimatePresence>
        {view === 'checkout' && (
          <MpesaCheckout amount={amount} description={`${mode === 'washer' ? 'Washer' : 'Dryer'} — ${minutes} minutes`} onSuccess={() => setView('dispensing')} onCancel={() => setView('select')} />
        )}
      </AnimatePresence>
    </motion.div>
  )
}
