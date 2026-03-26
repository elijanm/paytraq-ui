import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Snowflake, Thermometer, AlertTriangle, Package } from 'lucide-react'
import BackButton from '../../../components/BackButton'
import MpesaCheckout from '../../../components/MpesaCheckout'

const ACCENT = '#67e8f9'

interface Room {
  id: string
  name: string
  temp: number
  minTemp: number
  maxTemp: number
  capacity: number
  accent: string
  icon: string
}

interface StoredItem {
  name: string
  weight: number       // kg
  ratePerKgDay: number // KES
  daysStored: number
}

const ROOMS: Room[] = [
  { id: 'fruits', name: 'Fruits & Veg', temp: 3, minTemp: 2, maxTemp: 6, capacity: 500, accent: '#86efac', icon: '🥦' },
  { id: 'dairy',  name: 'Dairy',        temp: 1, minTemp: 0, maxTemp: 4, capacity: 300, accent: '#67e8f9', icon: '🧀' },
  { id: 'meat',   name: 'Meat & Fish',  temp: -18, minTemp: -22, maxTemp: -15, capacity: 400, accent: '#c4b5fd', icon: '🥩' },
]

const ROOM_ITEMS: Record<string, StoredItem[]> = {
  fruits: [
    { name: 'Tomatoes', weight: 120, ratePerKgDay: 2,   daysStored: 3 },
    { name: 'Cabbage',  weight: 80,  ratePerKgDay: 1.5, daysStored: 5 },
    { name: 'Mangoes',  weight: 200, ratePerKgDay: 3,   daysStored: 2 },
    { name: 'Onions',   weight: 150, ratePerKgDay: 1.5, daysStored: 7 },
  ],
  dairy: [
    { name: 'Whole Milk',   weight: 180, ratePerKgDay: 4, daysStored: 2 },
    { name: 'Yoghurt',      weight: 60,  ratePerKgDay: 5, daysStored: 3 },
    { name: 'Fresh Cheese', weight: 40,  ratePerKgDay: 8, daysStored: 4 },
  ],
  meat: [
    { name: 'Beef',    weight: 250, ratePerKgDay: 6, daysStored: 5 },
    { name: 'Tilapia', weight: 100, ratePerKgDay: 5, daysStored: 3 },
    { name: 'Chicken', weight: 90,  ratePerKgDay: 4, daysStored: 2 },
    { name: 'Pork',    weight: 120, ratePerKgDay: 5, daysStored: 4 },
  ],
}

function tempColor(room: Room): string {
  const { temp, minTemp, maxTemp } = room
  const rangeSz = maxTemp - minTemp
  const outsideBy = temp < minTemp ? minTemp - temp : temp > maxTemp ? temp - maxTemp : 0
  if (outsideBy === 0) return '#86efac'  // green
  if (outsideBy <= rangeSz * 0.3) return '#fbbf24'  // amber
  return '#ef4444'  // red
}

function isOutOfRange(room: Room): boolean {
  return room.temp < room.minTemp || room.temp > room.maxTemp
}

function roomTotalWeight(roomId: string): number {
  return ROOM_ITEMS[roomId]?.reduce((s, i) => s + i.weight, 0) ?? 0
}

function itemBilling(item: StoredItem): number {
  return Math.round(item.weight * item.ratePerKgDay * item.daysStored)
}

function roomTotal(roomId: string): number {
  return ROOM_ITEMS[roomId]?.reduce((s, i) => s + itemBilling(i), 0) ?? 0
}

