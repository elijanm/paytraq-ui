import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, TrendingUp, TrendingDown, Beef } from 'lucide-react'
import BackButton from '../../../components/BackButton'

// ── Types ─────────────────────────────────────────────────────
type Zone  = 'Alpha' | 'Beta' | 'Gamma'
type Stage = 'Intake' | 'Growing' | 'Finishing' | 'Ready'

interface Cow {
  id: number; tag: string; name: string; breed: string; sex: 'M' | 'F'
  zone: Zone; stage: Stage; color: string
  purchaseWeight: number; currentWeight: number; targetWeight: number
  daysOnFarm: number; purchaseCost: number; feedCost: number; vetCost: number
  monthlyWeights: number[]   // 0 = not yet on farm
  notes: string
}

// ── Constants ─────────────────────────────────────────────────
const MONTHS = ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar']
const MARKET_PRICE = 420  // KES per kg live weight

const ZONE_META: Record<Zone, { color: string; label: string; desc: string }> = {
  Alpha: { color: '#fbbf24', label: 'Zone Alpha', desc: 'Premium feeding pen' },
  Beta:  { color: '#94a3b8', label: 'Zone Beta',  desc: 'Standard fattening'  },
  Gamma: { color: '#c77a40', label: 'Zone Gamma', desc: 'Quarantine / intake'  },
}

const STAGE_META: Record<Stage, { color: string; step: number }> = {
  Intake:    { color: '#6b7a9e', step: 0 },
  Growing:   { color: '#38d4ff', step: 1 },
  Finishing: { color: '#ff9044', step: 2 },
  Ready:     { color: '#00e5a0', step: 3 },
}

