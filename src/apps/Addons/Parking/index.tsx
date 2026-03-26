import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Car, Clock, LogOut } from 'lucide-react'
import BackButton from '../../../components/BackButton'
import MpesaCheckout from '../../../components/MpesaCheckout'

const ACCENT = '#a78bfa'

interface ParkingSpot {
  id: string
  row: 'A' | 'B'
  num: number
  status: 'free' | 'occupied'
  plate: string | null
  checkIn: number | null
}

function calcAmount(checkIn: number): number {
  const ms = Date.now() - checkIn
  const freeMs = 30 * 60 * 1000
  const billable = Math.max(0, ms - freeMs)
  // KES 30/hr = 30/3600000 per ms
  return Math.floor(billable * 30 / 3600000)
}

function fmtElapsed(ms: number): string {
  if (ms < 60000) return 'Just arrived'
  const totalMin = Math.floor(ms / 60000)
  const h = Math.floor(totalMin / 60)
  const m = totalMin % 60
  if (h > 0) return `${h}h ${m}m`
  return `${m}m`
}

function initSpots(): ParkingSpot[] {
  const now = Date.now()
  const spots: ParkingSpot[] = []
  for (let num = 1; num <= 6; num++) {
    const id = `A${num}`
    if (num === 2) spots.push({ id, row: 'A', num, status: 'occupied', plate: 'KDB 234G', checkIn: now - 5400000 })
    else if (num === 5) spots.push({ id, row: 'A', num, status: 'occupied', plate: 'KCE 890K', checkIn: now - 1800000 })
    else spots.push({ id, row: 'A', num, status: 'free', plate: null, checkIn: null })
  }
  for (let num = 1; num <= 6; num++) {
    const id = `B${num}`
    if (num === 3) spots.push({ id, row: 'B', num, status: 'occupied', plate: 'KDA 567J', checkIn: now - 9000000 })
    else spots.push({ id, row: 'B', num, status: 'free', plate: null, checkIn: null })
  }
  return spots
}

function loadSpots(): ParkingSpot[] {
  try {
    const saved = localStorage.getItem('parking_state')
    if (saved) return JSON.parse(saved) as ParkingSpot[]
  } catch {}
  return initSpots()
}

function saveSpots(spots: ParkingSpot[]) {
  localStorage.setItem('parking_state', JSON.stringify(spots))
}

