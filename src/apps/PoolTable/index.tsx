import { useState, useRef } from 'react'
import { motion, AnimatePresence, useMotionValue, animate } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import BackButton from '../../components/BackButton'
import MpesaCheckout from '../../components/MpesaCheckout'
import DispensingScreen from '../../components/DispensingScreen'

const PRICE_PER_GAME = parseInt(import.meta.env.VITE_POOL_PRICE_PER_GAME ?? '50') * 100
const ACCENT = '#b48aff'

interface PoolTableDef {
  id: number
  label: string
  status: 'available' | 'occupied'
  note?: string
}

const TABLES: PoolTableDef[] = [
  { id: 1,  label: 'Table 1',  status: 'available' },
  { id: 2,  label: 'Table 2',  status: 'occupied',  note: 'In use' },
  { id: 3,  label: 'Table 3',  status: 'available' },
  { id: 4,  label: 'Table 4',  status: 'available' },
  { id: 5,  label: 'Table 5',  status: 'occupied',  note: 'Reserved' },
  { id: 6,  label: 'Table 6',  status: 'available' },
  { id: 7,  label: 'Table 7',  status: 'available' },
  { id: 8,  label: 'Table 8',  status: 'available' },
]

const CARD_W = 148
const CARD_GAP = 12
const TRACK_PAD = 24
const TRACK_W = 800
const TOTAL_W = TABLES.length * CARD_W + (TABLES.length - 1) * CARD_GAP + TRACK_PAD * 2
const MAX_DRAG = Math.min(0, TRACK_W - TOTAL_W)

function MiniTable({ status }: { status: 'available' | 'occupied' }) {
  const felt = status === 'available' ? '#1a5c1a' : '#3a3a3a'
  const rail  = status === 'available' ? '#4a2a0a' : '#222'
  return (
    <svg width="96" height="58" viewBox="0 0 96 58" fill="none">
      {/* Rail */}
      <rect x="2" y="2" width="92" height="54" rx="9" fill={rail} />
      {/* Felt */}
      <rect x="8" y="8" width="80" height="42" rx="5" fill={felt} />
      {/* Pockets — corners */}
      <circle cx="8"  cy="8"  r="5" fill="#080808" />
      <circle cx="88" cy="8"  r="5" fill="#080808" />
      <circle cx="8"  cy="50" r="5" fill="#080808" />
      <circle cx="88" cy="50" r="5" fill="#080808" />
      {/* Pockets — side centres */}
      <circle cx="48" cy="5"  r="4" fill="#080808" />
      <circle cx="48" cy="53" r="4" fill="#080808" />
      {/* Centre line */}
      <line x1="48" y1="10" x2="48" y2="48" stroke={status === 'available' ? '#ffffff18' : '#ffffff08'} strokeWidth="1" strokeDasharray="3 3" />
      {/* Balls */}
      {status === 'available' ? (
        <>
          <circle cx="32" cy="29" r="5.5" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="0.5" />
          <circle cx="58" cy="22" r="5"   fill="#dc2626" />
          <circle cx="65" cy="35" r="5"   fill="#ca8a04" />
          <circle cx="50" cy="30" r="4.5" fill="#1d4ed8" />
        </>
      ) : (
        <>
          <circle cx="48" cy="29" r="6" fill="#555" stroke="#444" strokeWidth="0.5" />
          <line x1="38" y1="20" x2="58" y2="38" stroke="#777" strokeWidth="2" strokeLinecap="round" />
          <line x1="58" y1="20" x2="38" y2="38" stroke="#777" strokeWidth="2" strokeLinecap="round" />
        </>
      )}
    </svg>
  )
}

type View = 'select' | 'checkout' | 'dispensing'