// ── Cow Data ─────────────────────────────────────────────────
const COWS: Cow[] = [
  {
    id:1, tag:'KE-001', name:'Simba',   breed:'Boran',      sex:'M', zone:'Alpha', stage:'Finishing', color:'#00e5a0',
    purchaseWeight:240, currentWeight:361, targetWeight:450, daysOnFarm:152,
    purchaseCost:96000, feedCost:49096, vetCost:8664,
    monthlyWeights:[240,272,298,320,341,361],
    notes:'Strong daily gain. Approaching finish weight.',
  },
  {
    id:2, tag:'KE-002', name:'Razi',    breed:'Sahiwal',    sex:'F', zone:'Alpha', stage:'Ready',     color:'#38d4ff',
    purchaseWeight:290, currentWeight:415, targetWeight:430, daysOnFarm:152,
    purchaseCost:87000, feedCost:49096, vetCost:8664,
    monthlyWeights:[290,318,344,368,392,415],
    notes:'At market weight. Schedule sale this week.',
  },
  {
    id:3, tag:'KE-003', name:'Duma',    breed:'Boran',      sex:'M', zone:'Beta',  stage:'Growing',   color:'#b48aff',
    purchaseWeight:185, currentWeight:318, targetWeight:450, daysOnFarm:152,
    purchaseCost:74000, feedCost:40018, vetCost:7062,
    monthlyWeights:[185,215,248,275,298,318],
    notes:'Consistent ADG. Needs 6–7 more weeks to finish.',
  },
  {
    id:4, tag:'KE-004', name:'Chui',    breed:'Ankole',     sex:'M', zone:'Beta',  stage:'Growing',   color:'#ff9044',
    purchaseWeight:210, currentWeight:318, targetWeight:420, daysOnFarm:152,
    purchaseCost:79000, feedCost:40018, vetCost:7062,
    monthlyWeights:[210,238,262,284,302,318],
    notes:'Slightly behind target gain. Adjusted ration.',
  },
  {
    id:5, tag:'KE-005', name:'Tembo',   breed:'Friesian X', sex:'M', zone:'Alpha', stage:'Finishing', color:'#ffc130',
    purchaseWeight:265, currentWeight:382, targetWeight:440, daysOnFarm:152,
    purchaseCost:106000, feedCost:49096, vetCost:8664,
    monthlyWeights:[265,294,320,344,364,382],
    notes:'Premium marbling developing well.',
  },
  {
    id:6, tag:'KE-006', name:'Nyati',   breed:'Boran',      sex:'M', zone:'Beta',  stage:'Finishing', color:'#ff6eb4',
    purchaseWeight:225, currentWeight:342, targetWeight:430, daysOnFarm:152,
    purchaseCost:90000, feedCost:40018, vetCost:7062,
    monthlyWeights:[225,255,282,306,325,342],
    notes:'On track. Minor lameness issue resolved.',
  },
  {
    id:7, tag:'KE-007', name:'Kifaru',  breed:'Sahiwal',    sex:'M', zone:'Gamma', stage:'Intake',    color:'#94a3b8',
    purchaseWeight:165, currentWeight:224, targetWeight:380, daysOnFarm:61,
    purchaseCost:66000, feedCost:15250, vetCost:2690,
    monthlyWeights:[0,0,0,165,195,224],
    notes:'New arrival. Completing 30-day quarantine.',
  },
  {
    id:8, tag:'KE-008', name:'Twiga',   breed:'Boran',      sex:'F', zone:'Gamma', stage:'Growing',   color:'#c77a40',
    purchaseWeight:190, currentWeight:256, targetWeight:360, daysOnFarm:91,
    purchaseCost:76000, feedCost:22750, vetCost:4013,
    monthlyWeights:[0,0,190,218,238,256],
    notes:'Recovering well. Ready for transfer to Beta.',
  },
  {
    id:9, tag:'KE-009', name:'Paka',    breed:'Ankole',     sex:'F', zone:'Beta',  stage:'Growing',   color:'#e879f9',
    purchaseWeight:195, currentWeight:300, targetWeight:400, daysOnFarm:152,
    purchaseCost:78000, feedCost:40018, vetCost:7062,
    monthlyWeights:[195,220,244,265,284,300],
    notes:'Steady growth. Female, targeting heifer market.',
  },
  {
    id:10, tag:'KE-010', name:'Sungura', breed:'Friesian X', sex:'M', zone:'Alpha', stage:'Ready',    color:'#fb923c',
    purchaseWeight:320, currentWeight:438, targetWeight:450, daysOnFarm:152,
    purchaseCost:128000, feedCost:49096, vetCost:8664,
    monthlyWeights:[320,348,373,398,420,438],
    notes:'Premium grade. Sale agreed with Nairobi buyer.',
  },
]

// ── Aggregate Metrics ─────────────────────────────────────────
const TOTAL_INVESTED = COWS.reduce((s, c) => s + c.purchaseCost + c.feedCost + c.vetCost, 0)
const TOTAL_PROJECTED = COWS.reduce((s, c) => s + c.targetWeight * MARKET_PRICE, 0)
const TOTAL_PROFIT = TOTAL_PROJECTED - TOTAL_INVESTED
const READY_COUNT = COWS.filter(c => c.stage === 'Ready').length
const _nonReady = COWS.filter(c => c.stage !== 'Ready')
const AVG_DAYS_TO_MARKET = Math.round(
  _nonReady.reduce((s, c) => {
    const rate = (c.currentWeight - c.purchaseWeight) / c.daysOnFarm
    return s + (rate > 0 ? (c.targetWeight - c.currentWeight) / rate : 60)
  }, 0) / (_nonReady.length || 1)
)

// Monthly operating costs (KES) – purchases absorbed into Oct
const MONTHLY_COSTS = [82000, 83000, 90000, 98000, 98000, 98000]
// Farm portfolio value each month (sum of live weights × MARKET_PRICE)
const MONTHLY_VALUES = [811000, 907000, 1067000, 1236000, 1327000, 1409000]

