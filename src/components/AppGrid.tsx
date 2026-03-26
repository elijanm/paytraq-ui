import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence, useMotionValue, animate } from 'framer-motion'
import { useAdminStore } from '../store/adminStore'
import {
  ShoppingCart, Wind, Circle, Droplets, Scale, LayoutGrid,
  Wifi, WifiOff, BatteryLow, BatteryMedium, BatteryFull, BatteryCharging,
  ChevronLeft, ChevronRight, Sprout, Headphones,
  type LucideIcon,
} from 'lucide-react'
import StatusMenu from './StatusMenu'

interface AppDef {
  name: string; label: string; sub: string
  icon: LucideIcon; route: string
  accent: string; dark: string; shadow: string
}

const APPS: AppDef[] = [
  // Page 1
  { name: 'Vending',         label: 'Vending',    sub: 'Snacks & drinks',    icon: ShoppingCart, route: '/vending',   accent: '#00e5a0', dark: '#00875f', shadow: '#00e5a060' },
  { name: 'WashingMachine',  label: 'Washing',    sub: 'Washer & dryer',     icon: Wind,         route: '/washing',   accent: '#38d4ff', dark: '#0284a8', shadow: '#38d4ff60' },
  { name: 'PoolTable',       label: 'Pool Table', sub: 'Book your game',     icon: Circle,       route: '/pool',      accent: '#b48aff', dark: '#6d28d9', shadow: '#b48aff60' },
  { name: 'LiquidDispenser', label: 'Liquid',     sub: 'Water, juice, milk', icon: Droplets,     route: '/liquid',    accent: '#ff9044', dark: '#c2410c', shadow: '#ff904460' },
  // Page 2
  { name: 'WarehouseWeight', label: 'Warehouse',  sub: 'Track n Trace',      icon: Scale,        route: '/warehouse', accent: '#ffc130', dark: '#b45309', shadow: '#ffc13060' },
  { name: 'SoilAnalytics',   label: 'Soil Data',  sub: 'Field analytics',    icon: Sprout,       route: '/soil',      accent: '#4ade80', dark: '#166534', shadow: '#4ade8060' },
  { name: 'Addons',          label: 'Addons',     sub: 'More services',      icon: LayoutGrid,   route: '/addons',    accent: '#ff6eb4', dark: '#9d174d', shadow: '#ff6eb460' },
  { name: 'Support',         label: 'Support',    sub: 'Ask anything',       icon: Headphones,   route: '/support',   accent: '#818cf8', dark: '#3730a3', shadow: '#818cf860' },
]

// ── Layout: HEADER(36) + GRID(434) + DOTS(10) = 480px ──
// Cards fill grid via 1fr rows/cols — no fixed pixel widths
const HEADER_H  = 36
const DOTS_H    = 10
const GRID_H    = 480 - HEADER_H - DOTS_H   // 434px
const PAD_H     = 40   // left/right padding (~5%)
const PAD_V     = 12   // top/bottom padding
const GRID_GAP  = 12

// Pages computed dynamically inside AppGrid to respect admin visibility config

// ── Battery hook ──────────────────────────────────────────────────────────────
interface BatteryState { level: number; charging: boolean }
function useBattery() {
  const [b, setB] = useState<BatteryState | null>(null)
  useEffect(() => {
    interface BM extends EventTarget { level: number; charging: boolean }
    const nav = navigator as Navigator & { getBattery?: () => Promise<BM> }
    if (!nav.getBattery) return
    nav.getBattery().then(bm => {
      const sync = () => setB({ level: bm.level, charging: bm.charging })
      sync()
      bm.addEventListener('levelchange', sync)
      bm.addEventListener('chargingchange', sync)
    }).catch(() => {})
  }, [])
  return b
}

