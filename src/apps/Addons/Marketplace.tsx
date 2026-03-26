import { useState, useRef } from 'react'
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from 'framer-motion'
import { X, Tv, Beef, CheckCircle, Delete, ShieldCheck, Lock, Car, Snowflake, Zap, ChevronLeft, ChevronRight, type LucideIcon } from 'lucide-react'

interface MarketApp {
  id: string
  name: string
  tagline: string
  description: string
  icon: LucideIcon
  accent: string
  badge: string
  pin: string
  version: string
  size: string
}

const MARKET_APPS: MarketApp[] = [
  {
    id: 'aflabox',
    name: 'AflaBox',
    tagline: 'Grain Safety & Quality Testing',
    description: 'Accurate grain testing using UV imaging and AI to detect aflatoxin contamination, monitor and map contamination spread, and define nutritional quality profiles — ensuring grain safety from farm to market.',
    icon: Tv,
    accent: '#f59e0b',
    badge: 'AgriTech',
    pin: '8425',
    version: '2.4.1',
    size: '8 MB',
  },
  {
    id: 'livestock',
    name: 'Livestock',
    tagline: 'Fattening & Profit Tracker',
    description: 'Monitor cattle weight gain, track feed & vet costs, and get real-time profit projections. Zone-based herd management with ADG charts and market-readiness indicators per animal.',
    icon: Beef,
    accent: '#00e5a0',
    badge: 'Agriculture',
    pin: '1234',
    version: '1.2.0',
    size: '4 MB',
  },
  {
    id: 'kplc',
    name: 'KPLC Token',
    tagline: 'Prepaid Electricity Tokens',
    description: 'Purchase Kenya Power prepaid electricity tokens instantly via M-Pesa. Enter your meter number, select your amount, and receive your token immediately.',
    icon: Zap,
    accent: '#fbbf24',
    badge: 'Utility',
    pin: '1234',
    version: '1.0.3',
    size: '2 MB',
  },
  {
    id: 'lockers',
    name: 'Locker Rental',
    tagline: 'Smart Locker Assignment',
    description: 'Rent secure lockers by the hour or day. Select your duration, pay via M-Pesa, and receive a 4-digit access PIN. Lockers auto-release on expiry.',
    icon: Lock,
    accent: '#60a5fa',
    badge: 'Facility',
    pin: '1234',
    version: '1.1.0',
    size: '3 MB',
  },
  {
    id: 'parking',
    name: 'Parking',
    tagline: 'Vehicle Check-in & Exit Pay',
    description: 'Manage parking bays with real-time timers. First 30 minutes free, then KES 30/hour. Check in with your plate number and pay on exit via M-Pesa.',
    icon: Car,
    accent: '#a78bfa',
    badge: 'Facility',
    pin: '1234',
    version: '2.0.1',
    size: '3 MB',
  },
  {
    id: 'coldstorage',
    name: 'Cold Storage',
    tagline: 'Cold Room Monitoring & Billing',
    description: 'Live temperature monitoring, weight-based daily billing, and storage alerts across multiple cold rooms. Supports fruits, dairy, and frozen goods.',
    icon: Snowflake,
    accent: '#67e8f9',
    badge: 'Storage',
    pin: '1234',
    version: '1.3.2',
    size: '5 MB',
  },
]

// Cards per page and layout
const CARD_W = 230
const CARD_GAP = 14
const SIDE_PAD = 20
const VISIBLE = 3  // visible cards at once

type PinPhase = 'pin' | 'installing' | 'done'

interface Props {
  installed: string[]
  onInstall: (id: string) => void
  onClose: () => void
}