// ── Helpers ───────────────────────────────────────────────────
const fmtK = (n: number) =>
  n >= 1_000_000 ? `${(n / 1_000_000).toFixed(2)}M` : `${(n / 1000).toFixed(0)}K`

function adg(c: Cow) {
  return ((c.currentWeight - c.purchaseWeight) / c.daysOnFarm)
}

function daysToMarket(c: Cow) {
  const remaining = c.targetWeight - c.currentWeight
  const rate = adg(c)
  return rate > 0 ? Math.round(remaining / rate) : 0
}

function projProfit(c: Cow) {
  const totalCost = c.purchaseCost + c.feedCost + c.vetCost
  const futureOps = daysToMarket(c) * (c.zone === 'Alpha' ? 380 : c.zone === 'Beta' ? 310 : 250)
  return c.targetWeight * MARKET_PRICE - totalCost - futureOps
}

function weightPct(c: Cow) {
  return Math.min(((c.currentWeight - c.purchaseWeight) / (c.targetWeight - c.purchaseWeight)) * 100, 100)
}

function weeklyWeights(monthly: number[]): number[] {
  const valid = monthly.map((v, i) => ({ v, i })).filter(p => p.v > 0)
  if (valid.length < 2) return valid.map(p => p.v)
  const pts: number[] = []
  for (let i = 0; i < valid.length - 1; i++) {
    const a = valid[i].v, b = valid[i + 1].v
    pts.push(a, Math.round(a + (b - a) / 3), Math.round(a + (b - a) * 2 / 3), Math.round(a + (b - a) * 0.88))
  }
  pts.push(valid[valid.length - 1].v)
  return pts
}

// ── SVG Charts ────────────────────────────────────────────────
function smoothD(pts: { x: number; y: number }[]) {
  return pts.map((p, i) => {
    if (i === 0) return `M ${p.x.toFixed(1)} ${p.y.toFixed(1)}`
    const prev = pts[i - 1]
    const cx = ((prev.x + p.x) / 2).toFixed(1)
    return `C ${cx} ${prev.y.toFixed(1)} ${cx} ${p.y.toFixed(1)} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`
  }).join(' ')
}