export default function ColdStorage() {
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null)
  const [showCheckout, setShowCheckout] = useState(false)
  const [done, setDone] = useState(false)

  const selectedRoom = ROOMS.find(r => r.id === selectedRoomId) ?? null
  const items = selectedRoomId ? ROOM_ITEMS[selectedRoomId] ?? [] : []
  const total = selectedRoomId ? roomTotal(selectedRoomId) : 0

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
        padding: '10px 16px', borderBottom: '1px solid var(--border)', background: 'var(--surface)', flexShrink: 0,
      }}>
        <BackButton to="/addons" />
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: ACCENT, boxShadow: `0 0 8px ${ACCENT}` }} />
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, color: 'var(--text)', lineHeight: 1 }}>
            Cold Storage
          </div>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>
            3 active rooms
          </div>
        </div>
      </div>

      {/* Body */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 10 }}>

        {/* Top: Room cards */}
        <div style={{ display: 'flex', gap: 12, padding: '10px 12px', flexShrink: 0 }}>
          {ROOMS.map(room => {
            const isSelected = selectedRoomId === room.id
            const tColor = tempColor(room)
            const outOfRange = isOutOfRange(room)
            const totalWeight = roomTotalWeight(room.id)
            const capacityPct = Math.min(100, (totalWeight / room.capacity) * 100)
            // Temperature bar: map temp to 0-100% position within range
            const tempRange = room.maxTemp - room.minTemp
            const tempPct = Math.max(0, Math.min(100, ((room.temp - room.minTemp) / tempRange) * 100))

            return (
              <motion.button
                key={room.id}
                whileTap={{ scale: 0.97 }}
                animate={{ scale: isSelected ? 1.02 : 1 }}
                onClick={() => setSelectedRoomId(id => id === room.id ? null : room.id)}
                style={{
                  flex: 1, height: 155, borderRadius: 20, cursor: 'pointer',
                  background: `linear-gradient(145deg, ${room.accent}18 0%, var(--surface) 70%)`,
                  border: `1.5px solid ${isSelected ? room.accent + '80' : room.accent + '30'}`,
                  padding: '10px 12px',
                  display: 'flex', flexDirection: 'column', gap: 6,
                  boxShadow: isSelected ? `0 0 24px ${room.accent}30, 0 4px 20px rgba(0,0,0,0.3)` : '0 2px 8px rgba(0,0,0,0.2)',
                  position: 'relative', overflow: 'hidden',
                  transition: 'border-color 0.2s, box-shadow 0.2s',
                  textAlign: 'left',
                }}
              >
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, transparent, ${room.accent}70, transparent)` }} />

                {/* Room name + icon + alert */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 16 }}>{room.icon}</span>
                    <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 11, color: 'var(--text)' }}>
                      {room.name}
                    </span>
                  </div>
                  {outOfRange && (
                    <div style={{
                      padding: '2px 6px', borderRadius: 6,
                      background: '#ef444420', border: '1px solid #ef444440',
                      display: 'flex', alignItems: 'center', gap: 3,
                    }}>
                      <AlertTriangle size={9} color="#ef4444" strokeWidth={2} />
                      <span style={{ fontFamily: 'var(--font-body)', fontSize: 8, color: '#ef4444', fontWeight: 700 }}>ALERT</span>
                    </div>
                  )}
                </div>

                {/* Temperature */}
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                  <Thermometer size={12} color={tColor} strokeWidth={1.8} style={{ flexShrink: 0, alignSelf: 'center' }} />
                  <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 22, color: tColor, lineHeight: 1 }}>
                    {room.temp > 0 ? '+' : ''}{room.temp}°C
                  </span>
                </div>

                {/* Temp range bar */}
                <div style={{ width: '100%' }}>
                  <div style={{ width: '100%', height: 4, borderRadius: 2, background: 'var(--surface-2)', position: 'relative', overflow: 'visible' }}>
                    <div style={{
                      position: 'absolute', left: 0, top: 0, height: '100%',
                      width: '100%', borderRadius: 2,
                      background: `linear-gradient(90deg, #3b82f620, ${room.accent}40, #ef444420)`,
                    }} />
                    <div style={{
                      position: 'absolute', left: `${tempPct}%`, top: '50%',
                      transform: 'translate(-50%, -50%)',
                      width: 8, height: 8, borderRadius: '50%',
                      background: tColor,
                      boxShadow: `0 0 6px ${tColor}`,
                    }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 2 }}>
                    <span style={{ fontFamily: 'var(--font-body)', fontSize: 8, color: 'var(--text-dim)' }}>{room.minTemp}°</span>
                    <span style={{ fontFamily: 'var(--font-body)', fontSize: 8, color: 'var(--text-dim)' }}>{room.maxTemp}°</span>
                  </div>
                </div>

                {/* Weight + capacity */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                    <span style={{ fontFamily: 'var(--font-body)', fontSize: 9, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 3 }}>
                      <Package size={9} strokeWidth={1.5} />
                      {totalWeight}kg stored
                    </span>
                    <span style={{ fontFamily: 'var(--font-body)', fontSize: 9, color: 'var(--text-muted)' }}>
                      {Math.round(capacityPct)}% full
                    </span>
                  </div>
                  <div style={{ width: '100%', height: 3, borderRadius: 2, background: 'var(--surface-2)', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', borderRadius: 2,
                      width: `${capacityPct}%`,
                      background: `linear-gradient(90deg, ${room.accent}80, ${room.accent})`,
                      transition: 'width 0.3s',
                    }} />
                  </div>
                </div>
              </motion.button>
            )
          })}
        </div>

        {/* Bottom: Items table */}
        <div style={{ flex: 1, borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <AnimatePresence mode="wait">
            {!selectedRoom ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                style={{
                  flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
                  justifyContent: 'center', gap: 8, opacity: 0.5,
                }}
              >
                <Snowflake size={28} color="var(--text-dim)" strokeWidth={1.2} />
                <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--text-dim)' }}>
                  Select a room to view stored items
                </div>
              </motion.div>
            ) : (
              <motion.div
                key={selectedRoom.id}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '0 16px 10px', overflow: 'hidden' }}
              >
                {/* Table header */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 80px 100px 60px 90px',
                  gap: 8, padding: '8px 12px',
                  borderBottom: '1px solid var(--border)',
                }}>
                  {['Name', 'Weight', 'Rate/kg/day', 'Days', 'Due KES'].map(h => (
                    <div key={h} style={{ fontFamily: 'var(--font-body)', fontSize: 9, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                      {h}
                    </div>
                  ))}
                </div>

                {/* Items */}
                <div style={{ flex: 1, overflowY: 'auto' }}>
                  {items.map(item => {
                    const billing = itemBilling(item)
                    return (
                      <div
                        key={item.name}
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '1fr 80px 100px 60px 90px',
                          gap: 8, padding: '6px 12px',
                          borderBottom: '1px solid var(--border)',
                          alignItems: 'center',
                        }}
                      >
                        <div style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 11, color: 'var(--text)' }}>
                          {item.name}
                        </div>
                        <div style={{ fontFamily: 'var(--font-display)', fontSize: 11, color: 'var(--text-muted)' }}>
                          {item.weight}kg
                        </div>
                        <div style={{ fontFamily: 'var(--font-display)', fontSize: 11, color: 'var(--text-muted)' }}>
                          {item.ratePerKgDay.toFixed(1)}
                        </div>
                        <div style={{ fontFamily: 'var(--font-display)', fontSize: 11, color: 'var(--text-muted)' }}>
                          {item.daysStored}d
                        </div>
                        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 12, color: selectedRoom.accent }}>
                          {billing}
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Total row + collect button */}
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '8px 12px 0',
                  borderTop: '1px solid var(--border)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                    <span style={{ fontFamily: 'var(--font-body)', fontSize: 10, color: 'var(--text-muted)' }}>Total due:</span>
                    <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20, color: selectedRoom.accent }}>
                      KES {total}
                    </span>
                  </div>
                  {done ? (
                    <div style={{
                      padding: '9px 20px', borderRadius: 12,
                      background: '#22c55e20', border: '1px solid #22c55e40',
                      fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 12, color: '#22c55e',
                      display: 'flex', alignItems: 'center', gap: 6,
                    }}>
                      ✓ Collected & Paid
                    </div>
                  ) : (
                    <motion.button
                      whileTap={{ scale: 0.94 }}
                      onClick={() => setShowCheckout(true)}
                      style={{
                        padding: '9px 20px', borderRadius: 12, cursor: 'pointer',
                        background: `linear-gradient(135deg, ${selectedRoom.accent}, ${selectedRoom.accent}99)`,
                        border: 'none', color: '#000',
                        fontFamily: 'var(--font-body)', fontWeight: 800, fontSize: 12,
                        boxShadow: `0 4px 16px ${selectedRoom.accent}40`,
                        display: 'flex', alignItems: 'center', gap: 6,
                      }}
                    >
                      <Package size={14} strokeWidth={2} />
                      Collect & Bill KES {total}
                    </motion.button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Checkout */}
      <AnimatePresence>
        {showCheckout && selectedRoom && (
          <MpesaCheckout
            amount={total * 100}
            description={`Cold Storage · ${selectedRoom.name}`}
            onSuccess={() => { setShowCheckout(false); setDone(true) }}
            onCancel={() => setShowCheckout(false)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  )
}
