import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import BackButton from '../../../components/BackButton'
import MpesaCheckout from '../../../components/MpesaCheckout'

interface Package {
  id: string
  name: string
  duration: string
  price: number
  features: string[]
  highlight?: boolean
}

const ACCENT = '#f59e0b'
const PACKAGES: Package[] = [
  { id: 'daily',   name: 'Daily',   duration: '24 hours', price: 5000,  features: ['50+ channels', 'HD quality', 'Sports & News'] },
  { id: 'weekly',  name: 'Weekly',  duration: '7 days',   price: 25000, features: ['50+ channels', 'HD quality', 'Sports & News', 'Movies'], highlight: true },
  { id: 'monthly', name: 'Monthly', duration: '30 days',  price: 80000, features: ['80+ channels', 'Full HD', 'All genres', 'Priority support'] },
]

type View = 'select' | 'checkout' | 'done'

export default function AflaBox() {
  const [selected, setSelected] = useState<Package | null>(null)
  const [view, setView] = useState<View>('select')
  const fmt = (n: number) => `KES ${(n / 100).toFixed(2)}`

  if (view === 'done') {
    return (
      <motion.div
        style={{ width: 800, height: 480, background: 'var(--bg)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, position: 'relative' }}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      >
        <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse 400px 300px at 50% 50%, ${ACCENT}12 0%, transparent 70%)`, pointerEvents: 'none' }} />
        <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring' }}
          style={{ fontSize: 64 }}>📺</motion.div>
        <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 22, color: ACCENT, margin: 0 }}>AflaBox Activated!</p>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text-muted)', margin: 0 }}>Your {selected?.name} package is now active</p>
      </motion.div>
    )
  }

  return (
    <motion.div
      style={{ width: 800, height: 480, background: 'var(--bg)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
    >
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: `radial-gradient(ellipse 500px 300px at 50% 50%, ${ACCENT}0c 0%, transparent 70%)` }} />
      <div style={{ position: 'absolute', top: 16, left: 16 }}><BackButton to="/addons" /></div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18, width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: `${ACCENT}20`, border: `1px solid ${ACCENT}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>📺</div>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, color: ACCENT, margin: 0 }}>AflaBox</h1>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--text-muted)', margin: 0 }}>Streaming packages</p>
          </div>
        </div>

        {/* Package cards */}
        <div style={{ display: 'flex', gap: 14 }}>
          {PACKAGES.map(pkg => (
            <motion.button key={pkg.id} whileTap={{ scale: 0.95 }} onClick={() => setSelected(pkg)}
              style={{
                width: 188, padding: '18px 16px', borderRadius: 18, cursor: 'pointer',
                background: selected?.id === pkg.id ? `${ACCENT}18` : 'var(--surface)',
                border: `${selected?.id === pkg.id ? 2 : 1.5}px solid ${selected?.id === pkg.id ? ACCENT + '80' : pkg.highlight ? ACCENT + '30' : 'var(--border)'}`,
                display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 6,
                position: 'relative', overflow: 'hidden',
                boxShadow: selected?.id === pkg.id ? `0 8px 24px ${ACCENT}25` : pkg.highlight ? `0 4px 16px ${ACCENT}15` : 'none',
                transition: 'all 0.15s',
              }}>
              {pkg.highlight && (
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, transparent, ${ACCENT}, transparent)` }} />
              )}
              {pkg.highlight && (
                <div style={{ position: 'absolute', top: 8, right: 10, padding: '2px 8px', borderRadius: 6, background: ACCENT, fontFamily: 'var(--font-display)', fontSize: 9, fontWeight: 700, color: '#000' }}>
                  POPULAR
                </div>
              )}
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, color: ACCENT }}>{pkg.name}</span>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--text-muted)' }}>{pkg.duration}</span>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20, color: 'var(--text)' }}>{fmt(pkg.price)}</span>
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: 8, width: '100%', display: 'flex', flexDirection: 'column', gap: 3 }}>
                {pkg.features.map(f => (
                  <span key={f} style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--text-dim)' }}>
                    <span style={{ color: ACCENT }}>✓</span> {f}
                  </span>
                ))}
              </div>
            </motion.button>
          ))}
        </div>

        {/* CTA */}
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={() => selected && setView('checkout')}
          style={{
            padding: '13px 40px', borderRadius: 14, cursor: selected ? 'pointer' : 'default',
            background: selected ? `linear-gradient(135deg, ${ACCENT}, #d97706)` : 'var(--surface-2)',
            border: selected ? 'none' : '1px solid var(--border)',
            color: selected ? '#000' : 'var(--text-muted)',
            fontFamily: 'var(--font-body)', fontWeight: 800, fontSize: 14,
            boxShadow: selected ? `0 6px 24px ${ACCENT}40` : 'none',
            transition: 'all 0.2s',
          }}>
          {selected ? `Subscribe — ${fmt(selected.price)}` : 'Select a package'}
        </motion.button>
      </div>

      <AnimatePresence>
        {view === 'checkout' && selected && (
          <MpesaCheckout amount={selected.price} description={`AflaBox ${selected.name} Package`} onSuccess={() => setView('done')} onCancel={() => setView('select')} />
        )}
      </AnimatePresence>
    </motion.div>
  )
}