interface LineChartProps {
  data: number[]; labels: string[]; color: string; target?: number
  width: number; height: number; showArea?: boolean
}
function LineChart({ data, labels, color, target, width, height, showArea }: LineChartProps) {
  const pad = { t: 16, r: 12, b: 28, l: 44 }
  const cw = width - pad.l - pad.r
  const ch = height - pad.t - pad.b
  const min = Math.min(...data) - 10
  const max = target ? Math.max(...data, target) + 20 : Math.max(...data) + 20
  const xi = (i: number) => pad.l + (i / (data.length - 1)) * cw
  const yi = (v: number) => pad.t + ch - ((v - min) / (max - min)) * ch
  const pts = data.map((v, i) => ({ x: xi(i), y: yi(v) }))
  const d = smoothD(pts)
  const areaD = `${d} L ${pts[pts.length-1].x} ${pad.t + ch} L ${pts[0].x} ${pad.t + ch} Z`
  const yTicks = [min + (max-min)*0.25, min + (max-min)*0.5, min + (max-min)*0.75]

  return (
    <svg width={width} height={height} style={{ overflow: 'visible' }}>
      {/* Y grid + labels */}
      {yTicks.map((v, i) => (
        <g key={i}>
          <line x1={pad.l} x2={pad.l + cw} y1={yi(v)} y2={yi(v)} stroke="#252d40" strokeWidth={1} strokeDasharray="3 3" />
          <text x={pad.l - 6} y={yi(v) + 4} textAnchor="end" fontSize={9} fill="#5a6a90">{Math.round(v)}</text>
        </g>
      ))}
      {/* Target weight dashed line */}
      {target && (
        <line x1={pad.l} x2={pad.l + cw} y1={yi(target)} y2={yi(target)} stroke={color + '60'} strokeWidth={1} strokeDasharray="5 3" />
      )}
      {/* Area */}
      {showArea && <path d={areaD} fill={`url(#ag-${color.replace('#','')})`} opacity={0.25} />}
      <defs>
        <linearGradient id={`ag-${color.replace('#','')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.7} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      {/* Line */}
      <path d={d} fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" />
      {/* Points */}
      {pts.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={4} fill="var(--surface)" stroke={color} strokeWidth={2} />
      ))}
      {/* X labels */}
      {labels.map((l, i) => (
        <text key={i} x={xi(i)} y={height - 4} textAnchor="middle" fontSize={9} fill="#5a6a90">{l}</text>
      ))}
    </svg>
  )
}

interface BarChartProps { costs: number[]; values: number[]; labels: string[]; width: number; height: number }
function BarChart({ costs, values, labels, width, height }: BarChartProps) {
  const pad = { t: 12, r: 10, b: 26, l: 48 }
  const cw = width - pad.l - pad.r
  const ch = height - pad.t - pad.b
  const n = costs.length
  const maxVal = Math.max(...costs, ...values) * 1.1
  const barW = (cw / n) * 0.35
  const gap   = cw / n
  const yi = (v: number) => pad.t + ch - (v / maxVal) * ch

  return (
    <svg width={width} height={height}>
      {/* Y grid */}
      {[0.25, 0.5, 0.75, 1].map(t => (
        <g key={t}>
          <line x1={pad.l} x2={pad.l+cw} y1={yi(maxVal*t)} y2={yi(maxVal*t)} stroke="#252d40" strokeWidth={1} strokeDasharray="3 3" />
          <text x={pad.l-6} y={yi(maxVal*t)+4} textAnchor="end" fontSize={9} fill="#5a6a90">{fmtK(maxVal*t)}</text>
        </g>
      ))}
      {/* X axis */}
      <line x1={pad.l} x2={pad.l+cw} y1={pad.t+ch} y2={pad.t+ch} stroke="#252d40" />
      {costs.map((c, i) => {
        const cx = pad.l + gap * i + gap / 2
        return (
          <g key={i}>
            {/* Cost bar */}
            <rect x={cx - barW - 2} y={yi(c)} width={barW} height={pad.t+ch - yi(c)}
              rx={3} fill="#38d4ff44" stroke="#38d4ff66" strokeWidth={1} />
            {/* Value bar */}
            <rect x={cx + 2} y={yi(values[i])} width={barW} height={pad.t+ch - yi(values[i])}
              rx={3} fill="#00e5a044" stroke="#00e5a066" strokeWidth={1} />
            {/* Label */}
            <text x={cx} y={height - 4} textAnchor="middle" fontSize={9} fill="#5a6a90">{labels[i]}</text>
          </g>
        )
      })}
      {/* Legend */}
      <rect x={pad.l} y={4} width={8} height={8} rx={2} fill="#38d4ff44" stroke="#38d4ff66" />
      <text x={pad.l+11} y={11} fontSize={9} fill="#5a6a90">Ops Cost</text>
      <rect x={pad.l+62} y={4} width={8} height={8} rx={2} fill="#00e5a044" stroke="#00e5a066" />
      <text x={pad.l+73} y={11} fontSize={9} fill="#5a6a90">Farm Value ÷10</text>
    </svg>
  )
}

// ── Sub-components ─────────────────────────────────────────────
function StagePips({ stage }: { stage: Stage }) {
  return (
    <div style={{ display: 'flex', gap: 3 }}>
      {(['Intake','Growing','Finishing','Ready'] as Stage[]).map(s => {
        const filled = STAGE_META[stage].step >= STAGE_META[s].step
        return <div key={s} style={{ width: 6, height: 6, borderRadius: '50%', background: filled ? STAGE_META[stage].color : 'var(--surface-3)', border: `1px solid ${filled ? STAGE_META[stage].color : '#252d40'}` }} />
      })}
    </div>
  )
}

function KpiCard({ label, value, sub, color, icon }: { label: string; value: string; sub?: string; color: string; icon: string }) {
  return (
    <div style={{
      flex: 1, padding: '10px 12px', borderRadius: 12,
      background: `${color}0f`, border: `1px solid ${color}28`,
      display: 'flex', flexDirection: 'column', gap: 2,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
        <span style={{ fontSize: 13 }}>{icon}</span>
        <span style={{ fontFamily: 'var(--font-body)', fontSize: 10, color: 'var(--text-muted)' }}>{label}</span>
      </div>
      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, color, lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontFamily: 'var(--font-body)', fontSize: 10, color: 'var(--text-muted)' }}>{sub}</div>}
    </div>
  )
}

// ── Cow List Row ───────────────────────────────────────────────
function CowRow({ cow, selected, onSelect }: { cow: Cow; selected: boolean; onSelect: () => void }) {
  const pct = weightPct(cow)
  const sc = STAGE_META[cow.stage].color
  const zc = ZONE_META[cow.zone].color
  return (
    <motion.div
      onClick={onSelect}
      whileTap={{ scale: 0.98 }}
      style={{
        padding: '7px 10px', borderRadius: 10, cursor: 'pointer',
        background: selected ? `${cow.color}14` : 'transparent',
        border: `1px solid ${selected ? cow.color + '50' : 'transparent'}`,
        marginBottom: 3, transition: 'all 0.15s',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
        {/* Stage dot */}
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: sc, boxShadow: `0 0 6px ${sc}`, flexShrink: 0 }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 11, color: 'var(--text)' }}>{cow.tag}</span>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--text-muted)' }}>{cow.name}</span>
              <span style={{ fontSize: 9, padding: '1px 5px', borderRadius: 4, background: `${zc}20`, border: `1px solid ${zc}40`, color: zc, fontFamily: 'var(--font-display)', fontWeight: 700 }}>{cow.zone}</span>
            </div>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 10, color: sc }}>{cow.currentWeight}kg</span>
          </div>
          {/* Weight progress bar */}
          <div style={{ marginTop: 4, height: 3, borderRadius: 2, background: 'var(--surface-3)', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${pct}%`, background: `linear-gradient(90deg, ${sc}80, ${sc})`, borderRadius: 2, transition: 'width 0.4s' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 2 }}>
            <StagePips stage={cow.stage} />
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 9, color: 'var(--text-muted)' }}>{Math.round(pct)}% to market</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// ── Detail Panel ───────────────────────────────────────────────
function CowDetail({ cow }: { cow: Cow }) {
  const [view, setView] = useState<'month' | 'week'>('month')
  const sc = STAGE_META[cow.stage].color
  const zc = ZONE_META[cow.zone].color
  const totalCost = cow.purchaseCost + cow.feedCost + cow.vetCost
  const profit = projProfit(cow)
  const dtm = daysToMarket(cow)
  const wData = view === 'month'
    ? cow.monthlyWeights.filter(v => v > 0)
    : weeklyWeights(cow.monthlyWeights)
  const validMonths = cow.monthlyWeights.map((v, i) => v > 0 ? MONTHS[i] : null).filter(Boolean) as string[]
  const wLabels = view === 'month'
    ? validMonths
    : wData.map((_, i) => `W${i + 1}`)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Cow profile strip */}
      <div style={{
        padding: '10px 14px', borderBottom: '1px solid var(--border)',
        background: `linear-gradient(90deg, ${cow.color}12, transparent)`,
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 42, height: 42, borderRadius: 12, background: `${cow.color}20`, border: `1.5px solid ${cow.color}50`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>🐄</div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, color: cow.color }}>{cow.tag}</span>
              <span style={{ fontFamily: 'var(--font-body)', fontWeight: 800, fontSize: 14, color: 'var(--text)' }}>{cow.name}</span>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--text-muted)' }}>{cow.breed} · {cow.sex === 'M' ? '♂' : '♀'}</span>
              <span style={{ fontSize: 9, padding: '2px 7px', borderRadius: 5, background: `${zc}20`, border: `1px solid ${zc}40`, color: zc, fontFamily: 'var(--font-display)', fontWeight: 700 }}>
                {ZONE_META[cow.zone].label}
              </span>
              <span style={{ fontSize: 9, padding: '2px 7px', borderRadius: 5, background: `${sc}20`, border: `1px solid ${sc}40`, color: sc, fontFamily: 'var(--font-display)', fontWeight: 700 }}>
                {cow.stage}
              </span>
            </div>
            <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ flex: 1, height: 5, borderRadius: 3, background: 'var(--surface-3)', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${weightPct(cow)}%`, background: `linear-gradient(90deg, ${sc}80, ${sc})`, borderRadius: 3 }} />
              </div>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 10, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                {cow.currentWeight}kg / {cow.targetWeight}kg
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Two-column content */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Left: costs */}
        <div style={{ width: 210, padding: '12px 14px', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 8, flexShrink: 0 }}>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.08em' }}>COST BREAKDOWN</span>
          {[
            { label: 'Purchase', value: cow.purchaseCost, color: '#6b7a9e' },
            { label: 'Feed',     value: cow.feedCost,     color: '#38d4ff' },
            { label: 'Vet / Misc', value: cow.vetCost,   color: '#ffc130' },
          ].map(({ label, value, color }) => (
            <div key={label}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--text-muted)' }}>{label}</span>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 700, color }}>KES {value.toLocaleString()}</span>
              </div>
              <div style={{ height: 3, borderRadius: 2, background: 'var(--surface-3)', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${(value / totalCost) * 100}%`, background: color, borderRadius: 2 }} />
              </div>
            </div>
          ))}
          <div style={{ height: 1, background: 'var(--border)', marginBlock: 2 }} />
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--text-muted)' }}>Total Invested</span>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 700, color: 'var(--text)' }}>KES {totalCost.toLocaleString()}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--text-muted)' }}>Target Revenue</span>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 700, color: '#00e5a0' }}>KES {(cow.targetWeight * MARKET_PRICE).toLocaleString()}</span>
          </div>

          <div style={{ padding: '8px 10px', borderRadius: 10, background: profit >= 0 ? '#00e5a012' : '#ef444412', border: `1px solid ${profit >= 0 ? '#00e5a030' : '#ef444430'}` }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--text-muted)' }}>Expected Profit</span>
              {profit >= 0 ? <TrendingUp size={12} color="#00e5a0" /> : <TrendingDown size={12} color="#ef4444" />}
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, color: profit >= 0 ? '#00e5a0' : '#ef4444', marginTop: 2 }}>
              {profit >= 0 ? '+' : ''}KES {Math.abs(profit).toLocaleString()}
            </div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 10, color: 'var(--text-muted)' }}>
              {((profit / totalCost) * 100).toFixed(1)}% ROI · {cow.daysOnFarm}d on farm
            </div>
          </div>

          <div style={{ padding: '8px 10px', borderRadius: 10, background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 10, color: 'var(--text-muted)' }}>Days to market</div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20, color: '#ffc130' }}>{dtm === 0 ? '🟢 Ready' : `~${dtm}d`}</div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>
              ADG: {adg(cow).toFixed(2)} kg/day · {cow.notes}
            </div>
          </div>
        </div>

        {/* Right: weight chart */}
        <div style={{ flex: 1, padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.08em' }}>WEIGHT HISTORY</span>
            <div style={{ display: 'flex', borderRadius: 8, overflow: 'hidden', border: '1px solid var(--border)' }}>
              {(['month', 'week'] as const).map(v => (
                <button key={v} onClick={() => setView(v)}
                  style={{ padding: '4px 12px', cursor: 'pointer', border: 'none', fontFamily: 'var(--font-display)', fontSize: 9, fontWeight: 700, background: view === v ? cow.color : 'var(--surface-2)', color: view === v ? '#000' : 'var(--text-muted)', transition: 'all 0.15s', textTransform: 'capitalize' }}>
                  {v}
                </button>
              ))}
            </div>
          </div>
          <LineChart
            data={wData} labels={wLabels} color={cow.color} target={cow.targetWeight}
            width={302} height={240} showArea
          />
          <div style={{ display: 'flex', gap: 8 }}>
            <div style={{ flex: 1, padding: '6px 10px', borderRadius: 8, background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 9, color: 'var(--text-muted)' }}>Current</div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, color: cow.color }}>{cow.currentWeight} kg</div>
            </div>
            <div style={{ flex: 1, padding: '6px 10px', borderRadius: 8, background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 9, color: 'var(--text-muted)' }}>Target</div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, color: `${cow.color}88` }}>{cow.targetWeight} kg</div>
            </div>
            <div style={{ flex: 1, padding: '6px 10px', borderRadius: 8, background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 9, color: 'var(--text-muted)' }}>Gained</div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, color: '#00e5a0' }}>+{cow.currentWeight - cow.purchaseWeight} kg</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Overview Panel ─────────────────────────────────────────────
