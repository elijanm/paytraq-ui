import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { QRCodeSVG } from 'qrcode.react'
import { X, QrCode, Phone, XCircle, ArrowLeft, CreditCard, Wifi, CheckCircle2, AlertTriangle } from 'lucide-react'
import { usePaymentStore } from '../store/paymentStore'

type PayMode = 'mpesa' | 'card'
type Step     = 'confirm' | 'qr' | 'phone' | 'pending' | 'failed'
type CardStep = 'tap' | 'identified' | 'processing' | 'card_failed'

export type PaymentInfo =
  | { method: 'mpesa'; phone: string }
  | { method: 'card'; cardType: string; name: string; last4: string }

interface Props {
  amount: number
  description: string
  onSuccess: (info: PaymentInfo) => void
  onCancel: () => void
}

const fmt = (n: number) => `KES ${(n / 100).toFixed(2)}`
const CARD_W = 520
const CARD_H = 430

// ── Simulated NFC card data ──────────────────────────────────────────────────
const SIMULATED_CARDS = [
  { name: 'JOHN MUTUA',   last4: '7842', type: 'PayTraq Card', color: ['#1a1f35','#2a3a5e'] },
  { name: 'ALICE WANJIRU',last4: '3310', type: 'Nexidra Pay',  color: ['#1c1a2e','#3a2060'] },
  { name: 'PETER KAMAU',  last4: '5591', type: 'PayTraq Card', color: ['#1a2820','#1e4a30'] },
]

// ── NFC ring animation ──────────────────────────────────────────────────────
function NfcRings({ active, accent }: { active: boolean; accent: string }) {
  return (
    <div style={{ position: 'relative', width: 120, height: 120,
      display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {[0, 1, 2].map(i => (
        <motion.div key={i}
          animate={active ? { scale: [1, 2.4], opacity: [0.6, 0] } : { scale: 1, opacity: 0.15 }}
          transition={active ? { duration: 1.8, delay: i * 0.55, repeat: Infinity, ease: 'easeOut' } : {}}
          style={{ position: 'absolute', width: 36, height: 36, borderRadius: '50%',
            border: `2px solid ${accent}` }}
        />
      ))}
      {/* NFC chip icon */}
      <motion.div
        animate={active ? { scale: [1, 1.06, 1] } : {}}
        transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
        style={{ width: 52, height: 52, borderRadius: 14,
          background: `linear-gradient(135deg, ${accent}25, ${accent}10)`,
          border: `2px solid ${accent}60`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: active ? `0 0 24px ${accent}40` : 'none',
          transition: 'box-shadow 0.3s' }}>
        {/* NFC symbol — rotated WiFi */}
        <Wifi size={26} color={accent} strokeWidth={1.5}
          style={{ transform: 'rotate(90deg)' }} />
      </motion.div>
    </div>
  )
}

// ── Virtual card render ───────────────────────────────────────────────────────
function VirtualCard({ card, balance, amount }: {
  card: typeof SIMULATED_CARDS[0]; balance: number; amount: number
}) {
  const enough = balance >= amount
  return (
    <motion.div initial={{ rotateY: 90, opacity: 0 }} animate={{ rotateY: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 200, damping: 22 }}
      style={{ width: 280, height: 160, borderRadius: 16,
        background: `linear-gradient(135deg, ${card.color[0]}, ${card.color[1]})`,
        border: '1px solid rgba(255,255,255,0.12)',
        boxShadow: '0 12px 40px rgba(0,0,0,0.5)',
        padding: '16px 20px', display: 'flex', flexDirection: 'column',
        justifyContent: 'space-between', position: 'relative', overflow: 'hidden', flexShrink: 0 }}>

      {/* Shine overlay */}
      <div style={{ position: 'absolute', top: -40, right: -20, width: 160, height: 160,
        borderRadius: '50%', background: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }} />

      {/* Top row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 9,
            color: 'rgba(255,255,255,0.5)', letterSpacing: '0.1em' }}>CARD TYPE</span>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 11,
            color: '#fff' }}>{card.type}</span>
        </div>
        {/* Chip */}
        <div style={{ width: 32, height: 24, borderRadius: 5,
          background: 'linear-gradient(135deg, #d4a843, #f0c060)',
          border: '1px solid #c8922040',
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, padding: 4 }}>
          {[0,1,2,3].map(i => (
            <div key={i} style={{ background: 'rgba(0,0,0,0.2)', borderRadius: 1 }} />
          ))}
        </div>
      </div>

      {/* Card number */}
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 14, color: 'rgba(255,255,255,0.85)',
        letterSpacing: '0.18em' }}>
        •••• •••• •••• {card.last4}
      </div>

      {/* Bottom row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 8,
            color: 'rgba(255,255,255,0.4)', letterSpacing: '0.08em', marginBottom: 2 }}>CARD HOLDER</div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 12,
            color: '#fff', letterSpacing: '0.06em' }}>{card.name}</div>
        </div>
        {/* Balance badge */}
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 8,
            color: 'rgba(255,255,255,0.4)', letterSpacing: '0.08em', marginBottom: 2 }}>BALANCE</div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13,
            color: enough ? '#4ade80' : '#f87171' }}>
            {fmt(balance)}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// ── Card payment tab ─────────────────────────────────────────────────────────
