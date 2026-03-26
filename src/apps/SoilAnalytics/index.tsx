import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sprout, Droplets, Thermometer, FlaskConical, CloudRain, Wind, Sun, Cloud } from 'lucide-react'
import BackButton from '../../components/BackButton'

interface Zone {
  id: string; name: string; area: string
  ph: number; moisture: number; nitrogen: number; temp: number
  status: 'Optimal' | 'Low moisture' | 'Critical' | 'Excess N'
  color: string
}

const ZONES: Zone[] = [
  { id: 'A', name: 'Zone A', area: '2.4 ha', ph: 6.2, moisture: 67, nitrogen: 42, temp: 24.5, status: 'Optimal',      color: '#4ade80' },
  { id: 'B', name: 'Zone B', area: '1.8 ha', ph: 5.8, moisture: 45, nitrogen: 28, temp: 26.1, status: 'Low moisture', color: '#facc15' },
  { id: 'C', name: 'Zone C', area: '3.1 ha', ph: 7.1, moisture: 78, nitrogen: 55, temp: 22.8, status: 'Excess N',     color: '#fb923c' },
  { id: 'D', name: 'Zone D', area: '0.9 ha', ph: 5.2, moisture: 31, nitrogen: 18, temp: 28.3, status: 'Critical',     color: '#f87171' },
]

const STATUS_COLOR: Record<string, string> = {
  'Optimal':      '#4ade80',
  'Low moisture': '#facc15',
  'Excess N':     '#fb923c',
  'Critical':     '#f87171',
}

// Simulated 7-day rain forecast (mm)
const RAIN_DAYS: { day: string; mm: number; icon: string }[] = [
  { day: 'Mon', mm: 0,  icon: 'sun'   },
  { day: 'Tue', mm: 4,  icon: 'cloud' },
  { day: 'Wed', mm: 18, icon: 'rain'  },
  { day: 'Thu', mm: 22, icon: 'rain'  },
  { day: 'Fri', mm: 8,  icon: 'cloud' },
  { day: 'Sat', mm: 1,  icon: 'cloud' },
  { day: 'Sun', mm: 0,  icon: 'sun'   },
]
const MAX_MM = Math.max(...RAIN_DAYS.map(d => d.mm), 1)

function WeatherIcon({ type, size = 14, color = '#94a3b8' }: { type: string; size?: number; color?: string }) {
  if (type === 'sun')   return <Sun   size={size} color={color} strokeWidth={1.5} />
  if (type === 'rain')  return <CloudRain size={size} color={color} strokeWidth={1.5} />
  return                       <Cloud size={size} color={color} strokeWidth={1.5} />
}

function MetricBar({ label, value, max, unit, color, icon }: {
  label: string; value: number; max: number; unit: string; color: string; icon: React.ReactNode
}) {
  const pct = Math.min(100, (value / max) * 100)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#94a3b8', fontSize: 10, fontFamily: 'var(--font-body)' }}>
          {icon}
          {label}
        </div>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: 11, color, letterSpacing: '0.04em' }}>
          {value}<span style={{ fontSize: 9, color: '#64748b', marginLeft: 1 }}>{unit}</span>
        </span>
      </div>
      <div style={{ height: 5, borderRadius: 3, background: '#1e2333', overflow: 'hidden' }}>
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: pct / 100 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          style={{ height: '100%', borderRadius: 3, background: `linear-gradient(90deg, ${color}88, ${color})`, transformOrigin: 'left' }}
        />
      </div>
    </div>
  )
}