export default function Parking() {
  const [spots, setSpots] = useState<ParkingSpot[]>(loadSpots)
  const [now, setNow] = useState(Date.now())
  const [selected, setSelected] = useState<ParkingSpot | null>(null)
  const [plateInput, setPlateInput] = useState('')
  const [showCheckout, setShowCheckout] = useState(false)

  useEffect(() => {
    const iv = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(iv)
  }, [])

  const occupiedCount = spots.filter(s => s.status === 'occupied').length

  const handleSpotClick = (spot: ParkingSpot) => {
    setSelected(s => s?.id === spot.id ? null : spot)
    setPlateInput('')
  }

  const handleCheckIn = () => {
    if (!selected || !plateInput.trim()) return
    const updated = spots.map(s =>
      s.id === selected.id
        ? { ...s, status: 'occupied' as const, plate: plateInput.trim().toUpperCase(), checkIn: Date.now() }
        : s
    )
    setSpots(updated)
    saveSpots(updated)
    setSelected(null)
    setPlateInput('')
  }

  const handlePaySuccess = () => {
    if (!selected) return
    const updated = spots.map(s =>
      s.id === selected.id
        ? { ...s, status: 'free' as const, plate: null, checkIn: null }
        : s
    )
    setSpots(updated)
    saveSpots(updated)
    setShowCheckout(false)
    setSelected(null)
  }

  const rowA = spots.filter(s => s.row === 'A')
  const rowB = spots.filter(s => s.row === 'B')

  const selectedSpot = selected ? spots.find(s => s.id === selected.id) ?? null : null
  const exitAmount = selectedSpot?.status === 'occupied' && selectedSpot.checkIn
    ? calcAmount(selectedSpot.checkIn)
    : 0

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
        flexShrink: 0,
      }}>
        <BackButton to="/addons" />
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: ACCENT, boxShadow: `0 0 8px ${ACCENT}` }} />
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, color: 'var(--text)', lineHeight: 1 }}>
            Parking
          </div>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>
            {occupiedCount}/12 spots occupied
          </div>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 10, alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 8, background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
            <Clock size={11} color="var(--text-muted)" />
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 10, color: 'var(--text-muted)' }}>KES 30/hr · 30min free</span>
          </div>
        </div>
      </div>

      {/* Body */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 10 }}>

        {/* Lot visualization */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '8px 20px 0' }}>
          <div style={{ width: 760, margin: '0 auto' }}>

            {/* Row A */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 11, color: 'var(--text-muted)', width: 16 }}>A</div>
              <div style={{ display: 'flex', gap: 8, flex: 1 }}>
                {rowA.map(spot => {
                  const isOccupied = spot.status === 'occupied'
                  const isSelected = selectedSpot?.id === spot.id
                  const elapsed = spot.checkIn ? now - spot.checkIn : 0
                  return (
                    <motion.button
                      key={spot.id}
                      whileTap={{ scale: 0.94 }}
                      onClick={() => handleSpotClick(spot)}
                      style={{
                        flex: 1, height: 65, borderRadius: 10, cursor: 'pointer',
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
                        gap: 2, padding: '4px',
                        boxShadow: isSelected ? `0 0 12px ${ACCENT}25` : 'none',
                        transition: 'all 0.15s',
                      }}
                    >
                      <div style={{
                        fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 11,
                        color: isOccupied ? ACCENT : isSelected ? ACCENT : 'var(--text-muted)',
                      }}>
                        {spot.id}
                      </div>
                      {isOccupied && spot.plate ? (
                        <>
                          <div style={{ fontFamily: 'var(--font-display)', fontSize: 9, fontWeight: 700, color: 'var(--text)' }}>
                            {spot.plate}
                          </div>
                          <div style={{ fontFamily: 'var(--font-body)', fontSize: 8, color: 'var(--text-muted)' }}>
                            {fmtElapsed(elapsed)}
                          </div>
                        </>
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                          <Car size={12} color={isSelected ? ACCENT : 'var(--text-dim)'} strokeWidth={1.5} />
                          <span style={{ fontFamily: 'var(--font-body)', fontSize: 9, color: isSelected ? ACCENT : 'var(--text-dim)' }}>
                            {isSelected ? 'Selected' : 'Free'}
                          </span>
                        </div>
                      )}
                    </motion.button>
                  )
                })}
              </div>
            </div>

            {/* Lane divider */}
            <div style={{
              height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center',
              borderTop: '1px dashed var(--border)', borderBottom: '1px dashed var(--border)',
              marginBottom: 4, marginLeft: 24,
            }}>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 9, color: 'var(--text-dim)', letterSpacing: '0.15em' }}>
                ← DRIVE LANE →
              </span>
            </div>

            {/* Row B */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 11, color: 'var(--text-muted)', width: 16 }}>B</div>
              <div style={{ display: 'flex', gap: 8, flex: 1 }}>
                {rowB.map(spot => {
                  const isOccupied = spot.status === 'occupied'
                  const isSelected = selectedSpot?.id === spot.id
                  const elapsed = spot.checkIn ? now - spot.checkIn : 0
                  return (
                    <motion.button
                      key={spot.id}
                      whileTap={{ scale: 0.94 }}
                      onClick={() => handleSpotClick(spot)}
                      style={{
                        flex: 1, height: 65, borderRadius: 10, cursor: 'pointer',
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
                        gap: 2, padding: '4px',
                        boxShadow: isSelected ? `0 0 12px ${ACCENT}25` : 'none',
                        transition: 'all 0.15s',
                      }}
                    >
                      <div style={{
                        fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 11,
                        color: isOccupied ? ACCENT : isSelected ? ACCENT : 'var(--text-muted)',
                      }}>
                        {spot.id}
                      </div>
                      {isOccupied && spot.plate ? (
                        <>
                          <div style={{ fontFamily: 'var(--font-display)', fontSize: 9, fontWeight: 700, color: 'var(--text)' }}>
                            {spot.plate}
                          </div>
                          <div style={{ fontFamily: 'var(--font-body)', fontSize: 8, color: 'var(--text-muted)' }}>
                            {fmtElapsed(elapsed)}
                          </div>
                        </>
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                          <Car size={12} color={isSelected ? ACCENT : 'var(--text-dim)'} strokeWidth={1.5} />
                          <span style={{ fontFamily: 'var(--font-body)', fontSize: 9, color: isSelected ? ACCENT : 'var(--text-dim)' }}>
                            {isSelected ? 'Selected' : 'Free'}
                          </span>
                        </div>
                      )}
                    </motion.button>
                  )
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom section */}
        <div style={{
          height: 120, borderTop: '1px solid var(--border)', background: 'var(--surface)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '0 20px',
        }}>
          <AnimatePresence mode="wait">
            {!selectedSpot ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, opacity: 0.5,
                }}
              >
                <Car size={28} color="var(--text-dim)" strokeWidth={1.2} />
                <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--text-dim)' }}>
                  Tap a free spot to check in
                </div>
              </motion.div>
            ) : selectedSpot.status === 'free' ? (
              <motion.div
                key="checkin"
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                style={{ display: 'flex', alignItems: 'center', gap: 16, width: '100%', maxWidth: 600 }}
              >
                <div style={{
                  padding: '8px 14px', borderRadius: 10, background: `${ACCENT}15`,
                  border: `1px solid ${ACCENT}40`,
                  fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, color: ACCENT,
                  flexShrink: 0,
                }}>
                  {selectedSpot.id}
                </div>
                <div style={{ flex: 1, display: 'flex', gap: 10, alignItems: 'center' }}>
                  <input
                    value={plateInput}
                    onChange={e => setPlateInput(e.target.value.toUpperCase().slice(0, 9))}
                    placeholder="KDA 123A"
                    maxLength={9}
                    style={{
                      flex: 1, height: 44, borderRadius: 12, padding: '0 16px',
                      background: 'var(--surface-2)', border: `1.5px solid ${plateInput ? ACCENT + '50' : 'var(--border)'}`,
                      color: 'var(--text)', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16,
                      outline: 'none', letterSpacing: '0.08em',
                      transition: 'border-color 0.2s',
                    }}
                  />
                  <motion.button
                    whileTap={{ scale: 0.94 }}
                    onClick={handleCheckIn}
                    disabled={!plateInput.trim()}
                    style={{
                      padding: '0 20px', height: 44, borderRadius: 12, cursor: plateInput.trim() ? 'pointer' : 'not-allowed',
                      background: plateInput.trim() ? `linear-gradient(135deg, ${ACCENT}, #7c3aed)` : 'var(--surface-2)',
                      border: plateInput.trim() ? 'none' : '1px solid var(--border)',
                      color: plateInput.trim() ? '#fff' : 'var(--text-muted)',
                      fontFamily: 'var(--font-body)', fontWeight: 800, fontSize: 13,
                      boxShadow: plateInput.trim() ? `0 4px 16px ${ACCENT}40` : 'none',
                      flexShrink: 0,
                      transition: 'all 0.2s',
                    }}
                  >
                    Check In
                  </motion.button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="exit"
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                style={{ display: 'flex', alignItems: 'center', gap: 16, width: '100%', maxWidth: 600 }}
              >
                <div style={{
                  padding: '8px 14px', borderRadius: 10, background: `${ACCENT}15`,
                  border: `1px solid ${ACCENT}40`,
                  fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, color: ACCENT,
                  flexShrink: 0,
                }}>
                  {selectedSpot.id}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                    <div>
                      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, color: 'var(--text)' }}>
                        {selectedSpot.plate}
                      </div>
                      <div style={{ fontFamily: 'var(--font-body)', fontSize: 10, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Clock size={10} />
                        {selectedSpot.checkIn ? fmtElapsed(now - selectedSpot.checkIn) : ''}
                        {exitAmount === 0 && ' · Free (30min)'}
                      </div>
                    </div>
                    <div style={{
                      padding: '6px 14px', borderRadius: 10,
                      background: exitAmount > 0 ? `${ACCENT}15` : '#22c55e15',
                      border: `1px solid ${exitAmount > 0 ? ACCENT + '40' : '#22c55e40'}`,
                      fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20,
                      color: exitAmount > 0 ? ACCENT : '#22c55e',
                    }}>
                      KES {exitAmount}
                    </div>
                    <motion.button
                      whileTap={{ scale: 0.94 }}
                      onClick={() => exitAmount > 0 ? setShowCheckout(true) : handlePaySuccess()}
                      style={{
                        padding: '10px 20px', borderRadius: 12, cursor: 'pointer',
                        background: exitAmount > 0
                          ? `linear-gradient(135deg, ${ACCENT}, #7c3aed)`
                          : 'linear-gradient(135deg, #22c55e, #16a34a)',
                        border: 'none',
                        color: '#fff',
                        fontFamily: 'var(--font-body)', fontWeight: 800, fontSize: 13,
                        display: 'flex', alignItems: 'center', gap: 6,
                        boxShadow: `0 4px 16px ${ACCENT}40`,
                        flexShrink: 0,
                      }}
                    >
                      <LogOut size={14} strokeWidth={2} />
                      {exitAmount > 0 ? `Pay & Exit KES ${exitAmount}` : 'Exit Free'}
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Checkout */}
      <AnimatePresence>
        {showCheckout && selectedSpot && (
          <MpesaCheckout
            amount={exitAmount * 100}
            description={`Parking ${selectedSpot.id} · ${selectedSpot.plate}`}
            onSuccess={handlePaySuccess}
            onCancel={() => setShowCheckout(false)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  )
}
