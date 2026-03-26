import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Lock, Timer, CheckCircle } from 'lucide-react'
import BackButton from '../../../components/BackButton'
import MpesaCheckout from '../../../components/MpesaCheckout'

const ACCENT = '#60a5fa'

interface Locker {
  id: number
  label: string
  status: 'free' | 'occupied'
  expiry: number | null
  pin: string | null
}

interface DurationOption {
  label: string
  hours: number
  price: number
}

const DURATION_OPTIONS: DurationOption[] = [
  { label: '2h', hours: 2, price: 100 },
  { label: '4h', hours: 4, price: 180 },
  { label: '8h', hours: 8, price: 300 },
  { label: '24h', hours: 24, price: 500 },
]

function fmtCountdown(ms: number): string {
  if (ms <= 0) return 'Expired'
  if (ms < 60000) return 'Expires soon'
  const totalSec = Math.floor(ms / 1000)
  const h = Math.floor(totalSec / 3600)
  const m = Math.floor((totalSec % 3600) / 60)
  const s = totalSec % 60
  if (h > 0) return `${h}h ${String(m).padStart(2, '0')}m ${String(s).padStart(2, '0')}s`
  return `${String(m).padStart(2, '0')}m ${String(s).padStart(2, '0')}s`
}

function initLockers(): Locker[] {
  const now = Date.now()
  return Array.from({ length: 12 }, (_, i) => {
    const id = i + 1
    const label = `L${String(id).padStart(2, '0')}`
    if (id === 3) return { id, label, status: 'occupied', expiry: now + 3600000, pin: '7241' }
    if (id === 7) return { id, label, status: 'occupied', expiry: now + 7200000, pin: '3856' }
    if (id === 10) return { id, label, status: 'occupied', expiry: now + 900000, pin: '9103' }
    return { id, label, status: 'free', expiry: null, pin: null }
  })
}

function loadLockers(): Locker[] {
  try {
    const saved = localStorage.getItem('locker_state')
    if (saved) return JSON.parse(saved) as Locker[]
  } catch {}
  return initLockers()
}

function saveLockers(lockers: Locker[]) {
  localStorage.setItem('locker_state', JSON.stringify(lockers))
}