// ── App Icon ──────────────────────────────────────────────────────────────────
function AppIcon({ name, Icon, size }: { name: string; Icon: LucideIcon; size: number }) {
  const [custom, setCustom] = useState(false)
  useEffect(() => {
    const img = new Image()
    img.onload = () => setCustom(true)
    img.onerror = () => setCustom(false)
    img.src = `/icons/${name}.png`
  }, [name])
  return custom
    ? <img src={`/icons/${name}.png`} alt={name} style={{ width: size, height: size, objectFit: 'contain' }} />
    : <Icon size={size} strokeWidth={1.4} />
}

// ── App Card ──────────────────────────────────────────────────────────────────
function AppCard({ app, index, pageIndex, onPress }: { app: AppDef; index: number; pageIndex: number; onPress: () => void }) {
  const [active, setActive] = useState(false)
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: pageIndex * 0.06 + (index % 4) * 0.05, type: 'spring', stiffness: 300, damping: 24 }}
      style={{ width: '100%', height: '100%', position: 'relative' }}
    >
      {/* Press glow */}
      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'absolute', inset: -6, borderRadius: 26, pointerEvents: 'none',
              background: `radial-gradient(ellipse at center, ${app.shadow} 0%, transparent 65%)` }}
          />
        )}
      </AnimatePresence>

      <motion.button
        onTapStart={() => setActive(true)}
        onTap={() => { setActive(false); onPress() }}
        onTapCancel={() => setActive(false)}
        onClick={onPress}
        whileTap={{ scale: 0.95 }}
        style={{
          width: '100%', height: '100%', borderRadius: 20, cursor: 'pointer',
          border: `1px solid ${active ? app.accent + '90' : app.accent + '25'}`,
          background: `
            radial-gradient(ellipse 130% 90% at 85% 0%, ${app.accent}20 0%, transparent 50%),
            linear-gradient(155deg, ${app.dark}20 0%, #0c0f18 70%)
          `,
          boxShadow: active
            ? `0 0 0 1px ${app.accent}35, 0 6px 28px ${app.shadow}, inset 0 1px 0 ${app.accent}35`
            : `inset 0 1px 0 ${app.accent}10`,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          padding: 0, position: 'relative', overflow: 'hidden',
          transition: 'border-color 0.12s, box-shadow 0.12s',
        }}
      >
        {/* Corner arc */}
        <div style={{ position: 'absolute', top: -40, right: -40, width: 130, height: 130, borderRadius: '50%', border: `1px solid ${app.accent}15`, pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: -20, right: -20, width: 80, height: 80, borderRadius: '50%', border: `1px solid ${app.accent}10`, pointerEvents: 'none' }} />
        {/* Accent dot */}
        <div style={{ position: 'absolute', top: 12, left: 12, width: 5, height: 5, borderRadius: '50%', background: app.accent, opacity: 0.6, boxShadow: `0 0 6px ${app.accent}` }} />

        {/* Icon */}
        <div style={{
          width: 64, height: 64, borderRadius: 18, flexShrink: 0, marginBottom: 12,
          background: `linear-gradient(145deg, ${app.accent}25, ${app.accent}08)`,
          border: `1.5px solid ${app.accent}30`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: app.accent,
          boxShadow: `0 4px 18px ${app.accent}20, inset 0 1px 0 ${app.accent}25`,
        }}>
          <AppIcon name={app.name} Icon={app.icon} size={30} />
        </div>

        {/* Text */}
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, color: 'var(--text)', letterSpacing: '0.04em', lineHeight: 1 }}>{app.label}</div>
        <div style={{ fontFamily: 'var(--font-body)', fontSize: 10, color: app.accent + 'bb', marginTop: 4, lineHeight: 1 }}>{app.sub}</div>

        {/* Arrow chip */}
        <div style={{ position: 'absolute', bottom: 10, right: 11, width: 20, height: 20, borderRadius: 7,
          background: `${app.accent}15`, border: `1px solid ${app.accent}30`,
          display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="7" height="7" viewBox="0 0 7 7" fill="none">
            <path d="M1.5 1l3 2.5-3 2.5" stroke={app.accent} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </motion.button>
    </motion.div>
  )
}

