import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLockStore } from '../store/lockStore'

function useClock() {
  const [now, setNow] = useState(new Date())
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(t)
  }, [])
  return now
}

// ── Atomic PayTraq logo ──────────────────────────────────────────────────────
// Three tilted orbital rings + electrons orbiting the central P
function AtomicLogo() {
  // Each orbit: { tiltX, tiltY, tiltZ, dur, delay, color, radius }
  const ORBITS = [
    { tiltX: 70,  tiltY:  0, tiltZ: 15,  dur: 3.2, delay: 0,   color: '#00e5a0', radius: 56 },
    { tiltX: 20,  tiltY: 60, tiltZ:-30,  dur: 4.1, delay: 0.8, color: '#38d4ff', radius: 56 },
    { tiltX: 10,  tiltY:-50, tiltZ: 60,  dur: 5.0, delay: 1.6, color: '#b48aff', radius: 56 },
  ]

  return (
    <div style={{ position: 'relative', width: 130, height: 130, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {/* Orbital rings (static SVG ellipses, tilted with CSS 3D) */}
      {ORBITS.map((o, i) => (
        <div
          key={i}
          style={{
            position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
            transform: `rotateX(${o.tiltX}deg) rotateY(${o.tiltY}deg) rotateZ(${o.tiltZ}deg)`,
            pointerEvents: 'none',
          }}
        >
          <div style={{ width: 116, height: 116, borderRadius: '50%',
            border: `1px solid ${o.color}40`,
            boxShadow: `0 0 8px ${o.color}20`,
          }} />
        </div>
      ))}

      {/* Orbiting electrons — each on a 0×0 rotating parent div */}
      {ORBITS.map((o, i) => (
        <div
          key={i}
          style={{
            position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
            transform: `rotateX(${o.tiltX}deg) rotateY(${o.tiltY}deg) rotateZ(${o.tiltZ}deg)`,
          }}
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: o.dur, delay: o.delay, repeat: Infinity, ease: 'linear' }}
            style={{ width: 0, height: 0, position: 'relative' }}
          >
            {/* Electron dot at radius from center */}
            <div style={{
              position: 'absolute',
              left: o.radius,
              top: -4,
              width: 8, height: 8, borderRadius: '50%',
              background: o.color,
              boxShadow: `0 0 10px ${o.color}, 0 0 20px ${o.color}80`,
            }} />
          </motion.div>
        </div>
      ))}

      {/* Nucleus glow */}
      <motion.div
        animate={{ opacity: [0.4, 0.8, 0.4], scale: [0.95, 1.05, 0.95] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          position: 'absolute', width: 68, height: 68, borderRadius: '50%',
          background: 'radial-gradient(circle, #00e5a030 0%, transparent 70%)',
          boxShadow: '0 0 30px #00e5a040, 0 0 60px #00e5a015',
          pointerEvents: 'none',
        }}
      />

      {/* Central P — PayPal-style large rounded letterform */}
      <div style={{
        position: 'relative', zIndex: 10,
        width: 52, height: 52, borderRadius: '50%',
        background: 'linear-gradient(145deg, #1a2a3a, #0c1620)',
        border: '2px solid #00e5a050',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 4px 24px #00e5a030, inset 0 1px 0 #00e5a040',
      }}>
        <span style={{
          fontFamily: 'Nunito, var(--font-body)',
          fontWeight: 900,
          fontSize: 28,
          letterSpacing: '-1px',
          lineHeight: 1,
          background: 'linear-gradient(145deg, #e8f4ff 0%, #00e5a0 60%, #38d4ff 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}>P</span>
      </div>
    </div>
  )
}

// ── Floating ambient orb ─────────────────────────────────────────────────────
function Orb({ x, y, size, color, dur, delay }: { x: number; y: number; size: number; color: string; dur: number; delay: number }) {
  return (
    <motion.div
      animate={{
        x: [x, x + 60, x - 40, x + 20, x],
        y: [y, y - 50, y + 40, y - 30, y],
        scale: [1, 1.15, 0.9, 1.1, 1],
        opacity: [0.35, 0.55, 0.3, 0.5, 0.35],
      }}
      transition={{ duration: dur, delay, repeat: Infinity, ease: 'easeInOut' }}
      style={{
        position: 'absolute',
        left: x, top: y,
        width: size, height: size,
        borderRadius: '50%',
        background: `radial-gradient(circle, ${color}80 0%, ${color}00 70%)`,
        pointerEvents: 'none',
        filter: 'blur(2px)',
      }}
    />
  )
}

// Concentric pulse ring
function PulseRing({ delay }: { delay: number }) {
  return (
    <motion.div
      initial={{ scale: 0.6, opacity: 0.6 }}
      animate={{ scale: 2.2, opacity: 0 }}
      transition={{ duration: 2.8, delay, repeat: Infinity, ease: 'easeOut' }}
      style={{
        position: 'absolute',
        width: 120, height: 120,
        borderRadius: '50%',
        border: '1.5px solid #00e5a040',
        pointerEvents: 'none',
      }}
    />
  )
}

// Floating star/particle
function Particle({ x, y, delay }: { x: number; y: number; delay: number }) {
  return (
    <motion.div
      animate={{ opacity: [0, 0.8, 0], scale: [0.5, 1, 0.5] }}
      transition={{ duration: 3 + Math.random() * 2, delay, repeat: Infinity, ease: 'easeInOut' }}
      style={{
        position: 'absolute',
        left: x, top: y,
        width: 2, height: 2,
        borderRadius: '50%',
        background: '#ffffff',
        pointerEvents: 'none',
      }}
    />
  )
}

const ORBS = [
  { x: -60,  y: -40,  size: 320, color: '#00e5a0', dur: 12, delay: 0 },
  { x: 480,  y: 20,   size: 280, color: '#b48aff', dur: 15, delay: 2 },
  { x: 200,  y: 280,  size: 240, color: '#38d4ff', dur: 10, delay: 4 },
  { x: 580,  y: 300,  size: 200, color: '#ff9044', dur: 13, delay: 1 },
  { x: 100,  y: 380,  size: 180, color: '#ff6eb4', dur: 11, delay: 3 },
]

const PARTICLES = Array.from({ length: 28 }, (_, i) => ({
  x: Math.floor(Math.random() * 760 + 20),
  y: Math.floor(Math.random() * 420 + 20),
  delay: i * 0.4,
}))

export default function LockScreen() {
  const { isLocked, unlock } = useLockStore()
  const now = useClock()

  const timeStr = now.toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit' })
  const secStr  = now.toLocaleTimeString('en-KE', { second: '2-digit' }).slice(-2)
  const dateStr = now.toLocaleDateString('en-KE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <AnimatePresence>
      {isLocked && (
        <motion.div
          key="lock"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.04 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
          onPointerDown={() => unlock()}
          style={{
            position: 'absolute', inset: 0, zIndex: 200,
            background: '#040608',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexDirection: 'column',
            cursor: 'pointer',
            overflow: 'hidden',
          }}
        >
          {/* Ambient orbs */}
          {ORBS.map((o, i) => <Orb key={i} {...o} />)}

          {/* Particles */}
          {PARTICLES.map((p, i) => <Particle key={i} {...p} />)}

          {/* Grid lines — subtle tech feel */}
          <div style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
          }} />

          {/* Center content */}
          <motion.div
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0, position: 'relative', zIndex: 10 }}
          >
            {/* Pulse rings behind clock */}
            <div style={{ position: 'absolute', display: 'flex', alignItems: 'center', justifyContent: 'center', inset: 0, zIndex: 0 }}>
              <PulseRing delay={0} />
              <PulseRing delay={1.4} />
            </div>

            {/* Atomic logo */}
            <div style={{ position: 'relative', zIndex: 1, marginBottom: 10 }}>
              <AtomicLogo />
            </div>

            {/* PayTraq brand — PayPal-style rounded bold wordmark */}
            <motion.div
              animate={{ opacity: [0.85, 1, 0.85] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              style={{ position: 'relative', zIndex: 1, marginBottom: 10, display: 'flex', alignItems: 'baseline', gap: 0, lineHeight: 1 }}
            >
              <span style={{
                fontFamily: 'Nunito, var(--font-body)', fontWeight: 900, fontSize: 36,
                letterSpacing: '-1.5px', lineHeight: 1,
                background: 'linear-gradient(135deg, #e8f4ff 0%, #cce8ff 100%)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              }}>Pay</span>
              <span style={{
                fontFamily: 'Nunito, var(--font-body)', fontWeight: 900, fontSize: 36,
                letterSpacing: '-1.5px', lineHeight: 1,
                background: 'linear-gradient(135deg, #00e5a0 0%, #38d4ff 100%)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              }}>Traq</span>
            </motion.div>

            {/* Time */}
            <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'flex-end', gap: 6, lineHeight: 1 }}>
              <motion.div
                key={timeStr}
                initial={{ opacity: 0.6 }}
                animate={{ opacity: 1 }}
                style={{
                  fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 88,
                  color: '#ffffff',
                  textShadow: '0 0 40px #00e5a050, 0 0 80px #00e5a020',
                  letterSpacing: '-2px',
                  lineHeight: 1,
                }}
              >
                {timeStr}
              </motion.div>
              <motion.div
                key={secStr}
                initial={{ opacity: 0 }} animate={{ opacity: 0.45 }}
                style={{
                  fontFamily: 'var(--font-display)', fontWeight: 400, fontSize: 28,
                  color: '#ffffff', marginBottom: 8,
                }}
              >
                :{secStr}
              </motion.div>
            </div>

            {/* Date */}
            <div style={{
              fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 14,
              color: 'rgba(255,255,255,0.45)',
              marginTop: 4,
              letterSpacing: '0.04em',
              position: 'relative', zIndex: 1,
            }}>
              {dateStr}
            </div>

            {/* Divider */}
            <motion.div
              animate={{ scaleX: [0.4, 1, 0.4], opacity: [0.3, 0.7, 0.3] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              style={{
                width: 200, height: 1,
                background: 'linear-gradient(90deg, transparent, #00e5a080, transparent)',
                marginTop: 20, marginBottom: 16,
                position: 'relative', zIndex: 1,
              }}
            />

            {/* Touch prompt */}
            <motion.div
              animate={{ opacity: [0.4, 0.9, 0.4] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
              style={{
                fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 13,
                color: 'rgba(255,255,255,0.5)',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                position: 'relative', zIndex: 1,
                display: 'flex', alignItems: 'center', gap: 8,
              }}
            >
              <motion.span
                animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: '#00e5a0' }}
              />
              Touch anywhere to begin
              <motion.span
                animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: 0.75 }}
                style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: '#00e5a0' }}
              />
            </motion.div>
          </motion.div>

          {/* Bottom brand */}
          <div style={{
            position: 'absolute', bottom: 16,
            fontFamily: 'var(--font-display)', fontSize: 10,
            color: 'rgba(255,255,255,0.18)',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            zIndex: 10,
          }}>
            Paytraq · Self-Service Terminal
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
