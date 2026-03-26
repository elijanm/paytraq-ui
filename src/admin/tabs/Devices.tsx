import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, Cpu, Camera, Scale, Droplets, Wifi, WifiOff,
  RefreshCw, ChevronRight, AlertTriangle, X, Radio,
} from 'lucide-react'

// ── Device catalogue ──────────────────────────────────────────────────────────
interface DeviceSpec {
  id: string
  name: string
  model: string
  category: 'edge' | 'sensor' | 'camera' | 'relay'
  icon: typeof Cpu
  accent: string
  description: string
  modules: string[]    // which kiosk apps it pairs with
  protocol: string
}

const DEVICES: DeviceSpec[] = [
  {
    id: 'pool-master',
    name: 'Pool Master',
    model: 'PM-100',
    category: 'edge',
    icon: Cpu,
    accent: '#a78bfa',
    description: 'Edge controller for pool table management. Handles coin/payment relay, game timer, and table lock/unlock signals.',
    modules: ['Pool Table'],
    protocol: 'MQTT over Wi-Fi',
  },
  {
    id: 'vendit-manager',
    name: 'Vendit Manager',
    model: 'VM-200',
    category: 'relay',
    icon: Cpu,
    accent: '#22d3a5',
    description: 'Relay controller + volume tracker for vending dispensing. Controls solenoid valves, conveyors, and reports stock levels.',
    modules: ['Vending', 'Liquid Dispenser'],
    protocol: 'Serial / USB-HID',
  },
  {
    id: 'wash-controller',
    name: 'Wash Controller',
    model: 'WC-50',
    category: 'relay',
    icon: Cpu,
    accent: '#38bdf8',
    description: 'Relay board for washer/dryer control. Starts machine cycle on payment confirmation and reports cycle status.',
    modules: ['Washing Machine'],
    protocol: 'GPIO / RS-485',
  },
  {
    id: 'flow-sensor-v2',
    name: 'Flow Sensor',
    model: 'FS-V2',
    category: 'sensor',
    icon: Droplets,
    accent: '#fb923c',
    description: 'Hall-effect flow sensor for liquid dispenser. Measures dispensed volume in real-time and triggers cutoff.',
    modules: ['Liquid Dispenser'],
    protocol: 'GPIO Pulse',
  },
  {
    id: 'weight-node',
    name: 'Weight Node',
    model: 'WN-10',
    category: 'sensor',
    icon: Scale,
    accent: '#f59e0b',
    description: 'Load cell bridge + HX711 ADC for warehouse weight module. Supports up to 150 kg with 0.1 kg resolution.',
    modules: ['Warehouse Weight'],
    protocol: 'I²C / SPI',
  },
  {
    id: 'soil-probe-a',
    name: 'Soil Probe A',
    model: 'SP-A1',
    category: 'sensor',
    icon: Radio,
    accent: '#86efac',
    description: 'Multi-parameter soil probe: pH, moisture, nitrogen, temperature. LoRa-connected for field deployment.',
    modules: ['Soil Analytics'],
    protocol: 'LoRa 915 MHz',
  },
  {
    id: 'cam-entry',
    name: 'Entry Camera',
    model: 'CAM-USB2',
    category: 'camera',
    icon: Camera,
    accent: '#f472b6',
    description: 'USB UVC camera for age verification and facial liveness detection. Supports 720p @ 30 fps.',
    modules: ['Vending'],
    protocol: 'USB UVC',
  },
  {
    id: 'cam-overhead',
    name: 'Overhead Camera',
    model: 'CAM-IP4K',
    category: 'camera',
    icon: Camera,
    accent: '#f472b6',
    description: '4K IP camera for overhead surveillance and analytics. RTSP stream compatible with local NVR.',
    modules: ['All'],
    protocol: 'RTSP / PoE',
  },
]

const CATEGORY_LABELS: Record<DeviceSpec['category'], string> = {
  edge: 'Edge Device',
  sensor: 'Sensor',
  camera: 'Camera',
  relay: 'Relay Controller',
}