// Module-level: survives component unmount/remount so back-button restores the page
let _savedPage = 0

// ── App Grid ──────────────────────────────────────────────────────────────────
export default function AppGrid() {
  const navigate = useNavigate()
  const [page, setPage] = useState(_savedPage)
  const [online, setOnline] = useState(navigator.onLine)
  const [menuOpen, setMenuOpen] = useState(false)
  const battery = useBattery()
  const x = useMotionValue(-_savedPage * 800)

  const { singleAppMode, singleApp, visibleApps } = useAdminStore()

  // Single-app mode: skip the grid and jump straight to the configured app
  useEffect(() => {
    if (singleAppMode && singleApp) navigate(singleApp, { replace: true })
  }, [singleAppMode, singleApp, navigate])

  // Filter APPS to only those marked visible in admin config
  const VISIBLE_PAGES = [
    APPS.filter(a => visibleApps.includes(a.name)).slice(0, 4),
    APPS.filter(a => visibleApps.includes(a.name)).slice(4),
  ].filter(p => p.length > 0)

  useEffect(() => {
    const on = () => setOnline(true)
    const off = () => setOnline(false)
    window.addEventListener('online', on)
    window.addEventListener('offline', off)
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off) }
  }, [])

  const snapTo = (p: number) => {
    _savedPage = p
    setPage(p)
    animate(x, -p * 800, { type: 'spring', stiffness: 360, damping: 40 })
  }

  const TOTAL = VISIBLE_PAGES.length

  const handleDragEnd = (_: unknown, info: { offset: { x: number } }) => {
    if (info.offset.x < -60 && page < TOTAL - 1) snapTo(page + 1)
    else if (info.offset.x > 60 && page > 0) snapTo(page - 1)
    else snapTo(page)
  }

  function BatteryIcon() {
    if (!battery) return null
    if (battery.charging)    return <BatteryCharging size={12} strokeWidth={1.5} color="#00e5a0" />
    if (battery.level > 0.7) return <BatteryFull     size={12} strokeWidth={1.5} color="#00e5a0" />
    if (battery.level > 0.3) return <BatteryMedium   size={12} strokeWidth={1.5} color="#ffc130" />
    return                          <BatteryLow       size={12} strokeWidth={1.5} color="#ff6060" />
  }

  return (
    // Outer: exactly 800×480, column flex, overflow:hidden — nothing can escape
    <div style={{ width: 800, height: 480, background: 'var(--bg)', display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>

      {/* Status menu overlay */}
      <AnimatePresence>
        {menuOpen && <StatusMenu online={online} onClose={() => setMenuOpen(false)} />}
      </AnimatePresence>

      {/* Ambient background */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse 700px 400px at 30% 50%, #00e5a005 0%, transparent 60%), radial-gradient(ellipse 500px 350px at 80% 60%, #b48aff05 0%, transparent 60%)' }} />

      {/* ── Fixed header bar: logo left · wifi+battery+nav right ── */}
      <div style={{
        height: HEADER_H, flexShrink: 0, zIndex: 20,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 14px',
        background: '#080b12',
        borderBottom: '1px solid #181d28',
      }}>
        {/* Logo — click to open admin */}
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={() => navigate('/admin')}
          title="Admin panel"
          style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', cursor: 'pointer', padding: '2px 4px', borderRadius: 8 }}
        >
          <div style={{ width: 24, height: 24, borderRadius: 7, flexShrink: 0,
            background: 'linear-gradient(135deg, #00e5a0, #38d4ff)',
            boxShadow: '0 2px 10px #00e5a045',
            display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontFamily: 'Nunito, var(--font-body)', fontWeight: 900, fontSize: 13, color: '#000' }}>P</span>
          </div>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 12, color: 'var(--text)', letterSpacing: '0.1em' }}>PAYTRAQ</span>
        </motion.button>

        {/* Right: clickable status chip + page nav */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Wifi+battery chip — opens StatusMenu on click */}
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={() => setMenuOpen(v => !v)}
            style={{
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '3px 8px', borderRadius: 8, cursor: 'pointer',
              background: menuOpen ? 'var(--surface-2)' : 'transparent',
              border: `1px solid ${menuOpen ? 'var(--border)' : 'transparent'}`,
            }}
          >
            {online ? <Wifi size={12} strokeWidth={1.5} color="#00e5a0" /> : <WifiOff size={12} strokeWidth={1.5} color="#ff6060" />}
            {battery && <span style={{ fontFamily: 'var(--font-body)', fontSize: 10, color: battery.level > 0.3 ? '#5a6a90' : '#ff6060' }}>{Math.round(battery.level * 100)}%</span>}
            <BatteryIcon />
          </motion.button>

          <div style={{ width: 1, height: 14, background: '#252d40' }} />

          <motion.button onClick={() => snapTo(page - 1)} disabled={page === 0} whileTap={{ scale: 0.85 }}
            style={{ width: 22, height: 22, borderRadius: 6, border: '1px solid var(--border)', padding: 0,
              background: page === 0 ? 'transparent' : 'var(--surface-2)',
              color: page === 0 ? '#252d40' : 'var(--text)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: page === 0 ? 'default' : 'pointer' }}>
            <ChevronLeft size={12} strokeWidth={2.5} />
          </motion.button>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: 10, color: '#5a6a90', minWidth: 16, textAlign: 'center' }}>{page + 1}/{TOTAL}</span>
          <motion.button onClick={() => snapTo(page + 1)} disabled={page === TOTAL - 1} whileTap={{ scale: 0.85 }}
            style={{ width: 22, height: 22, borderRadius: 6, border: '1px solid var(--border)', padding: 0,
              background: page === TOTAL - 1 ? 'transparent' : 'var(--surface-2)',
              color: page === TOTAL - 1 ? '#252d40' : 'var(--text)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: page === TOTAL - 1 ? 'default' : 'pointer' }}>
            <ChevronRight size={12} strokeWidth={2.5} />
          </motion.button>
        </div>
      </div>

      {/* ── Card area: fixed GRID_H, only this moves on swipe ── */}
      <div style={{ width: 800, height: GRID_H, flexShrink: 0, overflow: 'hidden', position: 'relative', zIndex: 10 }}>
        <motion.div
          drag="x"
          dragConstraints={{ left: -(TOTAL - 1) * 800, right: 0 }}
          dragElastic={0.1}
          onDragEnd={handleDragEnd}
          style={{ x, display: 'flex', width: TOTAL * 800, height: '100%' }}
        >
          {VISIBLE_PAGES.map((pageApps, pageIdx) => (
            <div key={pageIdx} style={{
              width: 800, height: '100%', flexShrink: 0, overflow: 'hidden',
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gridTemplateRows: 'repeat(2, 1fr)',
              gap: GRID_GAP,
              padding: `${PAD_V}px ${PAD_H}px`,
              boxSizing: 'border-box',
            }}>
              {pageApps.map((app, i) => (
                <AppCard key={app.name} app={app} index={i} pageIndex={pageIdx} onPress={() => navigate(app.route)} />
              ))}
            </div>
          ))}
        </motion.div>
      </div>

      {/* ── Dots: exactly DOTS_H px ── */}
      <div style={{ height: DOTS_H, flexShrink: 0, zIndex: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, background: '#080b12' }}>
        {VISIBLE_PAGES.map((_, i) => (
          <motion.button key={i} onClick={() => snapTo(i)}
            animate={{ width: i === page ? 18 : 6, background: i === page ? '#00e5a0' : '#252d40' }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            style={{ height: 4, borderRadius: 2, border: 'none', cursor: 'pointer', padding: 0 }}
          />
        ))}
      </div>
    </div>
  )
}
