import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, Plus, Scale } from 'lucide-react'
import BackButton from '../../components/BackButton'

// ── Types ─────────────────────────────────────────────────────
type View = 'warehouses' | 'zones' | 'aisles' | 'units'

interface Unit {
  id: string; sku: string; name: string
  qty: number; unitWeightKg: number  // kg per unit
  unitPrice: number
  status: 'good' | 'low' | 'critical'
}

interface Aisle {
  id: string; label: string; units: Unit[]
}

interface Zone {
  id: string; name: string; color: string; icon: string
  aisles: Aisle[]
}

interface Warehouse {
  id: number; name: string; location: string; accent: string
  capacityTonnes: number
  zones: Zone[]
}

// ── Data ─────────────────────────────────────────────────────
const WAREHOUSES: Warehouse[] = [
  {
    id: 1, name: 'WH-01 Nairobi Hub', location: 'Industrial Area, Nairobi',
    accent: '#38d4ff', capacityTonnes: 120,
    zones: [
      {
        id: 'A', name: 'Zone A — Dry Goods', color: '#fbbf24', icon: '📦',
        aisles: [
          { id: 'A1', label: 'Aisle A1', units: [
            { id: 'A1-1', sku: 'MF-200', name: 'Maize Flour 2kg',    qty: 320, unitWeightKg: 2.0,  unitPrice: 180,  status: 'good' },
            { id: 'A1-2', sku: 'RC-500', name: 'Rice 5kg Bag',       qty: 85,  unitWeightKg: 5.0,  unitPrice: 620,  status: 'low' },
            { id: 'A1-3', sku: 'SG-100', name: 'Sugar 1kg',          qty: 410, unitWeightKg: 1.0,  unitPrice: 140,  status: 'good' },
            { id: 'A1-4', sku: 'WF-200', name: 'Wheat Flour 2kg',    qty: 230, unitWeightKg: 2.0,  unitPrice: 195,  status: 'good' },
          ]},
          { id: 'A2', label: 'Aisle A2', units: [
            { id: 'A2-1', sku: 'CO-300', name: 'Cooking Oil 3L',     qty: 170, unitWeightKg: 2.8,  unitPrice: 580,  status: 'good' },
            { id: 'A2-2', sku: 'SL-050', name: 'Salt 500g',          qty: 22,  unitWeightKg: 0.5,  unitPrice: 45,   status: 'critical' },
            { id: 'A2-3', sku: 'TL-025', name: 'Tea Leaves 250g',    qty: 290, unitWeightKg: 0.25, unitPrice: 120,  status: 'good' },
          ]},
          { id: 'A3', label: 'Aisle A3', units: [
            { id: 'A3-1', sku: 'BC-040', name: 'Biscuits 400g',      qty: 480, unitWeightKg: 0.4,  unitPrice: 95,   status: 'good' },
            { id: 'A3-2', sku: 'SD-030', name: 'Soda Crate 12×300ml',qty: 60,  unitWeightKg: 7.2,  unitPrice: 1200, status: 'low' },
          ]},
        ],
      },
      {
        id: 'B', name: 'Zone B — Household', color: '#ff9044', icon: '🏠',
        aisles: [
          { id: 'B1', label: 'Aisle B1', units: [
            { id: 'B1-1', sku: 'LD-100', name: 'Laundry Detergent 1kg', qty: 260, unitWeightKg: 1.0,  unitPrice: 320,  status: 'good' },
            { id: 'B1-2', sku: 'DS-050', name: 'Dish Soap 500ml',       qty: 30,  unitWeightKg: 0.55, unitPrice: 95,   status: 'critical' },
            { id: 'B1-3', sku: 'TP-012', name: 'Toilet Paper 12-pack',  qty: 140, unitWeightKg: 1.2,  unitPrice: 480,  status: 'good' },
          ]},
          { id: 'B2', label: 'Aisle B2', units: [
            { id: 'B2-1', sku: 'FM-ST',  name: 'Floor Mop',             qty: 75,  unitWeightKg: 0.8,  unitPrice: 650,  status: 'low' },
            { id: 'B2-2', sku: 'BR-ST',  name: 'Broom',                 qty: 90,  unitWeightKg: 0.5,  unitPrice: 420,  status: 'good' },
            { id: 'B2-3', sku: 'BK-10',  name: 'Bucket 10L',            qty: 120, unitWeightKg: 0.42, unitPrice: 280,  status: 'good' },
          ]},
          { id: 'B3', label: 'Aisle B3', units: [
            { id: 'B3-1', sku: 'SP-500', name: 'Hand Soap 500ml',       qty: 200, unitWeightKg: 0.52, unitPrice: 110,  status: 'good' },
            { id: 'B3-2', sku: 'BS-150', name: 'Bar Soap 150g',         qty: 540, unitWeightKg: 0.15, unitPrice: 55,   status: 'good' },
          ]},
        ],
      },
      {
        id: 'C', name: 'Zone C — Electronics', color: '#b48aff', icon: '🔌',
        aisles: [
          { id: 'C1', label: 'Aisle C1', units: [
            { id: 'C1-1', sku: 'PC-UC',  name: 'USB-C Charger',         qty: 140, unitWeightKg: 0.15, unitPrice: 850,  status: 'good' },
            { id: 'C1-2', sku: 'PB-10',  name: 'Power Bank 10000mAh',   qty: 55,  unitWeightKg: 0.35, unitPrice: 2400, status: 'low' },
            { id: 'C1-3', sku: 'EB-WL',  name: 'Wireless Earbuds',      qty: 88,  unitWeightKg: 0.12, unitPrice: 1800, status: 'good' },
          ]},
          { id: 'C2', label: 'Aisle C2', units: [
            { id: 'C2-1', sku: 'LB-09',  name: 'LED Bulb 9W',           qty: 320, unitWeightKg: 0.10, unitPrice: 280,  status: 'good' },
            { id: 'C2-2', sku: 'EC-05',  name: 'Extension Cable 5m',    qty: 18,  unitWeightKg: 0.40, unitPrice: 650,  status: 'critical' },
            { id: 'C2-3', sku: 'UH-04',  name: 'USB Hub 4-port',        qty: 95,  unitWeightKg: 0.20, unitPrice: 980,  status: 'good' },
          ]},
        ],
      },
    ],
  },
  {
    id: 2, name: 'WH-02 Mombasa Port', location: 'Kilindini, Mombasa',
    accent: '#ff9044', capacityTonnes: 250,
    zones: [
      {
        id: 'D', name: 'Zone D — Imports', color: '#00e5a0', icon: '🚢',
        aisles: [
          { id: 'D1', label: 'Aisle D1', units: [
            { id: 'D1-1', sku: 'TX-050', name: 'Textiles Bolt 50m',     qty: 180, unitWeightKg: 8.0,  unitPrice: 4200,  status: 'good' },
            { id: 'D1-2', sku: 'SP-BX',  name: 'Steel Pipes (box)',     qty: 42,  unitWeightKg: 25.0, unitPrice: 8500,  status: 'good' },
            { id: 'D1-3', sku: 'CT-PL',  name: 'Ceramic Tiles (pallet)',qty: 28,  unitWeightKg: 40.0, unitPrice: 12000, status: 'low' },
          ]},
          { id: 'D2', label: 'Aisle D2', units: [
            { id: 'D2-1', sku: 'FT-050', name: 'Fertilizer 50kg Bag',   qty: 340, unitWeightKg: 50.0, unitPrice: 2800,  status: 'good' },
            { id: 'D2-2', sku: 'PV-03',  name: 'PVC Pipe 3m',           qty: 95,  unitWeightKg: 1.2,  unitPrice: 650,   status: 'good' },
          ]},
          { id: 'D3', label: 'Aisle D3', units: [
            { id: 'D3-1', sku: 'SK-GN',  name: 'Spare Parts Kit',       qty: 12,  unitWeightKg: 5.0,  unitPrice: 15000, status: 'critical' },
            { id: 'D3-2', sku: 'IC-100', name: 'Industrial Cable 100m', qty: 60,  unitWeightKg: 8.0,  unitPrice: 4800,  status: 'good' },
          ]},
        ],
      },
      {
        id: 'E', name: 'Zone E — Cold Storage', color: '#38d4ff', icon: '❄️',
        aisles: [
          { id: 'E1', label: 'Aisle E1', units: [
            { id: 'E1-1', sku: 'FF-010', name: 'Frozen Fish 10kg',       qty: 220, unitWeightKg: 10.0, unitPrice: 1800,  status: 'good' },
            { id: 'E1-2', sku: 'FC-015', name: 'Frozen Chicken 1.5kg',   qty: 85,  unitWeightKg: 1.5,  unitPrice: 780,   status: 'low' },
            { id: 'E1-3', sku: 'DB-005', name: 'Dairy Butter 500g',      qty: 18,  unitWeightKg: 0.5,  unitPrice: 350,   status: 'critical' },
          ]},
          { id: 'E2', label: 'Aisle E2', units: [
            { id: 'E2-1', sku: 'IC-05L', name: 'Ice Cream 5L Tub',       qty: 45,  unitWeightKg: 5.2,  unitPrice: 1200,  status: 'low' },
            { id: 'E2-2', sku: 'YG-01L', name: 'Yogurt 1L',              qty: 130, unitWeightKg: 1.05, unitPrice: 420,   status: 'good' },
          ]},
          { id: 'E3', label: 'Aisle E3', units: [
            { id: 'E3-1', sku: 'MK-01L', name: 'Fresh Milk 1L',          qty: 200, unitWeightKg: 1.03, unitPrice: 60,    status: 'good' },
            { id: 'E3-2', sku: 'JU-01L', name: 'Orange Juice 1L',        qty: 95,  unitWeightKg: 1.1,  unitPrice: 180,   status: 'good' },
          ]},
        ],
      },
      {
        id: 'F', name: 'Zone F — Bulk Grains', color: '#ffc130', icon: '🌾',
        aisles: [
          { id: 'F1', label: 'Aisle F1', units: [
            { id: 'F1-1', sku: 'MZ-090', name: 'Maize 90kg Bag',         qty: 280, unitWeightKg: 90.0, unitPrice: 3200,  status: 'good' },
            { id: 'F1-2', sku: 'WH-090', name: 'Wheat 90kg Bag',         qty: 180, unitWeightKg: 90.0, unitPrice: 3800,  status: 'good' },
          ]},
          { id: 'F2', label: 'Aisle F2', units: [
            { id: 'F2-1', sku: 'SB-050', name: 'Soybean 50kg Bag',       qty: 120, unitWeightKg: 50.0, unitPrice: 4200,  status: 'low' },
            { id: 'F2-2', sku: 'BR-050', name: 'Barley 50kg Bag',        qty: 90,  unitWeightKg: 50.0, unitPrice: 3600,  status: 'good' },
          ]},
        ],
      },
    ],
  },
]

