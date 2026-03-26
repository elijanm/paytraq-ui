import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { QRCodeSVG } from 'qrcode.react'
import { X, QrCode, Phone, Loader2, XCircle, ArrowLeft } from 'lucide-react'
import { usePaymentStore } from '../store/paymentStore'

type Step = 'confirm' | 'qr' | 'phone' | 'pending' | 'failed'

interface Props {
  amount: number
  description: string
  onSuccess: () => void
  onCancel: () => void
}

const fmt = (n: number) => `KES ${(n / 100).toFixed(2)}`

const CARD_W = 520
const CARD_H = 420

export default function MpesaCheckout({ amount, description, onSuccess, onCancel }: Props) {
  const [step, setStep] = useState<Step>('confirm')
  const [phone, setPhone] = useState('')
  const { simulateSTK, reset } = usePaymentStore()

  const handleCancel = () => { reset(); onCancel() }

  const sendSTK = async (ph: string) => {
    setStep('pending')
    const ok = await simulateSTK(ph, amount)
    if (ok) { reset(); onSuccess() }
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

  return (
    <motion.div
      style={{
        position: 'absolute', inset: 0,
        background: 'rgba(4,6,12,0.88)',
        backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 50,
      }}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    >
      <motion.div
        style={{
          width: CARD_W, height: CARD_H,
          borderRadius: 22,
          background: 'var(--surface)',
          border: '1.5px solid var(--border-hi)',
          boxShadow: '0 24px 64px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04) inset',
          display: 'flex', flexDirection: 'column',
          overflow: 'hidden',
          position: 'relative',
        }}
        initial={{ scale: 0.88, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
      >
        {/* Green top accent */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 3,
          background: 'linear-gradient(90deg, #22c55e, #4ade80, #22c55e)',
        }} />

        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '18px 22px 14px',
          borderBottom: '1px solid var(--border)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {step !== 'confirm' && step !== 'pending' && step !== 'failed' && (
              <button
                onClick={() => setStep('confirm')}
                style={{ width: 32, height: 32, borderRadius: 10, background: 'var(--surface-2)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-dim)', cursor: 'pointer' }}
              >
                <ArrowLeft size={16} />
              </button>
            )}
            <div style={{
              width: 34, height: 34, borderRadius: 10,
              background: 'linear-gradient(135deg, #22c55e, #16a34a)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 12px #22c55e40',
            }}>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, color: '#fff' }}>M</span>
            </div>
            <div>
              <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, color: 'var(--text)', margin: 0 }}>
                M-Pesa Checkout
              </p>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--text-muted)', margin: 0 }}>
                Secure mobile payment
              </p>
            </div>
          </div>
          <button
            onClick={handleCancel}
            style={{ width: 32, height: 32, borderRadius: 10, background: 'var(--surface-2)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-dim)', cursor: 'pointer' }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Step content */}
        <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
          <AnimatePresence mode="wait">

            {/* CONFIRM */}
            {step === 'confirm' && (
              <motion.div key="confirm" style={{ padding: '20px 28px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, height: '100%' }}
                initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>{description}</p>

                <div style={{
                  background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 16,
                  padding: '14px 28px', textAlign: 'center',
                }}>
                  <p style={{ fontFamily: 'var(--font-display)', fontSize: 34, fontWeight: 700, color: '#22c55e', margin: 0 }}>{fmt(amount)}</p>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--text-muted)', margin: 0 }}>Total to pay</p>
                </div>

                <div style={{ display: 'flex', gap: 12, width: '100%' }}>
                  {[
                    { key: 'qr', icon: QrCode, label: 'Scan QR Code', sub: 'Use M-Pesa app' },
                    { key: 'phone', icon: Phone, label: 'Enter Phone', sub: 'STK Push prompt' },
                  ].map(({ key, icon: Icon, label, sub }) => (
                    <button
                      key={key}
                      onClick={() => setStep(key as Step)}
                      style={{
                        flex: 1, padding: '16px 12px', borderRadius: 14, cursor: 'pointer',
                        background: 'var(--surface-2)', border: '1px solid var(--border-hi)',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                        transition: 'border-color 0.15s, transform 0.1s',
                      }}
                    >
                      <div style={{ width: 44, height: 44, borderRadius: 12, background: '#22c55e1a', border: '1px solid #22c55e30', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Icon size={22} color="#22c55e" />
                      </div>
                      <span style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 13, color: 'var(--text)' }}>{label}</span>
                      <span style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--text-muted)' }}>{sub}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* QR */}
            {step === 'qr' && (
              <motion.div key="qr" style={{ padding: '16px 28px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, height: '100%' }}
                initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>
                  Scan with your M-Pesa app to pay <strong style={{ color: '#22c55e' }}>{fmt(amount)}</strong>
                </p>
                <div style={{ padding: 10, borderRadius: 16, background: '#fff', boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}>
                  <QRCodeSVG value={`mpesa://pay?amount=${amount}&desc=${encodeURIComponent(description)}`} size={168} />
                </div>
                <button onClick={() => setStep('phone')}
                  style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
                  Enter phone number instead
                </button>
              </motion.div>
            )}

            {/* PHONE */}
            {step === 'phone' && (
              <motion.div key="phone" style={{ padding: '14px 28px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, height: '100%' }}
                initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
                {/* Phone display */}
                <div style={{
                  width: '100%', padding: '10px 16px', borderRadius: 12,
                  background: 'var(--surface-2)', border: `1.5px solid ${phone.length >= 9 ? '#22c55e60' : 'var(--border)'}`,
                  textAlign: 'center',
                  fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, color: phone ? 'var(--text)' : 'var(--text-muted)',
                  letterSpacing: '0.1em',
                  transition: 'border-color 0.2s',
                }}>
                  {displayPhone}
                </div>

                {/* Numpad */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, width: '100%' }}>
                  {numpadKeys.map(k => (
                    <motion.button
                      key={k}
                      onClick={() => handleNumpad(k)}
                      whileTap={{ scale: 0.9 }}
                      style={{
                        height: 52,
                        borderRadius: 12,
                        fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18,
                        cursor: 'pointer',
                        border: k === '✓' ? '1px solid #22c55e60' : k === '⌫' ? '1px solid var(--border)' : '1px solid var(--border)',
                        background: k === '✓' ? 'linear-gradient(135deg, #22c55e, #16a34a)' : k === '⌫' ? 'var(--surface-3)' : 'var(--surface-2)',
                        color: k === '✓' ? '#fff' : 'var(--text)',
                        boxShadow: k === '✓' ? '0 4px 16px #22c55e30' : 'none',
                      }}
                    >
                      {k}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* PENDING */}
            {step === 'pending' && (
              <motion.div key="pending" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 16, padding: '0 28px' }}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div style={{
                  width: 72, height: 72, borderRadius: '50%',
                  border: '3px solid #22c55e30',
                  borderTop: '3px solid #22c55e',
                  animation: 'spin 0.9s linear infinite',
                }} />
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, color: 'var(--text)', margin: '0 0 6px' }}>
                    Check your phone
                  </p>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>
                    M-Pesa prompt sent — enter your PIN
                  </p>
                </div>
                <div style={{
                  padding: '8px 20px', borderRadius: 10,
                  background: '#22c55e1a', border: '1px solid #22c55e30',
                }}>
                  <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20, color: '#22c55e' }}>{fmt(amount)}</span>
                </div>
                <button onClick={handleCancel}
                  style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}>
                  Cancel payment
                </button>
              </motion.div>
            )}

            {/* FAILED */}
            {step === 'failed' && (
              <motion.div key="failed" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 14, padding: '0 28px' }}
                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#ef444420', border: '2px solid #ef444440', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <XCircle size={32} color="#ef4444" />
                </div>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, color: 'var(--text)', margin: '0 0 6px' }}>Payment Failed</p>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>
                    The M-Pesa transaction was not completed.
                  </p>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button onClick={() => setStep('confirm')} style={{
                    padding: '11px 24px', borderRadius: 12, cursor: 'pointer',
                    background: 'linear-gradient(135deg, #22c55e, #16a34a)', border: 'none',
                    fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 14, color: '#fff',
                    boxShadow: '0 4px 16px #22c55e40',
                  }}>Try Again</button>
                  <button onClick={handleCancel} style={{
                    padding: '11px 24px', borderRadius: 12, cursor: 'pointer',
                    background: 'var(--surface-2)', border: '1px solid var(--border)',
                    fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 14, color: 'var(--text)',
                  }}>Cancel</button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  )
}