export default function SoilAnalytics() {
  const [selected, setSelected] = useState<Zone>(ZONES[0])
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 50)
    return () => clearTimeout(t)
  }, [])

  const zone = selected

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      style={{ width: 800, height: 480, background: 'var(--bg)', display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}
    >
      {/* Ambient glow */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse 600px 300px at 70% 50%, #4ade8008 0%, transparent 65%), radial-gradient(ellipse 400px 250px at 20% 80%, #22d3ee05 0%, transparent 60%)' }} />

      {/* Header */}
      <div style={{ height: 44, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 14px', background: '#080b12', borderBottom: '1px solid #181d28', zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <BackButton />
          <div style={{ width: 28, height: 28, borderRadius: 9, background: 'linear-gradient(135deg, #4ade80, #22d3ee)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 12px #4ade8040' }}>
            <Sprout size={15} color="#000" strokeWidth={2} />
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, color: 'var(--text)', letterSpacing: '0.06em' }}>SOIL ANALYTICS</div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 9, color: '#4ade80', marginTop: 1 }}>Live field data · {ZONES.length} zones monitored</div>
          </div>
        </div>
        {/* Weather strip */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '4px 12px', borderRadius: 10,
          background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <Sun size={12} color="#facc15" strokeWidth={1.5} />
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--text)' }}>27°C</span>
          </div>
          <div style={{ width: 1, height: 12, background: '#252d40' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <Droplets size={12} color="#38d4ff" strokeWidth={1.5} />
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--text-dim)' }}>62% RH</span>
          </div>
          <div style={{ width: 1, height: 12, background: '#252d40' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <Wind size={12} color="#94a3b8" strokeWidth={1.5} />
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--text-dim)' }}>12 km/h</span>
          </div>
        </div>
      </div>

      {/* Body */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* Left: Zone selector (220px) */}
        <div style={{ width: 220, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 0,
          borderRight: '1px solid #181d28', padding: '10px 10px', overflow: 'hidden' }}>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 9, color: '#5a6a90', letterSpacing: '0.12em',
            textTransform: 'uppercase', marginBottom: 8, paddingLeft: 2 }}>Select Field Zone</div>
          {ZONES.map((z, i) => {
            const active = z.id === zone.id
            return (
              <motion.button
                key={z.id}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: visible ? 1 : 0, x: visible ? 0 : -16 }}
                transition={{ delay: i * 0.07, duration: 0.35 }}
                onClick={() => setSelected(z)}
                whileTap={{ scale: 0.97 }}
                style={{
                  width: '100%', borderRadius: 12, padding: '10px 12px', marginBottom: 6,
                  border: `1px solid ${active ? z.color + '50' : '#1e2333'}`,
                  background: active ? `${z.color}12` : 'var(--surface)',
                  cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s',
                  boxShadow: active ? `0 2px 14px ${z.color}20` : 'none',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <div style={{ width: 7, height: 7, borderRadius: '50%', background: z.color, flexShrink: 0,
                      boxShadow: active ? `0 0 8px ${z.color}` : 'none' }} />
                    <span style={{ fontFamily: 'var(--font-display)', fontSize: 12, color: active ? z.color : 'var(--text)', fontWeight: 700 }}>{z.name}</span>
                  </div>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: 9, color: '#5a6a90' }}>{z.area}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: 9,
                    color: STATUS_COLOR[z.status], background: STATUS_COLOR[z.status] + '18',
                    padding: '2px 7px', borderRadius: 6 }}>{z.status}</span>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: 9, color: '#5a6a90' }}>pH {z.ph}</span>
                </div>
              </motion.button>
            )
          })}
        </div>

        {/* Right: Metrics + Rain (580px) */}
        <AnimatePresence mode="wait">
          <motion.div
            key={zone.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.28 }}
            style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '10px 14px', gap: 10, overflow: 'hidden' }}
          >
            {/* Zone title bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
              <div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, color: zone.color, letterSpacing: '0.05em', lineHeight: 1 }}>{zone.name}</div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: 10, color: '#5a6a90', marginTop: 3 }}>Area: {zone.area} · Status: <span style={{ color: STATUS_COLOR[zone.status] }}>{zone.status}</span></div>
              </div>
              <div style={{ padding: '5px 12px', borderRadius: 10, background: STATUS_COLOR[zone.status] + '18', border: `1px solid ${STATUS_COLOR[zone.status]}35` }}>
                <span style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 11, color: STATUS_COLOR[zone.status] }}>{zone.status}</span>
              </div>
            </div>

            {/* Metric cards row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, flexShrink: 0 }}>
              {[
                { label: 'Soil pH', value: zone.ph.toFixed(1), unit: '', color: '#a78bfa', hint: zone.ph < 6 ? 'Acidic' : zone.ph > 7 ? 'Alkaline' : 'Neutral', icon: <FlaskConical size={12} strokeWidth={1.5} /> },
                { label: 'Moisture', value: zone.moisture, unit: '%', color: '#38d4ff', hint: zone.moisture < 40 ? 'Needs water' : 'Good', icon: <Droplets size={12} strokeWidth={1.5} /> },
                { label: 'Nitrogen', value: zone.nitrogen, unit: 'ppm', color: '#4ade80', hint: zone.nitrogen > 50 ? 'Excess' : 'Normal', icon: <Sprout size={12} strokeWidth={1.5} /> },
                { label: 'Temp', value: zone.temp.toFixed(1), unit: '°C', color: '#fb923c', hint: zone.temp > 27 ? 'High' : 'Normal', icon: <Thermometer size={12} strokeWidth={1.5} /> },
              ].map(m => (
                <div key={m.label} style={{ borderRadius: 12, padding: '10px 10px', background: 'var(--surface)', border: `1px solid ${m.color}25`,
                  boxShadow: `0 2px 12px ${m.color}15` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: m.color, marginBottom: 6 }}>
                    {m.icon}
                    <span style={{ fontFamily: 'var(--font-body)', fontSize: 9, color: '#5a6a90' }}>{m.label}</span>
                  </div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, color: m.color, letterSpacing: '0.02em', lineHeight: 1 }}>
                    {m.value}<span style={{ fontSize: 10, color: m.color + '99', marginLeft: 2 }}>{m.unit}</span>
                  </div>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: 9, color: m.color + 'bb', marginTop: 4 }}>{m.hint}</div>
                </div>
              ))}
            </div>

            {/* Soil health bars */}
            <div style={{ borderRadius: 12, padding: '10px 12px', background: 'var(--surface)', border: '1px solid #1e2333', flexShrink: 0 }}>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 9, color: '#5a6a90', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>Health Indicators</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 16px' }}>
                <MetricBar label="Moisture" value={zone.moisture} max={100} unit="%" color="#38d4ff" icon={<Droplets size={10} strokeWidth={1.5} />} />
                <MetricBar label="Nitrogen" value={zone.nitrogen} max={80}  unit="ppm" color="#4ade80" icon={<Sprout size={10} strokeWidth={1.5} />} />
                <MetricBar label="pH Level" value={zone.ph} max={14} unit="" color="#a78bfa" icon={<FlaskConical size={10} strokeWidth={1.5} />} />
                <MetricBar label="Temp" value={zone.temp} max={40} unit="°C" color="#fb923c" icon={<Thermometer size={10} strokeWidth={1.5} />} />
              </div>
            </div>

            {/* 7-day rain prediction */}
            <div style={{ borderRadius: 12, padding: '10px 12px', background: 'var(--surface)', border: '1px solid #1e2333', flex: 1, overflow: 'hidden' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: 9, color: '#5a6a90', letterSpacing: '0.1em', textTransform: 'uppercase' }}>7-Day Rain Forecast</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <CloudRain size={10} color="#38d4ff" strokeWidth={1.5} />
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: 9, color: '#38d4ff' }}>
                    {RAIN_DAYS.reduce((s, d) => s + d.mm, 0)} mm total
                  </span>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 60 }}>
                {RAIN_DAYS.map((d, i) => (
                  <div key={d.day} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, height: '100%', justifyContent: 'flex-end' }}>
                    <span style={{ fontFamily: 'var(--font-body)', fontSize: 8, color: '#5a6a90' }}>{d.mm > 0 ? `${d.mm}` : ''}</span>
                    <motion.div
                      initial={{ scaleY: 0 }}
                      animate={{ scaleY: 1 }}
                      transition={{ delay: i * 0.06 + 0.3, duration: 0.5, ease: 'easeOut' }}
                      style={{ width: '100%', height: `${Math.max(4, (d.mm / MAX_MM) * 44)}px`,
                        borderRadius: '3px 3px 0 0', transformOrigin: 'bottom',
                        background: d.mm > 10 ? 'linear-gradient(180deg, #38d4ff, #38d4ff80)' : d.mm > 0 ? '#38d4ff50' : '#1e2333' }}
                    />
                    <WeatherIcon type={d.icon} size={10} color={d.icon === 'sun' ? '#facc15' : d.icon === 'rain' ? '#38d4ff' : '#64748b'} />
                    <span style={{ fontFamily: 'var(--font-body)', fontSize: 8, color: '#5a6a90' }}>{d.day}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