function PinModal({ app, onSuccess, onClose }: { app: MarketApp; onSuccess: () => void; onClose: () => void }) {
  const [digits, setDigits] = useState('')
  const [phase, setPhase] = useState<PinPhase>('pin')
  const [error, setError] = useState(false)
  const [installPct, setInstallPct] = useState(0)
  const C = app.accent
  const KEYS = ['1','2','3','4','5','6','7','8','9','','0','⌫']

  const handleKey = (k: string) => {
    if (phase !== 'pin') return
    if (k === '⌫') { setDigits(d => d.slice(0, -1)); return }
    if (!k || digits.length >= 4) return
    const next = digits + k
    setDigits(next)
    if (next.length === 4) {
      if (next === app.pin) {
        setPhase('installing')
        let pct = 0
        const iv = setInterval(() => {
          pct += Math.random() * 18 + 8
          if (pct >= 100) { clearInterval(iv); setInstallPct(100); setPhase('done'); setTimeout(onSuccess, 900) }
          else setInstallPct(pct)
        }, 120)
      } else {
        setError(true)
        setTimeout(() => { setDigits(''); setError(false) }, 800)
      }
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.78)', zIndex: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)' }}
    >
      <motion.div
        initial={{ scale: 0.85, y: 28 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.85, y: 28 }}
        transition={{ type: 'spring', stiffness: 320, damping: 28 }}
        style={{ width: 340, borderRadius: 26, background: 'var(--surface)', border: `1.5px solid ${C}45`, boxShadow: `0 40px 80px rgba(0,0,0,0.7), inset 0 0 0 1px rgba(255,255,255,0.04)`, overflow: 'hidden' }}
      >
        <div style={{ height: 3, background: `linear-gradient(90deg, transparent, ${C}, transparent)` }} />
        <div style={{ padding: '22px 24px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18 }}>
          <div style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: 14, background: `linear-gradient(145deg, ${C}30, ${C}10)`, border: `1.5px solid ${C}45`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C, boxShadow: `0 4px 16px ${C}25` }}>
              <app.icon size={22} strokeWidth={1.5} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, color: 'var(--text)', lineHeight: 1 }}>{app.name}</div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 10, color: 'var(--text-muted)', marginTop: 3 }}>Enter 4-digit install PIN</div>
            </div>
            <motion.button whileTap={{ scale: 0.9 }} onClick={onClose}
              style={{ width: 30, height: 30, borderRadius: 9, background: 'var(--surface-2)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-muted)' }}>
              <X size={14} />
            </motion.button>
          </div>

          <AnimatePresence mode="wait">
            {phase === 'pin' && (
              <motion.div key="pin" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
                <motion.div animate={error ? { x: [-10, 10, -8, 8, -4, 4, 0] } : {}} transition={{ duration: 0.4 }} style={{ display: 'flex', gap: 14 }}>
                  {[0,1,2,3].map(i => (
                    <motion.div key={i} animate={{ scale: digits.length === i && !error ? [1, 1.35, 1] : 1 }}
                      style={{ width: 16, height: 16, borderRadius: '50%', background: digits.length > i ? (error ? '#ef4444' : C) : 'var(--surface-2)', border: `2px solid ${digits.length > i ? (error ? '#ef444450' : C + '55') : 'var(--border)'}`, boxShadow: digits.length > i && !error ? `0 0 12px ${C}70` : 'none', transition: 'all 0.15s' }} />
                  ))}
                </motion.div>
                {error && (
                  <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: '#ef4444' }}>
                    Incorrect PIN — try again
                  </motion.div>
                )}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, width: '100%' }}>
                  {KEYS.map((k, i) => (
                    <motion.button key={i} whileTap={k ? { scale: 0.84 } : {}} onClick={() => k && handleKey(k)}
                      style={{ height: 52, borderRadius: 13, cursor: k ? 'pointer' : 'default', background: k === '⌫' ? `${C}18` : k ? 'var(--surface-2)' : 'transparent', border: k ? `1.5px solid ${k === '⌫' ? C + '45' : 'var(--border)'}` : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', color: k === '⌫' ? C : 'var(--text)', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20 }}>
                      {k === '⌫' ? <Delete size={17} strokeWidth={2} /> : k}
                    </motion.button>
                  ))}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 8, background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
                  <ShieldCheck size={12} strokeWidth={1.5} color="var(--text-muted)" />
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: 10, color: 'var(--text-dim)' }}>PIN required to install modules</span>
                </div>
              </motion.div>
            )}
            {phase === 'installing' && (
              <motion.div key="installing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: '12px 0' }}>
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.9, repeat: Infinity, ease: 'linear' }}
                  style={{ width: 48, height: 48, borderRadius: '50%', border: `3px solid ${C}20`, borderTop: `3px solid ${C}`, boxShadow: `0 0 20px ${C}30` }} />
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, color: C }}>Installing {app.name}…</div>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{Math.round(installPct)}%</div>
                </div>
                <div style={{ width: '100%', height: 6, borderRadius: 3, background: 'var(--surface-2)', overflow: 'hidden' }}>
                  <motion.div animate={{ width: `${installPct}%` }} style={{ height: '100%', borderRadius: 3, background: `linear-gradient(90deg, ${C}aa, ${C})`, boxShadow: `0 0 12px ${C}60` }} />
                </div>
              </motion.div>
            )}
            {phase === 'done' && (
              <motion.div key="done" initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 320, damping: 20 }} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: '16px 0' }}>
                <motion.div animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 0.4 }} style={{ color: C }}>
                  <CheckCircle size={56} strokeWidth={1.4} />
                </motion.div>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, color: C }}>{app.name} installed!</div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default function Marketplace({ installed, onInstall, onClose }: Props) {
  const [pinApp, setPinApp] = useState<MarketApp | null>(null)
  const [page, setPage] = useState(0)
  const totalPages = Math.ceil(MARKET_APPS.length / VISIBLE)
  const x = useMotionValue(0)
  const containerRef = useRef<HTMLDivElement>(null)

  const pageWidth = VISIBLE * CARD_W + (VISIBLE - 1) * CARD_GAP

  const snapToPage = (p: number) => {
    const clampedPage = Math.max(0, Math.min(totalPages - 1, p))
    setPage(clampedPage)
    animate(x, -(clampedPage * (CARD_W + CARD_GAP) * VISIBLE), { type: 'spring', stiffness: 300, damping: 30 })
  }

  const handleDragEnd = (_: unknown, info: { offset: { x: number } }) => {
    if (info.offset.x < -50) snapToPage(page + 1)
    else if (info.offset.x > 50) snapToPage(page - 1)
    else snapToPage(page)
  }

  const handleInstalled = () => {
    if (!pinApp) return
    onInstall(pinApp.id)
    setTimeout(() => setPinApp(null), 1000)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: 'absolute', inset: 0, background: 'var(--bg)', zIndex: 20, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
    >
      {/* Ambient */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'radial-gradient(ellipse 600px 400px at 50% 40%, #ff6eb406 0%, transparent 65%)' }} />

      {/* Header */}
      <div style={{ position: 'relative', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 20px', borderBottom: '1px solid var(--border)', background: 'var(--surface)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 30, height: 30, borderRadius: 9, background: 'linear-gradient(135deg, #ff6eb4, #b48aff)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px #ff6eb430' }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <rect x="1" y="1" width="5" height="5" rx="1.5" fill="#fff" />
              <rect x="8" y="1" width="5" height="5" rx="1.5" fill="#fff" fillOpacity=".7" />
              <rect x="1" y="8" width="5" height="5" rx="1.5" fill="#fff" fillOpacity=".7" />
              <rect x="8" y="8" width="5" height="5" rx="1.5" fill="#fff" fillOpacity=".5" />
            </svg>
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, color: 'var(--text)', lineHeight: 1 }}>Module Marketplace</div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>
              {installed.length}/{MARKET_APPS.length} installed · Swipe or tap arrows
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Page arrows */}
          <motion.button whileTap={{ scale: 0.88 }} onClick={() => snapToPage(page - 1)}
            style={{ width: 30, height: 30, borderRadius: 9, background: page > 0 ? 'var(--surface-2)' : 'transparent', border: page > 0 ? '1px solid var(--border)' : '1px solid transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: page > 0 ? 'pointer' : 'default', color: page > 0 ? 'var(--text)' : 'var(--text-dim)' }}>
            <ChevronLeft size={16} />
          </motion.button>
          <motion.button whileTap={{ scale: 0.88 }} onClick={() => snapToPage(page + 1)}
            style={{ width: 30, height: 30, borderRadius: 9, background: page < totalPages - 1 ? 'var(--surface-2)' : 'transparent', border: page < totalPages - 1 ? '1px solid var(--border)' : '1px solid transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: page < totalPages - 1 ? 'pointer' : 'default', color: page < totalPages - 1 ? 'var(--text)' : 'var(--text-dim)' }}>
            <ChevronRight size={16} />
          </motion.button>
          <motion.button whileTap={{ scale: 0.9 }} onClick={onClose}
            style={{ width: 34, height: 34, borderRadius: 10, background: 'var(--surface-2)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-muted)', marginLeft: 4 }}>
            <X size={16} />
          </motion.button>
        </div>
      </div>

      {/* Swipeable cards */}
      <div
        ref={containerRef}
        style={{ flex: 1, overflow: 'hidden', position: 'relative', zIndex: 10, padding: `16px ${SIDE_PAD}px 12px` }}
      >
        <motion.div
          drag="x"
          dragConstraints={{ left: -(MARKET_APPS.length - VISIBLE) * (CARD_W + CARD_GAP), right: 0 }}
          dragElastic={0.12}
          onDragEnd={handleDragEnd}
          style={{ x, display: 'flex', gap: CARD_GAP, cursor: 'grab', height: '100%' }}
          whileDrag={{ cursor: 'grabbing' }}
        >
          {MARKET_APPS.map((app, i) => {
            const isInstalled = installed.includes(app.id)
            return (
              <motion.div
                key={app.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06, type: 'spring', stiffness: 260, damping: 24 }}
                style={{ width: CARD_W, flexShrink: 0, height: '100%', position: 'relative' }}
              >
                {/* Card */}
                <div style={{
                  height: '100%', borderRadius: 20, position: 'relative', overflow: 'hidden',
                  background: `linear-gradient(160deg, ${app.accent}18 0%, var(--surface) 50%)`,
                  border: `1.5px solid ${isInstalled ? app.accent + '55' : 'var(--border)'}`,
                  boxShadow: isInstalled ? `0 8px 32px ${app.accent}22` : '0 2px 12px rgba(0,0,0,0.25)',
                  display: 'flex', flexDirection: 'column',
                  transition: 'border-color 0.2s',
                }}>
                  {/* Top accent bar */}
                  <div style={{ height: 2, background: `linear-gradient(90deg, transparent, ${app.accent}70, transparent)`, flexShrink: 0 }} />

                  {/* Arc decorations */}
                  <div style={{ position: 'absolute', top: -40, right: -40, width: 130, height: 130, borderRadius: '50%', border: `1px solid ${app.accent}12`, pointerEvents: 'none' }} />
                  <div style={{ position: 'absolute', top: -20, right: -20, width: 80, height: 80, borderRadius: '50%', border: `1px solid ${app.accent}08`, pointerEvents: 'none' }} />

                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '18px 18px 16px', position: 'relative', zIndex: 1 }}>
                    {/* Icon */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
                      <div style={{ width: 56, height: 56, borderRadius: 16, background: `linear-gradient(145deg, ${app.accent}30, ${app.accent}0e)`, border: `1.5px solid ${app.accent}45`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: app.accent, boxShadow: `0 6px 20px ${app.accent}28` }}>
                        <app.icon size={28} strokeWidth={1.4} />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 5 }}>
                        <span style={{ padding: '3px 8px', borderRadius: 7, background: `${app.accent}18`, border: `1px solid ${app.accent}30`, fontFamily: 'var(--font-body)', fontSize: 9, fontWeight: 700, color: app.accent, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                          {app.badge}
                        </span>
                        {isInstalled && (
                          <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 400 }}
                            style={{ padding: '3px 8px', borderRadius: 7, background: '#00e5a018', border: '1px solid #00e5a040', fontFamily: 'var(--font-body)', fontSize: 9, fontWeight: 700, color: '#00e5a0' }}>
                            ✓ Installed
                          </motion.span>
                        )}
                      </div>
                    </div>

                    {/* Name */}
                    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, color: 'var(--text)', lineHeight: 1, marginBottom: 5 }}>{app.name}</div>

                    {/* Tagline */}
                    <div style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 10, color: app.accent, marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{app.tagline}</div>

                    {/* Description */}
                    <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.6, flex: 1 }}>
                      {app.description}
                    </div>

                    {/* Divider */}
                    <div style={{ height: 1, background: `linear-gradient(90deg, ${app.accent}20, transparent)`, margin: '12px 0' }} />

                    {/* Meta row */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                      <div style={{ display: 'flex', gap: 10 }}>
                        <span style={{ fontFamily: 'var(--font-body)', fontSize: 10, color: 'var(--text-dim)' }}>v{app.version}</span>
                        <span style={{ fontFamily: 'var(--font-body)', fontSize: 10, color: 'var(--text-dim)' }}>{app.size}</span>
                      </div>
                      <div style={{ width: 5, height: 5, borderRadius: '50%', background: isInstalled ? '#00e5a0' : 'var(--border)', boxShadow: isInstalled ? '0 0 6px #00e5a0' : 'none' }} />
                    </div>

                    {/* Get button */}
                    <motion.button
                      whileTap={!isInstalled ? { scale: 0.94 } : {}}
                      onClick={() => !isInstalled && setPinApp(app)}
                      style={{
                        width: '100%', padding: '12px', borderRadius: 13, cursor: isInstalled ? 'default' : 'pointer',
                        background: isInstalled ? 'var(--surface-2)' : `linear-gradient(135deg, ${app.accent}, ${app.accent}bb)`,
                        border: isInstalled ? '1px solid var(--border)' : 'none',
                        color: isInstalled ? 'var(--text-muted)' : '#000',
                        fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13,
                        boxShadow: isInstalled ? 'none' : `0 4px 18px ${app.accent}45`,
                        transition: 'all 0.15s',
                      }}
                    >
                      {isInstalled ? '✓ Installed' : `Get ${app.name}`}
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </motion.div>
      </div>

      {/* Page dots */}
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6, paddingBottom: 12, position: 'relative', zIndex: 10 }}>
        {Array.from({ length: totalPages }, (_, i) => (
          <motion.button key={i} onClick={() => snapToPage(i)}
            animate={{ width: page === i ? 20 : 6, background: page === i ? '#ff6eb4' : 'var(--border)' }}
            style={{ height: 6, borderRadius: 3, cursor: 'pointer', border: 'none' }}
          />
        ))}
      </div>

      {/* PIN modal */}
      <AnimatePresence>
        {pinApp && <PinModal app={pinApp} onSuccess={handleInstalled} onClose={() => setPinApp(null)} />}
      </AnimatePresence>
    </motion.div>
  )
}