export default function LockerRental() {
  const [lockers, setLockers] = useState<Locker[]>(loadLockers)
  const [now, setNow] = useState(Date.now())
  const [selected, setSelected] = useState<Locker | null>(null)
  const [durIdx, setDurIdx] = useState(0)
  const [showCheckout, setShowCheckout] = useState(false)
  const [pinModal, setPinModal] = useState<{ locker: Locker; pin: string } | null>(null)

  // Tick every second
  useEffect(() => {
    const iv = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(iv)
  }, [])

  const occupiedCount = lockers.filter(l => l.status === 'occupied').length
  const selectedDur = DURATION_OPTIONS[durIdx]

  const handleLockerClick = (locker: Locker) => {
    if (locker.status === 'occupied') return
    setSelected(s => s?.id === locker.id ? null : locker)
  }

  const handlePay = () => {
    if (!selected) return
    setShowCheckout(true)
  }

  const handleSuccess = () => {
    if (!selected) return
    const pin = String(Math.floor(Math.random() * 9000 + 1000))
    const expiry = Date.now() + selectedDur.hours * 3600000
    const updated = lockers.map(l =>
      l.id === selected.id
        ? { ...l, status: 'occupied' as const, expiry, pin }
        : l
    )
    setLockers(updated)
    saveLockers(updated)
    setShowCheckout(false)
    setPinModal({ locker: { ...selected, status: 'occupied', expiry, pin }, pin })
    setSelected(null)
  }

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
        background: `radial-gradient(ellipse 600px 400px at 50% 50%, ${ACCENT}07 0%, transparent 65%)`,
      }} />

      {/* Header */}
      <div style={{
        position: 'relative', zIndex: 10, display: 'flex', alignItems: 'center', gap: 12,
        padding: '10px 16px', borderBottom: '1px solid var(--border)', background: 'var(--surface)',
        flexShrink: 0, height: 44,
      }}>
        <BackButton to="/addons" />
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: ACCENT, boxShadow: `0 0 8px ${ACCENT}` }} />
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, color: 'var(--text)', lineHeight: 1 }}>
            Locker Rental
          </div>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>
            {occupiedCount}/12 lockers occupied
          </div>
        </div>
      </div>

      {/* Body */}
      <div style={{ flex: 1, display: 'flex', position: 'relative', zIndex: 10, overflow: 'hidden' }}>

        {/* LEFT — locker grid */}
        <div style={{ width: 580, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '12px' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 130px)',
            gridTemplateRows: 'repeat(3, 72px)',
            gap: 10,
            margin: 'auto',
          }}>
            {lockers.map(locker => {
              const isOccupied = locker.status === 'occupied'
              const isSelected = selected?.id === locker.id
              const remaining = locker.expiry ? locker.expiry - now : 0

              return (
                <motion.button
                  key={locker.id}
                  whileTap={!isOccupied ? { scale: 0.94 } : {}}
                  onClick={() => handleLockerClick(locker)}
                  style={{
                    width: 130, height: 72, borderRadius: 12, cursor: isOccupied ? 'default' : 'pointer',
                    background: isOccupied
                      ? `${ACCENT}12`
                      : isSelected
                        ? `${ACCENT}20`
                        : 'var(--surface-2)',
                    border: isOccupied
                      ? `1.5px solid ${ACCENT}50`
                      : isSelected
                        ? `1.5px solid ${ACCENT}`
                        : '1.5px dashed var(--border)',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    gap: 3, padding: '6px',
                    boxShadow: isSelected ? `0 0 16px ${ACCENT}30` : 'none',
                    transition: 'all 0.15s',
                  }}
                >
                  <div style={{
                    fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13,
                    color: isOccupied ? ACCENT : isSelected ? ACCENT : 'var(--text)',
                  }}>
                    {locker.label}
                  </div>
                  {isOccupied ? (
                    <>
                      <Lock size={12} color={ACCENT} strokeWidth={2} />
                      <div style={{ fontFamily: 'var(--font-body)', fontSize: 9, color: 'var(--text-muted)', textAlign: 'center' }}>
                        {fmtCountdown(remaining)}
                      </div>
                    </>
                  ) : (
                    <div style={{ fontFamily: 'var(--font-body)', fontSize: 10, color: isSelected ? ACCENT : 'var(--text-dim)' }}>
                      {isSelected ? 'Selected' : 'Free'}
                    </div>
                  )}
                </motion.button>
              )
            })}
          </div>
        </div>

        {/* RIGHT — detail panel */}
        <div style={{
          width: 220, borderLeft: '1px solid var(--border)',
          display: 'flex', flexDirection: 'column', padding: '14px 16px', gap: 10,
        }}>
          {!selected ? (
            <div style={{
              flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: 'center', gap: 10, opacity: 0.5,
            }}>
              <Lock size={32} color="var(--text-dim)" strokeWidth={1.2} />
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--text-dim)', textAlign: 'center', lineHeight: 1.4 }}>
                Tap a free locker to rent it
              </div>
            </div>
          ) : (
            <>
              <div style={{
                padding: '8px 12px', borderRadius: 10, background: `${ACCENT}15`,
                border: `1px solid ${ACCENT}40`,
                display: 'flex', alignItems: 'center', gap: 8,
              }}>
                <Timer size={14} color={ACCENT} strokeWidth={1.8} />
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, color: ACCENT }}>
                  {selected.label}
                </span>
              </div>

              <div style={{ fontFamily: 'var(--font-body)', fontSize: 9, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Duration
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {DURATION_OPTIONS.map((opt, i) => (
                  <motion.button
                    key={opt.label}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setDurIdx(i)}
                    style={{
                      padding: '8px 12px', borderRadius: 10, cursor: 'pointer',
                      background: durIdx === i ? `${ACCENT}20` : 'var(--surface-2)',
                      border: `1px solid ${durIdx === i ? ACCENT + '60' : 'var(--border)'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      transition: 'all 0.15s',
                    }}
                  >
                    <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 11, color: durIdx === i ? ACCENT : 'var(--text)' }}>
                      {opt.label}
                    </span>
                    <span style={{ fontFamily: 'var(--font-body)', fontSize: 10, color: 'var(--text-muted)' }}>
                      KES {opt.price}
                    </span>
                  </motion.button>
                ))}
              </div>

              <motion.button
                whileTap={{ scale: 0.94 }}
                onClick={handlePay}
                style={{
                  marginTop: 'auto', width: '100%', padding: '12px', borderRadius: 12, cursor: 'pointer',
                  background: `linear-gradient(135deg, ${ACCENT}, #3b82f6)`,
                  border: 'none', color: '#000',
                  fontFamily: 'var(--font-body)', fontWeight: 800, fontSize: 13,
                  boxShadow: `0 6px 20px ${ACCENT}40`,
                }}
              >
                Pay KES {selectedDur.price}
              </motion.button>
            </>
          )}
        </div>
      </div>

      {/* Checkout */}
      <AnimatePresence>
        {showCheckout && selected && (
          <MpesaCheckout
            amount={selectedDur.price * 100}
            description={`Locker ${selected.label} · ${selectedDur.label}`}
            onSuccess={handleSuccess}
            onCancel={() => setShowCheckout(false)}
          />
        )}
      </AnimatePresence>

      {/* PIN modal */}
      <AnimatePresence>
        {pinModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{
              position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)',
              backdropFilter: 'blur(6px)', zIndex: 70,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <motion.div
              initial={{ scale: 0.85, y: 24 }} animate={{ scale: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 26 }}
              style={{
                width: 320, borderRadius: 24, background: 'var(--surface)',
                border: `2px solid ${ACCENT}50`,
                boxShadow: `0 32px 80px rgba(0,0,0,0.6), 0 0 40px ${ACCENT}15`,
                overflow: 'hidden',
              }}
            >
              <div style={{ height: 4, background: `linear-gradient(90deg, transparent, ${ACCENT}, transparent)` }} />
              <div style={{ padding: '24px 24px 22px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
                <div style={{
                  width: 56, height: 56, borderRadius: 18,
                  background: `${ACCENT}20`, border: `2px solid ${ACCENT}50`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: `0 8px 24px ${ACCENT}30`,
                }}>
                  <CheckCircle size={28} color={ACCENT} strokeWidth={1.8} />
                </div>

                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, color: 'var(--text)', marginBottom: 4 }}>
                    Locker {pinModal.locker.label} Assigned
                  </div>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--text-muted)' }}>
                    Your 4-digit access code
                  </div>
                </div>

                <div style={{
                  width: '100%', padding: '14px', borderRadius: 16,
                  background: `${ACCENT}12`, border: `2px solid ${ACCENT}40`,
                  textAlign: 'center',
                }}>
                  <div style={{
                    fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 38,
                    color: ACCENT, letterSpacing: '0.18em', lineHeight: 1,
                  }}>
                    {pinModal.pin}
                  </div>
                </div>

                <div style={{ fontFamily: 'var(--font-body)', fontSize: 10, color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.5 }}>
                  Duration: {selectedDur.label} · Expires in {selectedDur.hours}h
                </div>

                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setPinModal(null)}
                  style={{
                    width: '100%', padding: '13px', borderRadius: 14, cursor: 'pointer',
                    background: `linear-gradient(135deg, ${ACCENT}, #3b82f6)`,
                    border: 'none', color: '#000',
                    fontFamily: 'var(--font-body)', fontWeight: 800, fontSize: 14,
                    boxShadow: `0 6px 20px ${ACCENT}40`,
                  }}
                >
                  OK, Got it!
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