// ── Connection attempt modal ───────────────────────────────────────────────────
function ConnectModal({ device, onClose }: { device: DeviceSpec; onClose: () => void }) {
  const [phase, setPhase] = useState<'scanning' | 'out_of_range'>('scanning')

  useEffect(() => {
    const t = setTimeout(() => setPhase('out_of_range'), 2800)
    return () => clearTimeout(t)
  }, [])

  const Icon = device.icon

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.75)',
        zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center',
        backdropFilter: 'blur(4px)' }}
    >
      <motion.div
        initial={{ scale: 0.88, y: 16 }} animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.92, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 340, damping: 28 }}
        style={{ width: 300, borderRadius: 16, background: 'var(--surface)',
          border: '1px solid var(--border)', padding: '20px 22px',
          display: 'flex', flexDirection: 'column', gap: 16 }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: 10,
              background: device.accent + '20', border: `1px solid ${device.accent}40`,
              display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon size={16} color={device.accent} strokeWidth={1.5} />
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 12, color: 'var(--text)' }}>
                {device.name}
              </div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 9, color: 'var(--text-muted)' }}>
                {device.model} · {device.protocol}
              </div>
            </div>
          </div>
          <motion.button whileTap={{ scale: 0.9 }} onClick={onClose}
            style={{ width: 26, height: 26, borderRadius: 7, border: '1px solid var(--border)',
              background: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: 'var(--text-muted)' }}>
            <X size={12} strokeWidth={2} />
          </motion.button>
        </div>

        {/* Status */}
        <AnimatePresence mode="wait">
          {phase === 'scanning' && (
            <motion.div key="scanning"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, padding: '8px 0' }}
            >
              {/* Sonar rings */}
              <div style={{ position: 'relative', width: 64, height: 64,
                display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {[0, 1, 2].map(i => (
                  <motion.div key={i}
                    animate={{ scale: [1, 2.2], opacity: [0.5, 0] }}
                    transition={{ duration: 1.6, delay: i * 0.5, repeat: Infinity, ease: 'easeOut' }}
                    style={{ position: 'absolute', width: 24, height: 24, borderRadius: '50%',
                      border: `1.5px solid ${device.accent}` }}
                  />
                ))}
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}>
                  <Wifi size={20} color={device.accent} strokeWidth={1.5} />
                </motion.div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 12, color: device.accent, fontWeight: 700 }}>
                  Scanning…
                </div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: 10, color: 'var(--text-muted)', marginTop: 3 }}>
                  Looking for {device.name} via {device.protocol}
                </div>
              </div>
            </motion.div>
          )}

          {phase === 'out_of_range' && (
            <motion.div key="oor"
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: '8px 0' }}
            >
              <div style={{ width: 48, height: 48, borderRadius: '50%',
                background: '#ffc13015', border: '1px solid #ffc13040',
                display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <WifiOff size={22} color="#ffc130" strokeWidth={1.5} />
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 12, color: '#ffc130', fontWeight: 700, marginBottom: 4 }}>
                  Device Out of Range
                </div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: 10, color: 'var(--text-muted)', lineHeight: 1.5 }}>
                  Could not detect {device.name}.<br />
                  Ensure the device is powered on and within range.
                </div>
              </div>
              <div style={{ width: '100%', padding: '8px 10px', borderRadius: 8,
                background: '#ffc13010', border: '1px solid #ffc13025',
                display: 'flex', alignItems: 'center', gap: 7 }}>
                <AlertTriangle size={11} color="#ffc130" strokeWidth={2} />
                <span style={{ fontFamily: 'var(--font-body)', fontSize: 9, color: '#ffc130' }}>
                  Protocol: {device.protocol}
                </span>
              </div>
              <motion.button whileTap={{ scale: 0.96 }} onClick={onClose}
                style={{ width: '100%', padding: '9px', borderRadius: 10, cursor: 'pointer',
                  background: 'var(--surface-2)', border: '1px solid var(--border)',
                  fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 12, color: 'var(--text-muted)' }}>
                Dismiss
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  )
}