function Overview({ onSelect }: { onSelect: (c: Cow) => void }) {
  const [sel, setSel] = useState<number | null>(null)
  const select = (c: Cow) => { setSel(c.id); onSelect(c) }

  return (
    <div style={{ display: 'flex', height: '100%' }}>
      {/* Left: cow list */}
      <div style={{ width: 258, borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        <div style={{ padding: '8px 10px 4px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border)' }}>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.08em' }}>HERD · {COWS.length} HEAD</span>
          <div style={{ display: 'flex', gap: 4 }}>
            {(['Alpha','Beta','Gamma'] as Zone[]).map(z => (
              <span key={z} style={{ fontSize: 8, padding: '1px 5px', borderRadius: 4, background: `${ZONE_META[z].color}18`, color: ZONE_META[z].color, fontFamily: 'var(--font-display)', fontWeight: 700 }}>{z}</span>
            ))}
          </div>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '6px 8px' }}>
          {COWS.map(c => (
            <CowRow key={c.id} cow={c} selected={sel === c.id} onSelect={() => select(c)} />
          ))}
        </div>
      </div>

      {/* Right: KPIs + chart */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '10px 14px', gap: 10 }}>
        {/* KPI cards */}
        <div style={{ display: 'flex', gap: 8 }}>
          <KpiCard icon="🐄" label="Total Herd"        value={`${COWS.length}`}           sub={`${READY_COUNT} ready for market`} color="#00e5a0" />
          <KpiCard icon="💰" label="Total Invested"    value={`KES ${fmtK(TOTAL_INVESTED)}`} sub="Purchases + operating costs"     color="#38d4ff" />
          <KpiCard icon="📈" label="Projected Profit"  value={`+KES ${fmtK(TOTAL_PROFIT)}`} sub={`${((TOTAL_PROFIT/TOTAL_INVESTED)*100).toFixed(0)}% ROI`} color="#00e5a0" />
          <KpiCard icon="⏱" label="Avg Days to Market" value={`${AVG_DAYS_TO_MARKET}d`}    sub="For non-ready herd"              color="#ffc130" />
        </div>

        {/* Zone summary row */}
        <div style={{ display: 'flex', gap: 6 }}>
          {(['Alpha','Beta','Gamma'] as Zone[]).map(z => {
            const cows = COWS.filter(c => c.zone === z)
            const zc = ZONE_META[z].color
            return (
              <div key={z} style={{ flex: 1, padding: '7px 10px', borderRadius: 10, background: `${zc}0f`, border: `1px solid ${zc}28` }}>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 11, color: zc }}>{ZONE_META[z].label}</div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: 10, color: 'var(--text-muted)' }}>{ZONE_META[z].desc}</div>
                <div style={{ marginTop: 5, display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                  {cows.map(c => (
                    <motion.button key={c.id} whileTap={{ scale: 0.9 }} onClick={() => select(c)}
                      style={{ padding: '2px 7px', borderRadius: 6, background: `${c.color}20`, border: `1px solid ${c.color}40`, cursor: 'pointer', fontFamily: 'var(--font-display)', fontSize: 9, fontWeight: 700, color: c.color }}>
                      {c.name}
                    </motion.button>
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        {/* Chart */}
        <div style={{ flex: 1 }}>
          <div style={{ marginBottom: 4, fontFamily: 'var(--font-display)', fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.08em' }}>MONTHLY OPS COST vs FARM VALUE ÷10</div>
          <BarChart
            costs={MONTHLY_COSTS}
            values={MONTHLY_VALUES.map(v => v / 10)}
            labels={MONTHS}
            width={520} height={158}
          />
        </div>
      </div>
    </div>
  )
}

// ── Main Component ─────────────────────────────────────────────
export default function Livestock() {
  const [selectedCow, setSelectedCow] = useState<Cow | null>(null)

  return (
    <motion.div
      style={{ width: 800, height: 480, background: 'var(--bg)', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
    >
      {/* Ambient */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'radial-gradient(ellipse 600px 300px at 30% 50%, #00e5a008 0%, transparent 60%), radial-gradient(ellipse 400px 300px at 80% 30%, #fbbf2408 0%, transparent 60%)' }} />

      {/* Header */}
      <div style={{ position: 'relative', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderBottom: '1px solid var(--border)', background: 'var(--surface)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <BackButton />
          {selectedCow && (
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setSelectedCow(null)}
              style={{ width: 32, height: 32, borderRadius: 9, background: 'var(--surface-2)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-muted)' }}
            >
              <ChevronLeft size={18} />
            </motion.button>
          )}
          <div style={{ width: 32, height: 32, borderRadius: 10, background: 'linear-gradient(135deg, #00e5a0, #fbbf24)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, boxShadow: '0 4px 12px #00e5a030' }}>🐄</div>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, color: 'var(--text)', lineHeight: 1 }}>
              {selectedCow ? `${selectedCow.tag} · ${selectedCow.name}` : 'Livestock Tracker'}
            </div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 10, color: 'var(--text-muted)', marginTop: 1 }}>
              {selectedCow ? `${selectedCow.breed} · ${ZONE_META[selectedCow.zone].label}` : 'Fattening & profit analysis'}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <div style={{ padding: '4px 10px', borderRadius: 8, background: '#00e5a015', border: '1px solid #00e5a030' }}>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 10, color: '#00e5a0' }}>
              +KES {fmtK(TOTAL_PROFIT)} projected
            </span>
          </div>
          <div style={{ display: 'flex', gap: 3, alignItems: 'center' }}>
            {COWS.filter(c => c.stage === 'Ready').map(c => (
              <div key={c.id} title={c.name} style={{ width: 8, height: 8, borderRadius: '50%', background: '#00e5a0', boxShadow: '0 0 6px #00e5a0' }} />
            ))}
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 10, color: 'var(--text-muted)', marginLeft: 3 }}>{READY_COUNT} ready</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, position: 'relative', zIndex: 10, overflow: 'hidden' }}>
        <AnimatePresence mode="wait">
          {selectedCow ? (
            <motion.div key={selectedCow.id} style={{ height: '100%' }}
              initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
              <CowDetail cow={selectedCow} />
            </motion.div>
          ) : (
            <motion.div key="overview" style={{ height: '100%' }}
              initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 30 }}>
              <Overview onSelect={setSelectedCow} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