export default function PoolTable() {
  const [selectedTable, setSelectedTable] = useState<PoolTableDef | null>(null)
  const [games, setGames] = useState(1)
  const [view, setView] = useState<View>('select')
  const x = useMotionValue(0)
  const trackRef = useRef<HTMLDivElement>(null)

  const total = games * PRICE_PER_GAME
  const fmt = (n: number) => `KES ${(n / 100).toFixed(0)}`
  const canPlay = selectedTable !== null && selectedTable.status === 'available'

  const scroll = (dir: 'left' | 'right') => {
    const step = (CARD_W + CARD_GAP) * 2
    const cur = x.get()
    const next = dir === 'right' ? Math.max(MAX_DRAG, cur - step) : Math.min(0, cur + step)
    animate(x, next, { type: 'spring', stiffness: 300, damping: 30 })
  }

  if (view === 'dispensing') {
    return <DispensingScreen type="pool" meta={{ games }} />
  }

  return (
    <motion.div
      style={{ width: 800, height: 480, background: 'var(--bg)', display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
    >
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: `radial-gradient(ellipse 600px 400px at 50% 40%, ${ACCENT}0a 0%, transparent 65%)` }} />

      {/* Header */}
      <div style={{ position: 'relative', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', borderBottom: '1px solid var(--border)', background: 'var(--surface)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <BackButton />
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: ACCENT, boxShadow: `0 0 8px ${ACCENT}` }} />
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, color: 'var(--text)', lineHeight: 1 }}>Pool Tables</div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>
              {TABLES.filter(t => t.status === 'available').length} of {TABLES.length} tables available
            </div>
          </div>
        </div>
        <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--text-muted)' }}>
          {fmt(PRICE_PER_GAME)} / game
        </div>
      </div>

      {/* Table scroll track */}
      <div style={{ position: 'relative', zIndex: 10, flexShrink: 0 }}>

        {/* Scroll label */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 20px 8px' }}>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Select a table
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <motion.button whileTap={{ scale: 0.88 }} onClick={() => scroll('left')}
              style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--surface-2)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-muted)' }}>
              <ChevronLeft size={15} />
            </motion.button>
            <motion.button whileTap={{ scale: 0.88 }} onClick={() => scroll('right')}
              style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--surface-2)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-muted)' }}>
              <ChevronRight size={15} />
            </motion.button>
          </div>
        </div>

        {/* Drag track */}
        <div ref={trackRef} style={{ overflow: 'hidden', paddingBottom: 16 }}>
          <motion.div
            drag="x"
            dragConstraints={{ left: MAX_DRAG, right: 0 }}
            dragElastic={0.08}
            style={{ x, display: 'flex', gap: CARD_GAP, paddingLeft: TRACK_PAD, paddingRight: TRACK_PAD, cursor: 'grab', width: 'max-content' }}
            whileDrag={{ cursor: 'grabbing' }}
          >
            {TABLES.map((table, i) => {
              const isSelected = selectedTable?.id === table.id
              const isOccupied = table.status === 'occupied'
              return (
                <motion.button
                  key={table.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05, type: 'spring', stiffness: 260, damping: 24 }}
                  whileTap={!isOccupied ? { scale: 0.94 } : {}}
                  onClick={() => !isOccupied && setSelectedTable(table)}
                  style={{
                    width: CARD_W, height: 170, borderRadius: 18, flexShrink: 0,
                    background: isSelected
                      ? `linear-gradient(145deg, ${ACCENT}22 0%, var(--surface) 60%)`
                      : isOccupied ? 'var(--surface)' : 'var(--surface)',
                    border: isSelected
                      ? `2px solid ${ACCENT}70`
                      : isOccupied ? '1.5px solid var(--border)' : '1.5px solid var(--border)',
                    boxShadow: isSelected ? `0 8px 28px ${ACCENT}30, 0 0 0 1px ${ACCENT}20` : '0 2px 8px rgba(0,0,0,0.2)',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between',
                    padding: '14px 12px 12px',
                    cursor: isOccupied ? 'not-allowed' : 'pointer',
                    opacity: isOccupied ? 0.55 : 1,
                    position: 'relative', overflow: 'hidden',
                    transition: 'border-color 0.15s, box-shadow 0.15s, opacity 0.15s',
                  }}
                >
                  {isSelected && (
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, transparent, ${ACCENT}, transparent)` }} />
                  )}

                  {/* Table number */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                    <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, color: isSelected ? ACCENT : 'var(--text)' }}>
                      {table.label}
                    </span>
                    {isSelected && (
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 400 }}
                        style={{ width: 18, height: 18, borderRadius: '50%', background: ACCENT, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: '#000', fontWeight: 700 }}>
                        ✓
                      </motion.div>
                    )}
                  </div>

                  {/* Mini table visual */}
                  <MiniTable status={table.status} />

                  {/* Status badge */}
                  <div style={{
                    padding: '4px 10px', borderRadius: 8,
                    background: isOccupied ? '#ef444420' : '#00e5a018',
                    border: `1px solid ${isOccupied ? '#ef444435' : '#00e5a030'}`,
                    fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 9,
                    color: isOccupied ? '#ef4444' : '#00e5a0',
                    textTransform: 'uppercase', letterSpacing: '0.06em',
                  }}>
                    {isOccupied ? (table.note ?? 'Occupied') : 'Available'}
                  </div>
                </motion.button>
              )
            })}
          </motion.div>
        </div>
      </div>

      {/* Bottom section — game selector + pay */}
      <div style={{ flex: 1, position: 'relative', zIndex: 10, borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', padding: '0 28px', gap: 24 }}>

        {/* Left: selected table info or prompt */}
        <div style={{ width: 200, flexShrink: 0 }}>
          <AnimatePresence mode="wait">
            {selectedTable ? (
              <motion.div key={selectedTable.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}
                style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Selected</div>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 22, color: ACCENT, lineHeight: 1 }}>{selectedTable.label}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#00e5a0', boxShadow: '0 0 6px #00e5a0' }} />
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: 10, color: '#00e5a0' }}>Available</span>
                </div>
              </motion.div>
            ) : (
              <motion.div key="none" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--text-dim)' }}>← Swipe & tap a table above to select it</div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Divider */}
        <div style={{ width: 1, height: 60, background: 'var(--border)', flexShrink: 0 }} />

        {/* Centre: game stepper */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Games</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <motion.button whileTap={{ scale: 0.88 }} onClick={() => setGames(g => Math.max(1, g - 1))}
              style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--surface-2)', border: `1px solid ${games > 1 ? ACCENT + '40' : 'var(--border)'}`, color: 'var(--text)', cursor: 'pointer', fontSize: 20, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              −
            </motion.button>
            <motion.div key={games} initial={{ scale: 1.3, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 36, color: 'var(--text)', minWidth: 48, textAlign: 'center', lineHeight: 1 }}>
              {games}
            </motion.div>
            <motion.button whileTap={{ scale: 0.88 }} onClick={() => setGames(g => Math.min(10, g + 1))}
              style={{ width: 44, height: 44, borderRadius: 12, background: `${ACCENT}20`, border: `1px solid ${ACCENT}40`, color: ACCENT, cursor: 'pointer', fontSize: 20, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 2px 10px ${ACCENT}20` }}>
              +
            </motion.button>
          </div>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 10, color: 'var(--text-muted)' }}>
            {games} × {fmt(PRICE_PER_GAME)}
          </div>
        </div>

        {/* Divider */}
        <div style={{ width: 1, height: 60, background: 'var(--border)', flexShrink: 0 }} />

        {/* Right: total + pay */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--text-muted)' }}>Total</span>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 26, color: ACCENT, lineHeight: 1 }}>{fmt(total)}</span>
          </div>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => canPlay && setView('checkout')}
            style={{
              padding: '13px 28px', borderRadius: 14, cursor: canPlay ? 'pointer' : 'not-allowed',
              background: canPlay ? `linear-gradient(135deg, ${ACCENT}, #7c3aed)` : 'var(--surface-2)',
              border: canPlay ? 'none' : '1px solid var(--border)',
              color: canPlay ? '#fff' : 'var(--text-dim)',
              fontFamily: 'var(--font-body)', fontWeight: 800, fontSize: 15,
              boxShadow: canPlay ? `0 6px 24px ${ACCENT}45` : 'none',
              transition: 'all 0.2s',
            }}
          >
            {canPlay ? `Play Now 🎱` : 'Select a table'}
          </motion.button>
        </div>
      </div>

      <AnimatePresence>
        {view === 'checkout' && selectedTable && (
          <MpesaCheckout
            amount={total}
            description={`${selectedTable.label} — ${games} game${games > 1 ? 's' : ''}`}
            onSuccess={() => setView('dispensing')}
            onCancel={() => setView('select')}
          />
        )}
      </AnimatePresence>
    </motion.div>
  )
}