// ── Device card ───────────────────────────────────────────────────────────────
function DeviceCard({ device, onConnect }: { device: DeviceSpec; onConnect: () => void }) {
  const Icon = device.icon
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
      whileTap={{ scale: 0.985 }}
      style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px',
        borderRadius: 12, background: 'var(--surface-2)', border: '1px solid var(--border)',
        cursor: 'default' }}
    >
      {/* Icon */}
      <div style={{ width: 38, height: 38, borderRadius: 10, flexShrink: 0,
        background: device.accent + '18', border: `1px solid ${device.accent}35`,
        display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon size={18} color={device.accent} strokeWidth={1.5} />
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 11,
            color: 'var(--text)', lineHeight: 1 }}>{device.name}</span>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: 8, color: device.accent,
            background: device.accent + '18', padding: '1px 5px', borderRadius: 4 }}>
            {CATEGORY_LABELS[device.category]}
          </span>
        </div>
        <div style={{ fontFamily: 'var(--font-body)', fontSize: 9, color: 'var(--text-muted)',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: 3 }}>
          {device.description}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: 8, color: '#3a4560' }}>
            {device.model} · {device.protocol}
          </span>
          <span style={{ color: '#2a3045', fontSize: 8 }}>·</span>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: 8, color: '#3a4560' }}>
            {device.modules.join(', ')}
          </span>
        </div>
      </div>

      {/* Connect button */}
      <motion.button whileTap={{ scale: 0.92 }} onClick={onConnect}
        style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 5,
          padding: '6px 12px', borderRadius: 8, cursor: 'pointer',
          background: device.accent + '15', border: `1px solid ${device.accent}40`,
          color: device.accent, fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 10 }}>
        <ChevronRight size={11} strokeWidth={2.5} />
        Connect
      </motion.button>
    </motion.div>
  )
}

// ── Main Devices tab ──────────────────────────────────────────────────────────
const CATEGORIES: { key: DeviceSpec['category'] | 'all'; label: string }[] = [
  { key: 'all',    label: 'All' },
  { key: 'edge',   label: 'Edge' },
  { key: 'relay',  label: 'Relay' },
  { key: 'sensor', label: 'Sensors' },
  { key: 'camera', label: 'Cameras' },
]