// ── Weight helpers ─────────────────────────────────────────────
const unitTotalKg  = (u: Unit) => u.qty * u.unitWeightKg
const aisleTotalKg = (a: Aisle) => a.units.reduce((s, u) => s + unitTotalKg(u), 0)
const zoneTotalKg  = (z: Zone)  => z.aisles.reduce((s, a) => s + aisleTotalKg(a), 0)
const whTotalKg    = (w: Warehouse) => w.zones.reduce((s, z) => s + zoneTotalKg(z), 0)

const fmtW = (kg: number) => kg >= 1000 ? `${(kg / 1000).toFixed(2)} t` : `${kg.toFixed(1)} kg`
const fmtWshort = (kg: number) => kg >= 1000 ? `${(kg / 1000).toFixed(1)}t` : `${Math.round(kg)}kg`
const fmtK = (n: number) => n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M` : `${(n / 1000).toFixed(0)}K`
const STATUS_COLOR: Record<string, string> = { good: '#00e5a0', low: '#ffc130', critical: '#ef4444' }

// ── Weight bar ────────────────────────────────────────────────
function WeightBar({ kg, maxKg, color, height = 6 }: { kg: number; maxKg: number; color: string; height?: number }) {
  const pct = Math.min((kg / maxKg) * 100, 100)
  return (
    <div style={{ height, borderRadius: height / 2, background: 'var(--surface-3)', overflow: 'hidden' }}>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        style={{ height: '100%', background: `linear-gradient(90deg, ${color}70, ${color})`, borderRadius: height / 2 }}
      />
    </div>
  )
}

// ── Mini weight donut (SVG) ───────────────────────────────────
function WeightDonut({ pct, color, size = 48 }: { pct: number; color: string; size?: number }) {
  const r = (size - 8) / 2
  const circ = 2 * Math.PI * r
  const dash = (pct / 100) * circ
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--surface-3)" strokeWidth={5} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={5}
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" />
    </svg>
  )
}

// ── Main ──────────────────────────────────────────────────────
export default function WarehouseWeight() {
  const [view, setView]         = useState<View>('warehouses')
  const [selWH, setSelWH]       = useState<Warehouse | null>(null)
  const [selZone, setSelZone]   = useState<Zone | null>(null)
  const [selAisle, setSelAisle] = useState<Aisle | null>(null)

  const go = (v: View, wh?: Warehouse, z?: Zone, a?: Aisle) => {
    setView(v)
    if (wh  !== undefined) setSelWH(wh)
    if (z   !== undefined) setSelZone(z)
    if (a   !== undefined) setSelAisle(a)
  }

  const goBack = () => {
    if (view === 'units')       go('aisles')
    else if (view === 'aisles') go('zones')
    else if (view === 'zones')  go('warehouses')
  }

  const accent = selWH?.accent ?? '#ffc130'

  // Breadcrumb
  const crumbs = [
    { label: 'Warehouses', active: view === 'warehouses', onClick: () => go('warehouses') },
    ...(selWH  ? [{ label: selWH.name.split(' ')[0],        active: view === 'zones',  onClick: () => go('zones', selWH) }] : []),
    ...(selZone ? [{ label: selZone.name.split('—')[0].trim(), active: view === 'aisles', onClick: () => go('aisles', selWH!, selZone) }] : []),
    ...(selAisle ? [{ label: selAisle.label, active: view === 'units',  onClick: () => {} }] : []),
  ]

  return (
    <motion.div
      style={{ width: 800, height: 480, background: 'var(--bg)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
    >
      {/* Ambient */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: `radial-gradient(ellipse 600px 300px at 40% 50%, ${accent}08 0%, transparent 65%)` }} />

      {/* Header */}
      <div style={{ position: 'relative', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderBottom: '1px solid var(--border)', background: 'var(--surface)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {view !== 'warehouses' ? (
            <motion.button whileTap={{ scale: 0.9 }} onClick={goBack}
              style={{ width: 32, height: 32, borderRadius: 9, background: 'var(--surface-2)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-muted)' }}>
              <ChevronLeft size={18} />
            </motion.button>
          ) : <BackButton />}

          <div style={{ width: 32, height: 32, borderRadius: 10, background: `linear-gradient(135deg, ${accent}, ${accent}80)`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 4px 12px ${accent}40` }}>
            <Scale size={17} color="#000" />
          </div>

          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, color: 'var(--text)', lineHeight: 1 }}>Warehouse Weight</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
              {crumbs.map((c, i) => (
                <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  {i > 0 && <span style={{ color: 'var(--border-hi)', fontSize: 9 }}>›</span>}
                  <button onClick={c.onClick} style={{ fontFamily: 'var(--font-body)', fontSize: 10, color: c.active ? accent : 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>{c.label}</button>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Total weight pill */}
        <div style={{ display: 'flex', gap: 6 }}>
          {selAisle && (
            <div style={{ padding: '4px 12px', borderRadius: 8, background: `${accent}15`, border: `1px solid ${accent}30` }}>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 11, color: accent }}>
                {fmtW(aisleTotalKg(selAisle))} in {selAisle.label}
              </span>
            </div>
          )}
          {selZone && !selAisle && (
            <div style={{ padding: '4px 12px', borderRadius: 8, background: `${selZone.color}15`, border: `1px solid ${selZone.color}30` }}>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 11, color: selZone.color }}>
                {fmtW(zoneTotalKg(selZone))} in zone
              </span>
            </div>
          )}
          {selWH && !selZone && (
            <div style={{ padding: '4px 12px', borderRadius: 8, background: `${accent}15`, border: `1px solid ${accent}30` }}>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 11, color: accent }}>
                {fmtW(whTotalKg(selWH))} total
              </span>
            </div>
          )}
          {view === 'warehouses' && (
            <div style={{ padding: '4px 12px', borderRadius: 8, background: '#ffc13015', border: '1px solid #ffc13030' }}>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 11, color: '#ffc130' }}>
                {fmtW(WAREHOUSES.reduce((s, w) => s + whTotalKg(w), 0))} across all
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, position: 'relative', zIndex: 10, overflow: 'hidden' }}>
        <AnimatePresence mode="wait">

          {/* ── WAREHOUSES ─────────────────────────── */}
          {view === 'warehouses' && (
            <motion.div key="wh"
              style={{ display: 'flex', gap: 14, padding: '16px 20px', height: '100%', alignItems: 'center' }}
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
              {WAREHOUSES.map((wh, i) => {
                const totalKg = whTotalKg(wh)
                const capKg = wh.capacityTonnes * 1000
                const capPct = (totalKg / capKg) * 100
                const totalValue = wh.zones.flatMap(z => z.aisles.flatMap(a => a.units)).reduce((s, u) => s + u.qty * u.unitPrice, 0)
                const alerts = wh.zones.flatMap(z => z.aisles.flatMap(a => a.units)).filter(u => u.status !== 'good').length
                return (
                  <motion.button key={wh.id} whileTap={{ scale: 0.97 }} onClick={() => go('zones', wh)}
                    initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                    style={{
                      width: 330, height: 340, borderRadius: 20, cursor: 'pointer',
                      background: `linear-gradient(160deg, ${wh.accent}1a 0%, var(--surface) 50%)`,
                      border: `1.5px solid ${wh.accent}35`,
                      boxShadow: `0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 ${wh.accent}20`,
                      padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'flex-start',
                      position: 'relative', overflow: 'hidden',
                    }}>
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, transparent, ${wh.accent}, transparent)` }} />
                    <div style={{ position: 'absolute', top: -30, right: -30, width: 140, height: 140, borderRadius: '50%', border: `1px solid ${wh.accent}18`, pointerEvents: 'none' }} />

                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', width: '100%' }}>
                      <div>
                        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, color: 'var(--text)' }}>{wh.name}</div>
                        <div style={{ fontFamily: 'var(--font-body)', fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>📍 {wh.location}</div>
                      </div>
                      <div style={{ position: 'relative', flexShrink: 0 }}>
                        <WeightDonut pct={capPct} color={wh.accent} size={52} />
                        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 10, color: wh.accent }}>{capPct.toFixed(0)}%</span>
                        </div>
                      </div>
                    </div>

                    {/* BIG weight stat */}
                    <div style={{ width: '100%', padding: '12px 14px', borderRadius: 14, background: `${wh.accent}12`, border: `1px solid ${wh.accent}25` }}>
                      <div style={{ fontFamily: 'var(--font-body)', fontSize: 10, color: 'var(--text-muted)', marginBottom: 4 }}>Total Stock Weight</div>
                      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 28, color: wh.accent, lineHeight: 1 }}>{fmtW(totalKg)}</div>
                      <div style={{ fontFamily: 'var(--font-body)', fontSize: 10, color: 'var(--text-muted)', marginTop: 4 }}>Capacity: {wh.capacityTonnes}t</div>
                      <WeightBar kg={totalKg} maxKg={capKg} color={wh.accent} height={5} />
                    </div>

                    {/* Zone weight breakdown */}
                    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 5 }}>
                      {wh.zones.map(z => {
                        const zkg = zoneTotalKg(z)
                        return (
                          <div key={z.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ fontSize: 12 }}>{z.icon}</span>
                            <div style={{ flex: 1 }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                                <span style={{ fontFamily: 'var(--font-body)', fontSize: 10, color: 'var(--text-muted)' }}>{z.name.split('—')[1]?.trim()}</span>
                                <span style={{ fontFamily: 'var(--font-display)', fontSize: 10, fontWeight: 700, color: z.color }}>{fmtWshort(zkg)}</span>
                              </div>
                              <WeightBar kg={zkg} maxKg={totalKg} color={z.color} height={4} />
                            </div>
                          </div>
                        )
                      })}
                    </div>

                    <div style={{ display: 'flex', gap: 8, width: '100%' }}>
                      <div style={{ flex: 1, padding: '6px 8px', borderRadius: 9, background: '#00e5a00e', border: '1px solid #00e5a020' }}>
                        <div style={{ fontFamily: 'var(--font-body)', fontSize: 9, color: 'var(--text-muted)' }}>Stock Value</div>
                        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, color: '#00e5a0' }}>KES {fmtK(totalValue)}</div>
                      </div>
                      <div style={{ flex: 1, padding: '6px 8px', borderRadius: 9, background: `${alerts > 0 ? '#ef4444' : '#00e5a0'}0e`, border: `1px solid ${alerts > 0 ? '#ef4444' : '#00e5a0'}20` }}>
                        <div style={{ fontFamily: 'var(--font-body)', fontSize: 9, color: 'var(--text-muted)' }}>Alerts</div>
                        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, color: alerts > 0 ? '#ef4444' : '#00e5a0' }}>{alerts} items</div>
                      </div>
                    </div>
                  </motion.button>
                )
              })}

              {/* Add */}
              <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                style={{ width: 130, height: 340, borderRadius: 20, border: '1.5px dashed var(--border)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, cursor: 'pointer' }}>
                <div style={{ width: 44, height: 44, borderRadius: 13, background: 'var(--surface-2)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Plus size={22} color="var(--text-muted)" />
                </div>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textAlign: 'center' }}>Add<br />Warehouse</span>
              </motion.div>
            </motion.div>
          )}

          {/* ── ZONES ──────────────────────────────── */}
          {view === 'zones' && selWH && (
            <motion.div key="zones" style={{ padding: '12px 16px', height: '100%', display: 'flex', flexDirection: 'column', gap: 10 }}
              initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
              {/* WH weight strip */}
              <div style={{ display: 'flex', gap: 8 }}>
                {[
                  { l: 'Total Weight', v: fmtW(whTotalKg(selWH)), c: selWH.accent },
                  { l: 'Capacity Used', v: `${((whTotalKg(selWH) / (selWH.capacityTonnes * 1000)) * 100).toFixed(1)}%`, c: selWH.accent },
                  { l: 'Zones', v: `${selWH.zones.length}`, c: '#b48aff' },
                  { l: 'Stock Value', v: `KES ${fmtK(selWH.zones.flatMap(z => z.aisles.flatMap(a => a.units)).reduce((s, u) => s + u.qty * u.unitPrice, 0))}`, c: '#00e5a0' },
                ].map(({ l, v, c }) => (
                  <div key={l} style={{ flex: 1, padding: '7px 10px', borderRadius: 10, background: `${c}0f`, border: `1px solid ${c}28` }}>
                    <div style={{ fontFamily: 'var(--font-body)', fontSize: 9, color: 'var(--text-muted)' }}>{l}</div>
                    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, color: c }}>{v}</div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: 10, flex: 1, flexWrap: 'wrap', alignContent: 'flex-start' }}>
                {selWH.zones.map((z, i) => {
                  const zkg = zoneTotalKg(z)
                  const maxKg = whTotalKg(selWH)
                  const alerts = z.aisles.flatMap(a => a.units).filter(u => u.status !== 'good').length
                  return (
                    <motion.button key={z.id} whileTap={{ scale: 0.96 }}
                      onClick={() => go('aisles', selWH, z)}
                      initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                      style={{
                        width: 232, borderRadius: 16, cursor: 'pointer',
                        background: `linear-gradient(145deg, ${z.color}14 0%, var(--surface) 60%)`,
                        border: `1.5px solid ${z.color}30`, padding: '13px 14px',
                        display: 'flex', flexDirection: 'column', gap: 9, alignItems: 'flex-start',
                        position: 'relative', overflow: 'hidden',
                        boxShadow: `0 4px 20px rgba(0,0,0,0.3)`,
                      }}>
                      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, transparent, ${z.color}80, transparent)` }} />
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                          <span style={{ fontSize: 20 }}>{z.icon}</span>
                          <div>
                            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 11, color: z.color }}>{z.id}</div>
                            <div style={{ fontFamily: 'var(--font-body)', fontSize: 10, color: 'var(--text-muted)' }}>{z.name.split('—')[1]?.trim()}</div>
                          </div>
                        </div>
                        {alerts > 0 && <span style={{ fontSize: 9, padding: '2px 6px', borderRadius: 5, background: '#ef444420', border: '1px solid #ef444440', color: '#ef4444', fontFamily: 'var(--font-display)', fontWeight: 700 }}>⚠ {alerts}</span>}
                      </div>

                      {/* BIG weight */}
                      <div>
                        <div style={{ fontFamily: 'var(--font-body)', fontSize: 9, color: 'var(--text-muted)' }}>Total Weight</div>
                        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 22, color: z.color, lineHeight: 1 }}>{fmtW(zkg)}</div>
                        <div style={{ fontFamily: 'var(--font-body)', fontSize: 9, color: 'var(--text-muted)', marginTop: 2 }}>{((zkg / maxKg) * 100).toFixed(0)}% of warehouse</div>
                      </div>
                      <WeightBar kg={zkg} maxKg={maxKg} color={z.color} height={5} />

                      <div style={{ display: 'flex', gap: 6, width: '100%' }}>
                        {[
                          { l: 'Aisles', v: `${z.aisles.length}`, c: z.color },
                          { l: 'SKUs', v: `${z.aisles.flatMap(a => a.units).length}`, c: '#b48aff' },
                          { l: 'Value', v: `KES ${fmtK(z.aisles.flatMap(a => a.units).reduce((s, u) => s + u.qty * u.unitPrice, 0))}`, c: '#00e5a0' },
                        ].map(({ l, v, c }) => (
                          <div key={l} style={{ flex: 1, padding: '4px 6px', borderRadius: 7, background: `${c}0e` }}>
                            <div style={{ fontFamily: 'var(--font-body)', fontSize: 8, color: 'var(--text-muted)' }}>{l}</div>
                            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 11, color: c }}>{v}</div>
                          </div>
                        ))}
                      </div>
                    </motion.button>
                  )
                })}
              </div>
            </motion.div>
          )}

          {/* ── AISLES ─────────────────────────────── */}
          {view === 'aisles' && selZone && (
            <motion.div key="aisles" style={{ padding: '12px 16px', height: '100%', display: 'flex', flexDirection: 'column', gap: 10 }}
              initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
              {/* Zone weight strip */}
              <div style={{ display: 'flex', gap: 8 }}>
                {[
                  { l: 'Zone Weight', v: fmtW(zoneTotalKg(selZone)), c: selZone.color },
                  { l: 'Aisles', v: `${selZone.aisles.length}`, c: selZone.color },
                  { l: 'Total SKUs', v: `${selZone.aisles.flatMap(a => a.units).length}`, c: '#b48aff' },
                  { l: 'Zone Value', v: `KES ${fmtK(selZone.aisles.flatMap(a => a.units).reduce((s, u) => s + u.qty * u.unitPrice, 0))}`, c: '#00e5a0' },
                ].map(({ l, v, c }) => (
                  <div key={l} style={{ flex: 1, padding: '7px 10px', borderRadius: 10, background: `${c}0f`, border: `1px solid ${c}28` }}>
                    <div style={{ fontFamily: 'var(--font-body)', fontSize: 9, color: 'var(--text-muted)' }}>{l}</div>
                    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, color: c }}>{v}</div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: 10, flex: 1, flexWrap: 'wrap', alignContent: 'flex-start' }}>
                {selZone.aisles.map((a, i) => {
                  const akg = aisleTotalKg(a)
                  const zkg = zoneTotalKg(selZone)
                  const alerts = a.units.filter(u => u.status !== 'good').length
                  const c = selZone.color
                  return (
                    <motion.button key={a.id} whileTap={{ scale: 0.96 }}
                      onClick={() => go('units', selWH!, selZone, a)}
                      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                      style={{
                        width: 232, borderRadius: 14, cursor: 'pointer',
                        background: `${c}0c`, border: `1.5px solid ${c}28`, padding: '12px 14px',
                        display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-start',
                        boxShadow: '0 2px 12px rgba(0,0,0,0.25)',
                      }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, color: c }}>{a.label}</span>
                        {alerts > 0 && <span style={{ fontSize: 9, padding: '2px 6px', borderRadius: 5, background: '#ef444420', border: '1px solid #ef444440', color: '#ef4444', fontFamily: 'var(--font-display)', fontWeight: 700 }}>⚠ {alerts}</span>}
                      </div>

                      {/* Weight primary */}
                      <div>
                        <div style={{ fontFamily: 'var(--font-body)', fontSize: 9, color: 'var(--text-muted)' }}>Aisle Weight</div>
                        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20, color: c, lineHeight: 1 }}>{fmtW(akg)}</div>
                        <div style={{ fontFamily: 'var(--font-body)', fontSize: 9, color: 'var(--text-muted)', marginTop: 2 }}>{((akg / zkg) * 100).toFixed(0)}% of zone</div>
                      </div>
                      <WeightBar kg={akg} maxKg={zkg} color={c} height={4} />

                      {/* Per-unit weight chips */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 3, width: '100%' }}>
                        {a.units.map(u => (
                          <div key={u.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontFamily: 'var(--font-body)', fontSize: 9, color: 'var(--text-muted)', flex: 1, textAlign: 'left', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 120 }}>{u.name}</span>
                            <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                              <span style={{ fontFamily: 'var(--font-display)', fontSize: 9, fontWeight: 700, color: STATUS_COLOR[u.status] }}>{fmtWshort(unitTotalKg(u))}</span>
                              <div style={{ width: 5, height: 5, borderRadius: '50%', background: STATUS_COLOR[u.status] }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.button>
                  )
                })}
              </div>
            </motion.div>
          )}

          {/* ── UNITS ──────────────────────────────── */}
          {view === 'units' && selAisle && selZone && (
            <motion.div key="units" style={{ padding: '10px 16px', height: '100%', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}
              initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
              {/* Aisle weight summary */}
              <div style={{ display: 'flex', gap: 8 }}>
                {[
                  { l: 'Aisle Weight', v: fmtW(aisleTotalKg(selAisle)), c: selZone.color },
                  { l: '% of Zone', v: `${((aisleTotalKg(selAisle) / zoneTotalKg(selZone)) * 100).toFixed(1)}%`, c: selZone.color },
                  { l: 'SKUs', v: `${selAisle.units.length}`, c: '#b48aff' },
                  { l: 'Aisle Value', v: `KES ${fmtK(selAisle.units.reduce((s, u) => s + u.qty * u.unitPrice, 0))}`, c: '#00e5a0' },
                ].map(({ l, v, c }) => (
                  <div key={l} style={{ flex: 1, padding: '7px 10px', borderRadius: 10, background: `${c}0f`, border: `1px solid ${c}28` }}>
                    <div style={{ fontFamily: 'var(--font-body)', fontSize: 9, color: 'var(--text-muted)' }}>{l}</div>
                    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, color: c }}>{v}</div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                {selAisle.units.map((u, i) => {
                  const sc = STATUS_COLOR[u.status]
                  const totalKg = unitTotalKg(u)
                  const aisleKg = aisleTotalKg(selAisle)
                  return (
                    <motion.div key={u.id}
                      initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                      style={{ borderRadius: 14, padding: '12px 13px', background: `${sc}0a`, border: `1.5px solid ${sc}30`, display: 'flex', flexDirection: 'column', gap: 7 }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                        <div>
                          <div style={{ fontFamily: 'var(--font-body)', fontWeight: 800, fontSize: 11, color: 'var(--text)' }}>{u.name}</div>
                          <div style={{ fontFamily: 'var(--font-display)', fontSize: 9, color: 'var(--text-muted)', marginTop: 1 }}>{u.sku}</div>
                        </div>
                        <span style={{ padding: '2px 6px', borderRadius: 5, background: `${sc}20`, border: `1px solid ${sc}40`, fontFamily: 'var(--font-display)', fontSize: 9, fontWeight: 700, color: sc }}>{u.status.toUpperCase()}</span>
                      </div>

                      {/* WEIGHT — primary */}
                      <div style={{ padding: '8px 10px', borderRadius: 10, background: `${sc}12`, border: `1px solid ${sc}25` }}>
                        <div style={{ fontFamily: 'var(--font-body)', fontSize: 9, color: 'var(--text-muted)' }}>Total Weight</div>
                        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20, color: sc, lineHeight: 1 }}>{fmtW(totalKg)}</div>
                        <div style={{ fontFamily: 'var(--font-body)', fontSize: 9, color: 'var(--text-muted)', marginTop: 2 }}>{u.unitWeightKg} kg × {u.qty.toLocaleString()} units</div>
                        <WeightBar kg={totalKg} maxKg={aisleKg} color={sc} height={4} />
                        <div style={{ fontFamily: 'var(--font-body)', fontSize: 9, color: 'var(--text-muted)', marginTop: 3 }}>{((totalKg / aisleKg) * 100).toFixed(1)}% of aisle</div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
                        {[
                          { l: 'Qty', v: u.qty.toLocaleString(), c: sc },
                          { l: 'Unit Price', v: `KES ${u.unitPrice.toLocaleString()}`, c: '#00e5a0' },
                          { l: 'Unit Wt', v: `${u.unitWeightKg} kg`, c: '#38d4ff' },
                          { l: 'Total Val', v: `KES ${fmtK(u.qty * u.unitPrice)}`, c: '#ffc130' },
                        ].map(({ l, v, c }) => (
                          <div key={l} style={{ padding: '4px 6px', borderRadius: 7, background: `${c}0e` }}>
                            <div style={{ fontFamily: 'var(--font-body)', fontSize: 8, color: 'var(--text-muted)' }}>{l}</div>
                            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 10, color: c }}>{v}</div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </motion.div>
  )
}