function CardTab({ amount, onSuccess, onCancel }: { amount: number; onSuccess: (info: PaymentInfo) => void; onCancel: () => void }) {
  const [cardStep, setCardStep] = useState<CardStep>('tap')
  const [card, setCard]       = useState(SIMULATED_CARDS[0])
  const [balance, setBalance] = useState(0)
  const accent = '#38d4ff'
  const timerRef = useRef<ReturnType<typeof setTimeout>>()

  // Auto-simulate card tap after 3s
  useEffect(() => {
    if (cardStep !== 'tap') return
    timerRef.current = setTimeout(() => simulateTap(), 3000)
    return () => clearTimeout(timerRef.current)
  }, [cardStep])

  const simulateTap = () => {
    const picked = SIMULATED_CARDS[Math.floor(Math.random() * SIMULATED_CARDS.length)]
    // Balance: always enough (amount + 2000–15000 KES buffer)
    const bal = amount + 200000 + Math.floor(Math.random() * 1300000)
    setCard(picked)
    setBalance(bal)
    setCardStep('identified')
  }

  const confirmPay = () => {
    setCardStep('processing')
    setTimeout(() => {
      // 92% success
      if (Math.random() > 0.08) onSuccess({ method: 'card', cardType: card.type, name: card.name, last4: card.last4 })
      else setCardStep('card_failed')
    }, 2000)
  }

  const enough = balance >= amount

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', padding: '14px 24px', gap: 14 }}>

      <AnimatePresence mode="wait">

        {/* TAP */}
        {cardStep === 'tap' && (
          <motion.div key="tap"
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
            <NfcRings active={true} accent={accent} />
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15,
                color: 'var(--text)', marginBottom: 4 }}>Tap Your Card</div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--text-muted)' }}>
                Hold your NFC card near the reader
              </div>
            </div>
            {/* Tap target visual */}
            <div style={{ width: 220, height: 52, borderRadius: 12,
              border: `2px dashed ${accent}50`, background: `${accent}08`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
              <CreditCard size={18} color={accent} strokeWidth={1.5} />
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: accent }}>
                Reader active…
              </span>
              <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.2, repeat: Infinity }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%',
                  background: accent, boxShadow: `0 0 6px ${accent}` }} />
              </motion.div>
            </div>
            <motion.button whileTap={{ scale: 0.95 }} onClick={simulateTap}
              style={{ padding: '8px 20px', borderRadius: 10, cursor: 'pointer',
                border: `1px solid ${accent}40`, background: `${accent}12`,
                fontFamily: 'var(--font-body)', fontSize: 11, color: accent, fontWeight: 700 }}>
              Simulate Card Tap
            </motion.button>
          </motion.div>
        )}

        {/* IDENTIFIED */}
        {cardStep === 'identified' && (
          <motion.div key="identified"
            initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, width: '100%' }}>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 18 }}>
                <CheckCircle2 size={14} color="#4ade80" strokeWidth={2} />
              </motion.div>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: '#4ade80' }}>
                Card identified
              </span>
            </div>

            <VirtualCard card={card} balance={balance} amount={amount} />

            {/* Pay summary */}
            <div style={{ width: '100%', padding: '10px 16px', borderRadius: 12,
              background: enough ? '#22c55e10' : '#ef444410',
              border: `1px solid ${enough ? '#22c55e30' : '#ef444430'}`,
              display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: 10,
                  color: 'var(--text-muted)', marginBottom: 2 }}>Amount to deduct</div>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 17,
                  color: enough ? '#22c55e' : '#ef4444' }}>{fmt(amount)}</div>
              </div>
              {!enough && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <AlertTriangle size={13} color="#ef4444" strokeWidth={2} />
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: 10, color: '#ef4444' }}>
                    Insufficient balance
                  </span>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: 10, width: '100%' }}>
              <motion.button whileTap={{ scale: 0.96 }} onClick={() => setCardStep('tap')}
                style={{ flex: 1, padding: '10px', borderRadius: 12, cursor: 'pointer',
                  background: 'var(--surface-2)', border: '1px solid var(--border)',
                  fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 12,
                  color: 'var(--text-muted)' }}>
                ← Rescan
              </motion.button>
              <motion.button whileTap={{ scale: 0.96 }} onClick={confirmPay}
                disabled={!enough}
                style={{ flex: 2, padding: '10px', borderRadius: 12,
                  cursor: enough ? 'pointer' : 'not-allowed',
                  background: enough ? 'linear-gradient(135deg, #22c55e, #16a34a)' : 'var(--surface-2)',
                  border: enough ? 'none' : '1px solid var(--border)',
                  fontFamily: 'var(--font-body)', fontWeight: 800, fontSize: 13,
                  color: enough ? '#fff' : 'var(--text-muted)',
                  boxShadow: enough ? '0 4px 16px #22c55e40' : 'none' }}>
                Confirm & Pay
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* PROCESSING */}
        {cardStep === 'processing' && (
          <motion.div key="processing"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18 }}>
            <div style={{ position: 'relative', width: 72, height: 72,
              display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {[0, 1].map(i => (
                <motion.div key={i}
                  animate={{ scale: [1, 1.8], opacity: [0.5, 0] }}
                  transition={{ duration: 1.2, delay: i * 0.6, repeat: Infinity, ease: 'easeOut' }}
                  style={{ position: 'absolute', width: 40, height: 40, borderRadius: '50%',
                    border: '2px solid #22c55e' }} />
              ))}
              <CreditCard size={28} color="#22c55e" strokeWidth={1.5} />
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15,
                color: 'var(--text)', marginBottom: 4 }}>Processing Payment</div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--text-muted)' }}>
                Deducting {fmt(amount)} from card •••• {card.last4}
              </div>
            </div>
          </motion.div>
        )}

        {/* CARD FAILED */}
        {cardStep === 'card_failed' && (
          <motion.div key="card_failed"
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 60, height: 60, borderRadius: '50%',
              background: '#ef444420', border: '2px solid #ef444440',
              display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <XCircle size={28} color="#ef4444" />
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14,
                color: 'var(--text)', marginBottom: 4 }}>Card Declined</div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--text-muted)' }}>
                Transaction rejected by issuer. Try again or use M-Pesa.
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <motion.button whileTap={{ scale: 0.95 }}
                onClick={() => setCardStep('tap')}
                style={{ padding: '10px 20px', borderRadius: 12, cursor: 'pointer',
                  background: 'linear-gradient(135deg, #22c55e, #16a34a)', border: 'none',
                  fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 12, color: '#fff',
                  boxShadow: '0 4px 16px #22c55e30' }}>
                Retry
              </motion.button>
              <motion.button whileTap={{ scale: 0.95 }} onClick={onCancel}
                style={{ padding: '10px 20px', borderRadius: 12, cursor: 'pointer',
                  background: 'var(--surface-2)', border: '1px solid var(--border)',
                  fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 12,
                  color: 'var(--text-muted)' }}>
                Cancel
              </motion.button>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