export default function Devices() {
  const [query, setQuery]     = useState('')
  const [filter, setFilter]   = useState<DeviceSpec['category'] | 'all'>('all')
  const [scanning, setScanning] = useState(false)
  const [connecting, setConnecting] = useState<DeviceSpec | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const rescan = () => {
    setScanning(true)
    setTimeout(() => setScanning(false), 1400)
  }

  const filtered = DEVICES.filter(d => {
    const matchCat   = filter === 'all' || d.category === filter
    const q          = query.toLowerCase()
    const matchQuery = !q || d.name.toLowerCase().includes(q)
      || d.model.toLowerCase().includes(q)
      || d.description.toLowerCase().includes(q)
      || d.modules.some(m => m.toLowerCase().includes(q))
    return matchCat && matchQuery
  })

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>

      {/* Connect modal */}
      <AnimatePresence>
        {connecting && (
          <ConnectModal device={connecting} onClose={() => setConnecting(null)} />
        )}
      </AnimatePresence>

      {/* ── Toolbar ── */}
      <div style={{ padding: '10px 14px 8px', flexShrink: 0,
        borderBottom: '1px solid #111724', display: 'flex', alignItems: 'center', gap: 8 }}>

        {/* Search box */}
        <div style={{ flex: 1, position: 'relative' }}>
          <Search size={12} color="#3a4560" strokeWidth={2}
            style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search devices, models, modules…"
            style={{
              width: '100%', height: 30, paddingLeft: 28, paddingRight: 10,
              borderRadius: 8, border: '1px solid var(--border)',
              background: 'var(--surface-2)', color: 'var(--text)',
              fontFamily: 'var(--font-body)', fontSize: 11, outline: 'none',
              boxSizing: 'border-box',
            }}
          />
          {query && (
            <motion.button initial={{ scale: 0 }} animate={{ scale: 1 }}
              onClick={() => setQuery('')}
              style={{ position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)',
                width: 16, height: 16, borderRadius: '50%', border: 'none', cursor: 'pointer',
                background: '#2a3045', display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--text-muted)', padding: 0 }}>
              <X size={9} strokeWidth={2.5} />
            </motion.button>
          )}
        </div>

        {/* Rescan */}
        <motion.button whileTap={{ scale: 0.9 }} onClick={rescan}
          style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '0 10px', height: 30,
            borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface-2)',
            cursor: 'pointer', color: 'var(--text-muted)', flexShrink: 0 }}>
          <motion.div animate={scanning ? { rotate: 360 } : {}} transition={{ duration: 0.9, repeat: scanning ? Infinity : 0, ease: 'linear' }}>
            <RefreshCw size={11} strokeWidth={2} />
          </motion.div>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: 10 }}>Scan</span>
        </motion.button>
      </div>

      {/* ── Category filter strip ── */}
      <div style={{ display: 'flex', gap: 5, padding: '7px 14px 6px', flexShrink: 0,
        borderBottom: '1px solid #111724', overflowX: 'auto' }}>
        {CATEGORIES.map(c => (
          <motion.button key={c.key} whileTap={{ scale: 0.93 }} onClick={() => setFilter(c.key)}
            animate={{ background: filter === c.key ? '#00e5a018' : 'transparent',
              borderColor: filter === c.key ? '#00e5a040' : '#1e2333' }}
            style={{ padding: '3px 10px', borderRadius: 6, border: '1px solid', cursor: 'pointer', flexShrink: 0,
              color: filter === c.key ? '#00e5a0' : 'var(--text-muted)',
              fontFamily: 'var(--font-body)', fontSize: 9, fontWeight: filter === c.key ? 700 : 400 }}>
            {c.label}
            <span style={{ marginLeft: 4, fontFamily: 'var(--font-display)', fontSize: 8,
              color: filter === c.key ? '#00e5a080' : '#2a3045' }}>
              {c.key === 'all' ? DEVICES.length : DEVICES.filter(d => d.category === c.key).length}
            </span>
          </motion.button>
        ))}
      </div>

      {/* ── Device list ── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 14px 10px',
        display: 'flex', flexDirection: 'column', gap: 6,
        scrollbarWidth: 'none' }}>

        {filtered.length === 0 ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', gap: 10, opacity: 0.5 }}>
            <Search size={28} color="#3a4560" strokeWidth={1} />
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text-muted)' }}>
              No devices match "{query}"
            </span>
          </div>
        ) : (
          filtered.map((device, i) => (
            <motion.div key={device.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}>
              <DeviceCard device={device} onConnect={() => setConnecting(device)} />
            </motion.div>
          ))
        )}
      </div>

      {/* ── Footer status bar ── */}
      <div style={{ padding: '5px 14px', flexShrink: 0, borderTop: '1px solid #111724',
        display: 'flex', alignItems: 'center', gap: 6 }}>
        <div style={{ width: 5, height: 5, borderRadius: '50%', background: scanning ? '#ffc130' : '#2a3045',
          boxShadow: scanning ? '0 0 6px #ffc130' : 'none', transition: 'all 0.3s' }} />
        <span style={{ fontFamily: 'var(--font-body)', fontSize: 9, color: '#3a4560' }}>
          {scanning ? 'Scanning for devices…' : `${DEVICES.length} compatible devices · ${filtered.length} shown`}
        </span>
      </div>
    </div>
  )
}
