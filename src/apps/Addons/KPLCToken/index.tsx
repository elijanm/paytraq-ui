import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Zap, Delete } from 'lucide-react'
import BackButton from '../../../components/BackButton'
import MpesaCheckout from '../../../components/MpesaCheckout'
import PrintReceiptModal from '../../../components/PrintReceiptModal'

const ACCENT = '#fbbf24'
const RATE = 0.182 // kWh per KES

const AMOUNT_OPTIONS = [50, 100, 200, 500, 1000, 2000]
const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫']

type View = 'entry' | 'checkout' | 'done'

export default function KPLCToken() {
  const [meter, setMeter] = useState('')
  const [amount, setAmount] = useState(200)
  const [view, setView] = useState<View>('entry')
  const [token, setToken] = useState('')
  const [showReceipt, setShowReceipt] = useState(false)

  const units = (amount * RATE).toFixed(1)
  const canPay = meter.length >= 6

  const handleKey = (k: string) => {
    if (k === '⌫') {
      setMeter(m => m.slice(0, -1))
      return
    }
    if (k === '') return
    if (meter.length >= 11) return
    setMeter(m => m + k)
  }

  const handleSuccess = () => {
    const t = Array.from({ length: 5 }, () =>
      String(Math.floor(Math.random() * 9000 + 1000))
    ).join('-')
    setToken(t)
    setView('done')
  }

  // Format meter display: groups of 4
  const meterDisplay = meter
    ? meter.replace(/(.{4})/g, '$1 ').trim()
    : '_ _ _ _ _ _ _ _ _ _ _'

  return (
    <motion.div
      style={{
        width: 800, height: 480, background: 'var(--bg)',
        display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative',
      }}
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
    >
      {/* Background glow */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: `radial-gradient(ellipse 600px 400px at 50% 50%, ${ACCENT}08 0%, transparent 65%)`,
      }} />

      {/* Header */}
      <div style={{
        position: 'relative', zIndex: 10, display: 'flex', alignItems: 'center', gap: 12,
        padding: '10px 16px', borderBottom: '1px solid var(--border)', background: 'var(--surface)', flexShrink: 0,
      }}>
        <BackButton to="/addons" />
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: ACCENT, boxShadow: `0 0 8px ${ACCENT}` }} />
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, color: 'var(--text)', lineHeight: 1 }}>
            KPLC Token
          </div>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>
            Kenya Power prepaid electricity
          </div>
        </div>
      </div>

      {/* Body */}
      <div style={{ flex: 1, display: 'flex', position: 'relative', zIndex: 10 }}>

        {/* LEFT PANEL */}
        <div style={{
          width: 330, display: 'flex', flexDirection: 'column',
          padding: '14px 16px 14px', gap: 12, borderRight: '1px solid var(--border)',
        }}>
          {/* Meter display */}
          <div style={{
            borderRadius: 12, background: 'var(--surface-2)', border: '1.5px solid var(--border)',
            padding: '10px 14px',
          }}>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 9, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>
              Meter Number
            </div>
            <div style={{
              fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16,
              color: meter.length >= 6 ? ACCENT : 'var(--text-dim)',
              letterSpacing: '0.08em', lineHeight: 1,
            }}>
              {meterDisplay}
            </div>
            {meter.length > 0 && meter.length < 6 && (
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 9, color: '#ef4444', marginTop: 3 }}>
                Enter at least 6 digits
              </div>
            )}
          </div>

          {/* Amount buttons */}
          <div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 9, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>
              Select Amount
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {AMOUNT_OPTIONS.map(opt => (
                <motion.button
                  key={opt}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setAmount(opt)}
                  style={{
                    padding: '7px 12px', borderRadius: 10, cursor: 'pointer',
                    background: amount === opt ? `${ACCENT}20` : 'var(--surface)',
                    border: `1.5px solid ${amount === opt ? ACCENT + '70' : 'var(--border)'}`,
                    fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 11,
                    color: amount === opt ? ACCENT : 'var(--text-muted)',
                    transition: 'all 0.15s',
                    boxShadow: amount === opt ? `0 2px 10px ${ACCENT}25` : 'none',
                  }}
                >
                  {opt}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Summary box */}
          <div style={{
            flex: 1, borderRadius: 14,
            background: `linear-gradient(145deg, ${ACCENT}10 0%, var(--surface) 100%)`,
            border: `1.5px solid ${ACCENT}25`,
            padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 6,
            position: 'relative', overflow: 'hidden',
          }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, transparent, ${ACCENT}60, transparent)` }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
              <Zap size={18} color={ACCENT} strokeWidth={1.8} />
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 22, color: ACCENT, lineHeight: 1 }}>
                {units} kWh
              </span>
            </div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 10, color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: 2 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Amount:</span>
                <span style={{ color: 'var(--text)', fontWeight: 700 }}>KES {amount}.00</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Units:</span>
                <span style={{ color: 'var(--text)', fontWeight: 700 }}>{units} kWh</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Meter:</span>
                <span style={{ color: meter.length >= 6 ? ACCENT : 'var(--text-dim)', fontWeight: 700, fontFamily: 'var(--font-display)', fontSize: 9 }}>
                  {meter || '—'}
                </span>
              </div>
            </div>
          </div>

          {/* Pay button */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => canPay && setView('checkout')}
            style={{
              width: '100%', padding: '13px', borderRadius: 14, cursor: canPay ? 'pointer' : 'not-allowed',
              background: canPay ? `linear-gradient(135deg, ${ACCENT}, #d97706)` : 'var(--surface-2)',
              border: canPay ? 'none' : '1px solid var(--border)',
              color: canPay ? '#000' : 'var(--text-muted)',
              fontFamily: 'var(--font-body)', fontWeight: 800, fontSize: 15,
              boxShadow: canPay ? `0 6px 24px ${ACCENT}40` : 'none',
              transition: 'all 0.2s',
            }}
          >
            {canPay ? `Pay KES ${amount}.00` : 'Enter meter number'}
          </motion.button>
        </div>

        {/* RIGHT PANEL — Numpad for meter number */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '14px 18px', gap: 10 }}>
          <div style={{
            fontFamily: 'var(--font-body)', fontSize: 10, color: 'var(--text-muted)',
            textTransform: 'uppercase', letterSpacing: '0.1em',
          }}>
            Enter Meter Number (11 digits)
          </div>

          {/* Digit counter */}
          <div style={{ display: 'flex', gap: 4, justifyContent: 'center', flexWrap: 'wrap' }}>
            {Array.from({ length: 11 }, (_, i) => (
              <div
                key={i}
                style={{
                  width: 20, height: 20, borderRadius: 6,
                  background: i < meter.length ? `${ACCENT}25` : 'var(--surface-2)',
                  border: `1px solid ${i < meter.length ? ACCENT + '60' : 'var(--border)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 10,
                  color: i < meter.length ? ACCENT : 'var(--text-dim)',
                  transition: 'all 0.15s',
                }}
              >
                {meter[i] || ''}
              </div>
            ))}
          </div>

          {/* Numpad grid */}
          <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gridTemplateRows: 'repeat(4, 1fr)', gap: 8 }}>
            {KEYS.map((k, i) => (
              <motion.button
                key={i}
                whileTap={k !== '' ? { scale: 0.88 } : {}}
                onClick={() => handleKey(k)}
                style={{
                  borderRadius: 12, cursor: k !== '' ? 'pointer' : 'default',
                  background: k === '⌫' ? `${ACCENT}15` : k !== '' ? 'var(--surface-2)' : 'transparent',
                  border: k !== '' ? `1.5px solid ${k === '⌫' ? ACCENT + '40' : 'var(--border)'}` : 'none',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: k === '⌫' ? ACCENT : 'var(--text)',
                  fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20,
                  boxShadow: k === '⌫' ? `0 2px 8px ${ACCENT}20` : 'none',
                  transition: 'all 0.1s',
                }}
              >
                {k === '⌫' ? <Delete size={18} strokeWidth={2} /> : k}
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      {/* Receipt modal */}
      <AnimatePresence>
        {showReceipt && (
          <PrintReceiptModal
            title="KPLC Token Purchase"
            lines={[
              { label: 'Meter No.', value: meter },
              { label: 'Token', value: token, highlight: true },
              { label: 'Units', value: `${units} kWh` },
              { label: 'Amount', value: `KES ${amount}.00`, highlight: true },
              { label: 'Payment', value: 'M-Pesa ✓' },
            ]}
            onDone={() => { setShowReceipt(false); setMeter(''); setToken(''); setView('entry') }}
          />
        )}
      </AnimatePresence>

      {/* Checkout overlay */}
      <AnimatePresence>
        {view === 'checkout' && (
          <MpesaCheckout
            amount={amount * 100}
            description={`KPLC ${units}kWh · Meter ${meter}`}
            onSuccess={handleSuccess}
            onCancel={() => setView('entry')}
          />
        )}
      </AnimatePresence>

      {/* Done screen */}
      <AnimatePresence>
        {view === 'done' && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{
              position: 'absolute', inset: 0, zIndex: 60,
              background: `radial-gradient(ellipse 700px 500px at 50% 50%, ${ACCENT}12 0%, rgba(12,14,20,0.97) 70%)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <motion.div
              initial={{ scale: 0.88, y: 24 }} animate={{ scale: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 280, damping: 24 }}
              style={{
                width: 460, borderRadius: 24,
                background: 'var(--surface)',
                border: `1.5px solid ${ACCENT}40`,
                boxShadow: `0 32px 80px rgba(0,0,0,0.6), 0 0 60px ${ACCENT}15`,
                overflow: 'hidden',
              }}
            >
              {/* Top accent bar */}
              <div style={{ height: 4, background: `linear-gradient(90deg, transparent, ${ACCENT}, transparent)` }} />

              <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
                {/* Icon */}
                <div style={{
                  width: 64, height: 64, borderRadius: 20,
                  background: `linear-gradient(135deg, ${ACCENT}25, ${ACCENT}10)`,
                  border: `2px solid ${ACCENT}50`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: `0 8px 32px ${ACCENT}30`,
                }}>
                  <Zap size={32} color={ACCENT} strokeWidth={1.8} />
                </div>

                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, color: 'var(--text)', marginBottom: 4 }}>
                    Token Generated!
                  </div>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--text-muted)' }}>
                    Enter this token into your meter
                  </div>
                </div>

                {/* Token display */}
                <div style={{
                  width: '100%', padding: '14px 20px', borderRadius: 16,
                  background: `${ACCENT}10`, border: `2px solid ${ACCENT}40`,
                  textAlign: 'center',
                  boxShadow: `0 4px 20px ${ACCENT}20`,
                }}>
                  <div style={{
                    fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 26,
                    color: ACCENT, letterSpacing: '0.12em', lineHeight: 1,
                  }}>
                    {token}
                  </div>
                </div>

                {/* Info row */}
                <div style={{
                  width: '100%', display: 'flex', gap: 8,
                  borderRadius: 12, background: 'var(--surface-2)', border: '1px solid var(--border)',
                  padding: '10px 14px',
                }}>
                  {[
                    { label: 'Meter', value: meter },
                    { label: 'Units', value: `${units} kWh` },
                    { label: 'Amount', value: `KES ${amount}` },
                  ].map(({ label, value }) => (
                    <div key={label} style={{ flex: 1, textAlign: 'center', borderRight: label !== 'Amount' ? '1px solid var(--border)' : 'none' }}>
                      <div style={{ fontFamily: 'var(--font-body)', fontSize: 9, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</div>
                      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 11, color: 'var(--text)', marginTop: 2 }}>{value}</div>
                    </div>
                  ))}
                </div>

                {/* Action buttons */}
                <div style={{ display: 'flex', gap: 10, width: '100%' }}>
                  <motion.button
                    whileTap={{ scale: 0.93 }}
                    onClick={() => setShowReceipt(true)}
                    style={{
                      flex: 1, padding: '11px', borderRadius: 12, cursor: 'pointer',
                      background: `linear-gradient(135deg, ${ACCENT}, #d97706)`,
                      border: 'none',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                      fontFamily: 'var(--font-body)', fontWeight: 800, fontSize: 13,
                      color: '#000',
                      boxShadow: `0 4px 16px ${ACCENT}40`,
                    }}
                  >
                    🖨️ Print Receipt
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.93 }}
                    onClick={() => { setMeter(''); setToken(''); setView('entry') }}
                    style={{
                      flex: 1, padding: '11px', borderRadius: 12, cursor: 'pointer',
                      background: 'var(--surface-2)', border: '1px solid var(--border)',
                      fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 13,
                      color: 'var(--text)',
                    }}
                  >
                    New Token
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