export default function MpesaCheckout({ amount, description, onSuccess, onCancel }: Props) {
  const [mode, setMode] = useState<PayMode>('mpesa')
  const [step, setStep] = useState<Step>('confirm')
  const [phone, setPhone] = useState('')
  const { simulateSTK, reset } = usePaymentStore()

  const handleCancel = () => { reset(); onCancel() }

  const sendSTK = async (ph: string) => {
    setStep('pending')
    const ok = await simulateSTK(ph, amount)
    if (ok) { reset(); onSuccess({ method: 'mpesa', phone: ph }) }
    else setStep('failed')
  }

  const numpadKeys = ['1','2','3','4','5','6','7','8','9','⌫','0','✓']
  const handleNumpad = (key: string) => {
    if (key === '⌫') setPhone(p => p.slice(0, -1))
    else if (key === '✓') { if (phone.length >= 9) sendSTK(phone) }
    else if (phone.length < 9) setPhone(p => p + key)
  }
  const displayPhone = phone
    ? `+254 ${phone.slice(0,3)} ${phone.slice(3,6)} ${phone.slice(6)}`.trim()
    : '+254 ___ ___ ___'

  // When switching tabs reset state
  const switchMode = (m: PayMode) => { setMode(m); setStep('confirm'); setPhone('') }

  const MPESA_G = '#22c55e'
  const CARD_G  = '#38d4ff'
  const accentG = mode === 'mpesa' ? MPESA_G : CARD_G

  return (
    <motion.div
      style={{ position: 'absolute', inset: 0, background: 'rgba(4,6,12,0.88)',
        backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center',
        justifyContent: 'center', zIndex: 50 }}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    >
      <motion.div
        style={{ width: CARD_W, height: CARD_H, borderRadius: 22,
          background: 'var(--surface)', border: '1.5px solid var(--border-hi)',
          boxShadow: '0 24px 64px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04) inset',
          display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}
        initial={{ scale: 0.88, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
      >
        {/* Animated top accent */}
        <motion.div animate={{ background: `linear-gradient(90deg, ${accentG}, ${accentG}bb, ${accentG})` }}
          transition={{ duration: 0.35 }}
          style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3 }} />

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 20px 12px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {mode === 'mpesa' && step !== 'confirm' && step !== 'pending' && step !== 'failed' && (
              <button onClick={() => setStep('confirm')}
                style={{ width: 30, height: 30, borderRadius: 9, background: 'var(--surface-2)',
                  border: '1px solid var(--border)', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', color: 'var(--text-dim)', cursor: 'pointer' }}>
                <ArrowLeft size={15} />
              </button>
            )}
            <div style={{ width: 32, height: 32, borderRadius: 9,
              background: mode === 'mpesa'
                ? 'linear-gradient(135deg, #22c55e, #16a34a)'
                : 'linear-gradient(135deg, #38d4ff, #0ea5e9)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: `0 4px 12px ${accentG}40`,
              transition: 'all 0.3s' }}>
              {mode === 'mpesa'
                ? <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, color: '#fff' }}>M</span>
                : <CreditCard size={16} color="#fff" strokeWidth={2} />
              }
            </div>
            <div>
              <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 12,
                color: 'var(--text)', margin: 0 }}>
                {mode === 'mpesa' ? 'M-Pesa Checkout' : 'Card Checkout'}
              </p>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 10, color: 'var(--text-muted)', margin: 0 }}>
                {mode === 'mpesa' ? 'Secure mobile payment' : 'NFC card payment'}
              </p>
            </div>
          </div>
          <button onClick={handleCancel}
            style={{ width: 30, height: 30, borderRadius: 9, background: 'var(--surface-2)',
              border: '1px solid var(--border)', display: 'flex', alignItems: 'center',
              justifyContent: 'center', color: 'var(--text-dim)', cursor: 'pointer' }}>
            <X size={15} />
          </button>
        </div>

        {/* Tab bar */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border)',
          background: 'var(--surface-2)', flexShrink: 0 }}>
          {([
            { key: 'mpesa', label: 'Express Checkout', icon: Phone, color: MPESA_G },
            { key: 'card',  label: 'Card Checkout',    icon: CreditCard, color: CARD_G },
          ] as const).map(t => {
            const active = mode === t.key
            return (
              <motion.button key={t.key} onClick={() => switchMode(t.key)}
                style={{ flex: 1, height: 36, border: 'none', cursor: 'pointer',
                  background: active ? 'var(--surface)' : 'transparent',
                  borderBottom: active ? `2px solid ${t.color}` : '2px solid transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  color: active ? t.color : 'var(--text-muted)',
                  fontFamily: 'var(--font-display)', fontSize: 10, fontWeight: 700,
                  letterSpacing: '0.04em', transition: 'all 0.15s' }}>
                <t.icon size={11} strokeWidth={2} />
                {t.label.toUpperCase()}
              </motion.button>
            )
          })}
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
          <AnimatePresence mode="wait">
            {mode === 'card' ? (
              <motion.div key="card-mode" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.18 }} style={{ height: '100%' }}>
                <CardTab amount={amount} onSuccess={onSuccess} onCancel={handleCancel} />
              </motion.div>
            ) : (
              <motion.div key="mpesa-mode" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.18 }}
                style={{ height: '100%', overflow: 'hidden', position: 'relative' }}>
                <AnimatePresence mode="wait">

                  {step === 'confirm' && (
                    <motion.div key="confirm"
                      style={{ padding: '16px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, height: '100%' }}
                      initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
                      <p style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>{description}</p>
                      <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 14, padding: '12px 28px', textAlign: 'center' }}>
                        <p style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 700, color: MPESA_G, margin: 0 }}>{fmt(amount)}</p>
                        <p style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--text-muted)', margin: 0 }}>Total to pay</p>
                      </div>
                      <div style={{ display: 'flex', gap: 10, width: '100%' }}>
                        {[
                          { key: 'qr',    icon: QrCode, label: 'Scan QR Code', sub: 'Use M-Pesa app' },
                          { key: 'phone', icon: Phone,  label: 'Enter Phone',  sub: 'STK Push prompt' },
                        ].map(({ key, icon: Icon, label, sub }) => (
                          <button key={key} onClick={() => setStep(key as Step)}
                            style={{ flex: 1, padding: '14px 10px', borderRadius: 13, cursor: 'pointer',
                              background: 'var(--surface-2)', border: '1px solid var(--border-hi)',
                              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
                            <div style={{ width: 40, height: 40, borderRadius: 11,
                              background: '#22c55e1a', border: '1px solid #22c55e30',
                              display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <Icon size={20} color={MPESA_G} />
                            </div>
                            <span style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 12, color: 'var(--text)' }}>{label}</span>
                            <span style={{ fontFamily: 'var(--font-body)', fontSize: 10, color: 'var(--text-muted)' }}>{sub}</span>
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {step === 'qr' && (
                    <motion.div key="qr"
                      style={{ padding: '12px 28px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, height: '100%' }}
                      initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
                      <p style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>
                        Scan with your M-Pesa app to pay <strong style={{ color: MPESA_G }}>{fmt(amount)}</strong>
                      </p>
                      <div style={{ padding: 10, borderRadius: 14, background: '#fff', boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}>
                        <QRCodeSVG value={`mpesa://pay?amount=${amount}&desc=${encodeURIComponent(description)}`} size={160} />
                      </div>
                      <button onClick={() => setStep('phone')}
                        style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
                        Enter phone number instead
                      </button>
                    </motion.div>
                  )}

                  {step === 'phone' && (
                    <motion.div key="phone"
                      style={{ padding: '12px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, height: '100%' }}
                      initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
                      <div style={{ width: '100%', padding: '9px 16px', borderRadius: 11,
                        background: 'var(--surface-2)', border: `1.5px solid ${phone.length >= 9 ? '#22c55e60' : 'var(--border)'}`,
                        textAlign: 'center', fontFamily: 'var(--font-display)', fontWeight: 700,
                        fontSize: 17, color: phone ? 'var(--text)' : 'var(--text-muted)',
                        letterSpacing: '0.1em', transition: 'border-color 0.2s' }}>
                        {displayPhone}
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 7, width: '100%' }}>
                        {numpadKeys.map(k => (
                          <motion.button key={k} onClick={() => handleNumpad(k)} whileTap={{ scale: 0.9 }}
                            style={{ height: 48, borderRadius: 11,
                              fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 17, cursor: 'pointer',
                              border: k === '✓' ? '1px solid #22c55e60' : '1px solid var(--border)',
                              background: k === '✓' ? 'linear-gradient(135deg, #22c55e, #16a34a)' : k === '⌫' ? 'var(--surface-2)' : 'var(--surface-2)',
                              color: k === '✓' ? '#fff' : 'var(--text)',
                              boxShadow: k === '✓' ? '0 4px 16px #22c55e30' : 'none' }}>
                            {k}
                          </motion.button>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {step === 'pending' && (
                    <motion.div key="pending"
                      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 14, padding: '0 28px' }}
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      <div style={{ width: 68, height: 68, borderRadius: '50%',
                        border: '3px solid #22c55e30', borderTop: '3px solid #22c55e',
                        animation: 'spin 0.9s linear infinite' }} />
                      <div style={{ textAlign: 'center' }}>
                        <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, color: 'var(--text)', margin: '0 0 5px' }}>Check your phone</p>
                        <p style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>M-Pesa prompt sent — enter your PIN</p>
                      </div>
                      <div style={{ padding: '8px 20px', borderRadius: 10, background: '#22c55e1a', border: '1px solid #22c55e30' }}>
                        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20, color: MPESA_G }}>{fmt(amount)}</span>
                      </div>
                      <button onClick={handleCancel}
                        style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}>
                        Cancel payment
                      </button>
                    </motion.div>
                  )}

                  {step === 'failed' && (
                    <motion.div key="failed"
                      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 12, padding: '0 28px' }}
                      initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
                      <div style={{ width: 60, height: 60, borderRadius: '50%', background: '#ef444420', border: '2px solid #ef444440', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <XCircle size={30} color="#ef4444" />
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, color: 'var(--text)', margin: '0 0 5px' }}>Payment Failed</p>
                        <p style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>The M-Pesa transaction was not completed.</p>
                      </div>
                      <div style={{ display: 'flex', gap: 10 }}>
                        <button onClick={() => setStep('confirm')} style={{ padding: '10px 22px', borderRadius: 11, cursor: 'pointer', background: 'linear-gradient(135deg, #22c55e, #16a34a)', border: 'none', fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 13, color: '#fff', boxShadow: '0 4px 16px #22c55e40' }}>Try Again</button>
                        <button onClick={handleCancel} style={{ padding: '10px 22px', borderRadius: 11, cursor: 'pointer', background: 'var(--surface-2)', border: '1px solid var(--border)', fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 13, color: 'var(--text)' }}>Cancel</button>
                      </div>
                    </motion.div>
                  )}

                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  )
}
